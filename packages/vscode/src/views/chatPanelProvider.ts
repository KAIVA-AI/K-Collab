import {
  WebviewViewProvider,
  WebviewView,
  window,
  Disposable,
  commands,
  env,
} from 'vscode';
import { ITopicFileInput, IWebviewMessage } from '@v-collab/common';
import { RootStore } from '../stores';
import { AddFileCommand, AddSelectionCommand } from '../commands';

const VIEW_ID = 'v-collab_bar.chat';

export class ChatPanelProvider implements WebviewViewProvider, Disposable {
  private view?: WebviewView;
  readonly #webProvider: Disposable;

  constructor(private rootStore: RootStore) {
    this.#webProvider = window.registerWebviewViewProvider(VIEW_ID, this, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    });
  }

  public async resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView;
    this.view.webview.options = {
      enableScripts: true,
    };
    this.view.webview.html = '';
    const url = 'http://localhost:3000';
    this.view.webview.onDidReceiveMessage(this.#onMessageFromWebview);
    this.view.webview.html = await fetch(url).then(response => response.text());
  }

  public dispose() {
    this.#webProvider.dispose();
  }

  public register(): Disposable {
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
}
