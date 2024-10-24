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

const VIEW_ID = 'v-collab_bar.chat';

export class ChatPanelProvider implements WebviewViewProvider, Disposable {
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
      this.view?.webview.postMessage({
        source: 'vscode',
        store: 'RootStore',
        command: 'webviewCallbackKey',
        webviewCallbackKey: message.webviewCallbackKey,
        data: {
          version: this.rootStore.extensionVersion(),
        },
      });
    }
    if (message.command === 'openInputFile') {
      this.openInputFile(message.data.file);
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
    const editor = window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
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
    const file = new TopicFileInput(f);
    const document = await workspace.openTextDocument(file.path);
    window.showTextDocument(document);
    console.log('document', document);
    console.log('file', file);
    if (file.isSelection) {
      const editor = window.activeTextEditor;
      console.log('editor', editor);
      if (editor) {
        const start = document.lineAt(Math.max(0, Number(file.start) - 1));
        const end = document.lineAt(Math.max(0, Number(file.end) - 1));
        editor.selection = new Selection(start.range.start, end.range.end);
        console.log('editor.selection', editor.selection);
      }
    }
  };
}
