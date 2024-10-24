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
  scm,
} from 'vscode';
import { ITopicFileInput, IWebviewMessage, TopicFileInput } from '../models';
import { RootStore } from '../stores';
import { AddFileCommand, AddSelectionCommand } from '../commands';
import { ZulipService, IZulipEvent, Constants } from '@v-collab/common';
import { IBaseWebview } from './baseWebview';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

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
    this.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
  }

  async resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView.webview;
    this.loadWebview();
  }

  register = (): Disposable => {
    this.zulipService.addEventListener(VIEW_ID, this.#onZulipEventMessage);
    this.zulipService.subscribeEventQueue();
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
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage('No active editor found');
      return;
    }
    const newContent: string = message.data.content;
    let lineStart: number = 1;
    let lineEnd: number = 1;
    let oldContent = '';
    // if no selecting, get the whole line
    if (editor.selection.isEmpty) {
      lineStart = 1;
      lineEnd = editor.document.lineCount;
      oldContent = editor.document.getText();
    } else {
      lineStart = editor.selection.start.line + 1;
      lineEnd = editor.selection.end.line + 1;
      oldContent = editor.document.getText(editor.selection);
    }
    this.rootStore.previewPanelProvider.show(
      editor.document.uri.path,
      oldContent,
      newContent,
      lineStart,
      lineEnd,
    );
  };

  private previewChangeUsingVSCodeDiff = async (message: string) => {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage('No active editor found');
      return;
    }
    const originalFilePath = editor.document.uri.fsPath;
    const selection = editor.selection;

    const tempFilePath = await this.cloneFileToTemp(originalFilePath);
    await this.previewChangeApplyMessageToSelection(
      tempFilePath,
      message,
      selection,
    );
    await this.showDiffUsingVSCodeDiff(originalFilePath, tempFilePath);
  };

  private previewChangeUsingScm = async (message: string) => {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage('No active editor found');
      return;
    }
    const originalFilePath = editor.document.uri.fsPath;
    const selection = editor.selection;

    const tempFilePath = await this.cloneFileToTemp(originalFilePath);
    await this.previewChangeApplyMessageToSelection(
      tempFilePath,
      message,
      selection,
    );
    await this.showDiffUsingScm(originalFilePath, tempFilePath);
  };

  private cloneFileToTemp = async (
    originalFilePath: string,
  ): Promise<string> => {
    const tempFilePath = path.join(
      os.tmpdir(),
      path.basename(originalFilePath),
    );
    const fileContent = fs.readFileSync(originalFilePath, 'utf8');
    await fs.promises.writeFile(tempFilePath, fileContent, 'utf8');
    return tempFilePath;
  };

  private previewChangeApplyMessageToSelection = async (
    tempFilePath: string,
    message: string,
    selection: Selection,
  ) => {
    const fileContent = await fs.promises.readFile(tempFilePath, 'utf8');
    const lines = fileContent.split('\n');
    const startLine = selection.start.line;
    // const endLine = selection.end.line;
    const startChar = selection.start.character;
    const endChar = selection.end.character;

    lines[startLine] =
      lines[startLine].substring(0, startChar) +
      message +
      lines[startLine].substring(endChar);

    const newContent = lines.join('\n');
    await fs.promises.writeFile(tempFilePath, newContent, 'utf8');
  };

  private showDiffUsingVSCodeDiff = async (
    originalFilePath: string,
    tempFilePath: string,
  ) => {
    const title = `Review changes in ${path.basename(originalFilePath)}`;
    const originalUri = Uri.file(originalFilePath);
    const tempUri = Uri.file(tempFilePath);
    await commands.executeCommand('vscode.diff', originalUri, tempUri, title);
  };

  private showDiffUsingScm = async (
    originalFilePath: string,
    tempFilePath: string,
  ) => {
    const title = `Review changes in ${path.basename(originalFilePath)}`;
    const originalUri = Uri.file(originalFilePath);
    const tempUri = Uri.file(tempFilePath);
    const vcollabScm = scm.createSourceControl('v-collab', 'v-collab');
    const index = vcollabScm.createResourceGroup('index', 'Index');
    index.resourceStates = [{ resourceUri: originalUri }];

    vcollabScm.quickDiffProvider = {
      provideOriginalResource: async () => tempUri,
    };

    vcollabScm.inputBox.value = title;
    vcollabScm.inputBox.enabled = false;
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
}
