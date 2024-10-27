import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  window,
  Disposable,
  commands,
  env,
  workspace,
  Selection,
  Uri,
  Range,
  ViewColumn,
} from 'vscode';
import { ITopicFileInput, IWebviewMessage, TopicFileInput } from '../models';
import { RootStore } from '../stores';
import { AddFileCommand, AddSelectionCommand } from '../commands';
import { ZulipService, IZulipEvent, Constants } from '@v-collab/common';
import { IBaseWebview } from './baseWebview';
import * as path from 'path';
import { MemoryFileProvider } from 'src/providers/memoryFileProvider';

const VIEW_ID = 'v-collab_bar.chat';

export class ChatPanelProvider
  extends IBaseWebview
  implements WebviewViewProvider
{
  private view?: Webview;
  readonly #webProvider: Disposable;
  private zulipService: ZulipService;

  constructor(public rootStore: RootStore) {
    super(rootStore);
    this.#webProvider = window.registerWebviewViewProvider(VIEW_ID, this, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    });
    this.zulipService = new ZulipService(Constants.REALM_STRING);
  }

  async resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView.webview;
    this.loadWebview();
  }

  register = (): Disposable => {
    this.zulipService.addEventListener(VIEW_ID, this.#onZulipEventMessage);
    return this.#webProvider;
  };

  getWebview = () => this.view!;
  getPageRouter = () => 'chat-panel';
  messageHandler = () => ({
    selectAddContextMethod: this.selectAddContextMethod,
    previewChange: this.previewChange,
    insertMessage: this.insertMessageToEditor,
    copyMessage: this.copyMessageToClipboard,
    openInputFile: this.openInputFile,
    getToken: this.getToken,
    onLoggedIn: this.onLoggedIn,
    onLoggedOut: this.onLoggedOut,
    onLoggedInTest: this.onLoggedInTest,
  });

  #onZulipEventMessage = (event: IZulipEvent) => {
    this.postMessageToWebview({
      store: 'MessageStore',
      command: 'onZulipEventMessage',
      data: {
        event,
      },
    });
  };

  addFileToTopic = (file: ITopicFileInput) => {
    this.postMessageToWebview({
      store: 'TopicStore',
      command: 'addFileToTopic',
      data: {
        file,
      },
    });
  };

  private selectAddContextMethod = async () => {
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

  private previewChange = async (message: IWebviewMessage) => {
    await this.rootStore.memoryFileProvider.closeAllPreviewTabs();
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage('No active editor found');
      return;
    }
    const newContent: string = message.data.content;
    let startLine: number = 1;
    let endLine: number = 1;
    let oldContent = '';
    // if no selecting, get the whole line
    if (editor.selection.isEmpty) {
      startLine = 1;
      endLine = editor.document.lineCount;
      oldContent = editor.document.getText();
    } else {
      startLine = editor.selection.start.line + 1;
      endLine = editor.selection.end.line + 1;
      const lineStart = editor.document.lineAt(startLine - 1).range.start;
      const lineEnd = editor.document.lineAt(endLine - 1).range.end;
      oldContent = editor.document.getText(new Range(lineStart, lineEnd));
    }
    this.showDiffUsingVSCodeDiff(
      editor.document.uri,
      oldContent,
      newContent,
      startLine,
      endLine,
    );
  };

  private showDiffUsingVSCodeDiff = async (
    originUri: Uri,
    oldContent: string,
    newContent: string,
    startLine: number,
    endLine: number,
  ) => {
    const fileName = path.basename(originUri.fsPath);
    const title = `Review changes in ${fileName}`;
    const fileId = `${Date.now()}_${fileName}`;
    this.rootStore.memoryFileProvider.addDocument(
      fileId.toString(),
      originUri,
      oldContent,
      newContent,
      startLine,
      endLine,
    );
    const tempOldUri = MemoryFileProvider.getUri(fileId.toString(), 'orig');
    const tempNewUri = MemoryFileProvider.getUri(fileId.toString(), 'new');

    await commands.executeCommand(
      'vscode.diff',
      tempOldUri,
      tempNewUri,
      title,
      {
        viewColumn: ViewColumn.Beside,
        preview: true,
      },
    );
    // TODO when diffEditor/gutter api is available, using gutter to apply changes instead of dialog
  };

  private insertMessageToEditor = (message: IWebviewMessage) => {
    const editor = window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.start, message.data.content);
      });
    }
  };

  private copyMessageToClipboard = (message: IWebviewMessage) => {
    env.clipboard.writeText(message.data.content);
  };

  backToTopicPage = () => {
    this.postMessageToWebview({
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
    this.postMessageToWebview({
      store: 'TopicStore',
      command: 'startNewTopic',
      data: {
        topic,
        file,
        content,
      },
    });
  };

  private openInputFile = async (message: IWebviewMessage) => {
    try {
      const file = new TopicFileInput(message.data.file as ITopicFileInput);
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

  private getToken = (message: IWebviewMessage) => {
    const token = this.rootStore.authStore.getToken();
    this.postMessageToWebview({
      store: 'RootStore',
      command: 'webviewCallbackKey',
      webviewCallbackKey: message.webviewCallbackKey,
      data: {
        token,
      },
    });
  };

  private onLoggedIn = (message: IWebviewMessage) => {
    this.rootStore.authStore.setToken(message.data.token);
    this.zulipService.setToken(message.data.token);
    this.zulipService.subscribeEventQueue();
  };

  private onLoggedOut = () => {
    this.rootStore.authStore.setToken('');
    this.zulipService.stopSubscribeEventQueue();
    this.zulipService.setToken('');
  };

  doLogout = () => {
    this.postMessageToWebview({
      store: 'AuthStore',
      command: 'doLogout',
    });
  };

  private onLoggedInTest = () => {
    this.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
    this.zulipService.subscribeEventQueue();
  };
}
