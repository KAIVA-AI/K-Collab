import {
  WebviewPanel,
  window,
  Disposable,
  ViewColumn,
  Webview,
  Range,
} from 'vscode';
import { IBaseWebview } from './baseWebview';
import { RootStore } from 'src/stores';

const VIEW_ID = 'k-collab.panel.preview';
const VIEW_NAME = 'Preview';

export class PreviewPanelProvider extends IBaseWebview {
  private panel?: WebviewPanel;
  private view?: Webview;
  private path = '';
  private oldContent = '';
  private newContent = '';
  private startLine = 0;
  private endLine = 0;

  constructor(public rootStore: RootStore) {
    super(rootStore);
  }

  register = (): Disposable => {
    if (!this.panel) {
      this.panel = window.createWebviewPanel(VIEW_ID, VIEW_NAME, {
        viewColumn: ViewColumn.Beside,
      });
      this.view = this.panel.webview;
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
      this.loadWebview();
    }
    return this.panel;
  };

  getWebview = () => this.view!;
  getPageRouter = () => 'view-diff';
  messageHandler = () => ({
    getDiffData: this.onWebviewWakedUp,
    acceptChanges: this.acceptChanges,
    rejectChanges: this.rejectChanges,
  });

  show = (
    path: string,
    oldContent: string,
    newContent: string,
    startLine: number,
    endLine: number,
  ) => {
    this.path = path;
    this.oldContent = oldContent;
    this.newContent = newContent;
    this.startLine = startLine;
    this.endLine = endLine;
    this.register();
    this.rootStore.registerPanel(this.panel!);
    this.panel?.reveal();
    this.onWebviewWakedUp();
  };

  onWebviewWakedUp = () => {
    this.postMessageToWebview({
      store: 'PreviewViewModel',
      command: 'setDiffData',
      data: {
        oldContent: this.oldContent,
        newContent: this.newContent,
        startLine: this.startLine,
        endLine: this.endLine,
      },
    });
  };

  private acceptChanges = () => {
    const editor = window.visibleTextEditors.find(
      editor => editor.document.uri.path === this.path,
    );
    if (editor) {
      editor.edit(editBuilder => {
        const lineStart = editor.document.lineAt(this.startLine - 1).range
          .start;
        const lineEnd = editor.document.lineAt(this.endLine - 1).range.end;
        editBuilder.replace(new Range(lineStart, lineEnd), this.newContent);
      });
    }
    this.panel?.dispose();
  };

  private rejectChanges = () => {
    this.panel?.dispose();
  };
}
