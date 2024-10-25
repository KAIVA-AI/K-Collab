import {
  WebviewViewProvider,
  WebviewView,
  window,
  Disposable,
  commands,
  env,
  workspace,
  Selection,
} from 'vscode';
import { ITopicFileInput, IWebviewMessage, TopicFileInput } from '../models';
import { RootStore } from '../stores';
import { AddFileCommand, AddSelectionCommand } from '../commands';
import { ZulipService, IZulipEvent, Constants } from '@v-collab/common';
import { IBaseWebview } from './baseWebview';

const VIEW_ID = 'v-collab_bar.chat';

export class ChatPanelProvider
  implements WebviewViewProvider, IBaseWebview, Disposable
{
  private view?: WebviewView;
  readonly #webProvider: Disposable;
  private zulipService: ZulipService;

  constructor(private rootStore: RootStore) {
    this.#webProvider = window.registerWebviewViewProvider(VIEW_ID, this, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    });
    this.zulipService = new ZulipService(Constants.REALM_STRING);
    this.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
  }

  public async resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView;
    this.view.webview.options = {
      enableScripts: true,
    };
    this.view.webview.html = '';
    const url = `${Constants.WEB_URL}/?nonce=${Date.now()}`;
    this.view.webview.onDidReceiveMessage(this.#onMessageFromWebview);
    this.view.webview.html = await fetch(url).then(response => response.text());
  }

  public dispose() {
    this.#webProvider.dispose();
    this.zulipService.removeEventListener(VIEW_ID);
  }

  public register(): Disposable {
    this.zulipService.addEventListener(VIEW_ID, this.#onZulipEventMessage);
    this.zulipService.subscribeEventQueue();
    return this.#webProvider;
  }

  #onMessageFromWebview = (message: IWebviewMessage) => {
    if (message?.source !== 'webview') {
      return;
    }
    if (message.command === 'selectAddContextMethod') {
      this.selectAddContextMethod();
    }
    if (message.command === 'insertMessage') {
      this.insertMessageToEditor(message.data.content);
    }
    if (message.command === 'copyMessage') {
      this.copyMessageToClipboard(message.data.content);
    }
    if (message.command === 'getExtensionVersion') {
      this.getExtensionVersion(message);
    }
    if (message.command === 'openInputFile') {
      this.openInputFile(message.data.file);
    }
    if (message.command === 'getPageRouter') {
      this.getPageRouter(message);
    }
  };

  #onZulipEventMessage = (event: IZulipEvent) => {
    this.view?.webview.postMessage({
      source: 'vscode',
      store: 'MessageStore',
      command: 'onZulipEventMessage',
      data: {
        event,
      },
    });
  };

  addFileToTopic = (file: ITopicFileInput) => {
    this.view?.webview.postMessage({
      source: 'vscode',
      store: 'TopicStore',
      command: 'addFileToTopic',
      data: {
        file,
      },
    });
  };

  selectAddContextMethod = async () => {
    const options = [];
    const editor = window.activeTextEditor;
    const hasSelection = !editor?.selection.isEmpty;
    if (hasSelection) {
      options.push(AddSelectionCommand.COMMAND_TITLE);
    }
    options.push(AddFileCommand.COMMAND_TITLE);
    const selection = await window.showQuickPick(options);
    if (selection === AddSelectionCommand.COMMAND_TITLE) {
      commands.executeCommand(AddSelectionCommand.COMMAND_ID);
    }
    if (selection === AddFileCommand.COMMAND_TITLE) {
      commands.executeCommand(AddFileCommand.COMMAND_ID);
    }
  };


  insertMessageToEditor = (message: string) => {
    // TODO wait for preview panel to be implemented
    // this.rootStore.previewPanelProvider.show(message);
    const editor = window.activeTextEditor;
    if (editor) {
      // const pick = await window.showInformationMessage(
      //   'Code generation is done.',
      //   'Accept',
      //   'Reject',
      // );
      // if (pick === 'Accept') {
      //   console.log('DO ACCEPT');
      // } else if (pick === 'Reject') {
      //   this.dispose();
      // }
      editor.edit(editBuilder => {
        console.log(
          `CONTENT REPLACE AT ${editor.selection.start.line}/${editor.selection.start.character}: ${editor.selection.end.line}/${editor.selection.end.character} value : ${message}`,
        );
        editBuilder.insert(editor.selection.start, message);
      });
    }
  };

  copyMessageToClipboard = (message: string) => {
    env.clipboard.writeText(message);
  };

  backToTopicPage = () => {
    this.view?.webview.postMessage({
      source: 'vscode',
      store: 'TopicStore',
      command: 'backToTopicPage',
      data: {},
    });
  };

  startNewTopic = ({
    topic,
    file,
    content,
  }: {
    topic: string;
    file?: ITopicFileInput;
    content?: string;
  }) => {
    this.view?.webview.postMessage({
      source: 'vscode',
      store: 'TopicStore',
      command: 'startNewTopic',
      data: {
        topic,
        file,
        content,
      },
    });
  };

  openInputFile = async (f: ITopicFileInput) => {
    try {
      const file = new TopicFileInput(f);
      const document = await workspace.openTextDocument(file.path);
      window.showTextDocument(document);
      if (file.isSelection) {
        const editor = window.activeTextEditor;
        if (editor) {
          const start = document.lineAt(Math.max(0, Number(file.start) - 1));
          const end = document.lineAt(Math.max(0, Number(file.end) - 1));
          editor.selection = new Selection(start.range.start, end.range.end);
        }
      }
    } catch {
      // file not found
    }
  };

  getExtensionVersion = (message: IWebviewMessage) => {
    this.view?.webview.postMessage({
      source: 'vscode',
      store: 'RootStore',
      command: 'webviewCallbackKey',
      webviewCallbackKey: message.webviewCallbackKey,
      data: {
        version: this.rootStore.extensionVersion(),
      },
    });
  };

  getPageRouter = (message: IWebviewMessage) => {
    this.view?.webview.postMessage({
      source: 'vscode',
      store: 'RootStore',
      command: 'webviewCallbackKey',
      webviewCallbackKey: message.webviewCallbackKey,
      data: {
        pageRouter: 'chat-panel',
      },
    });
  };
}
