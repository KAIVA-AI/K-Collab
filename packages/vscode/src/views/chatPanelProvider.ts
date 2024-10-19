import { WebviewViewProvider, WebviewView, window, Disposable } from 'vscode';

const VIEW_ID = 'v-collab_bar.chat';

export class ChatPanelProvider implements WebviewViewProvider, Disposable {
  private view?: WebviewView;

  public async resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView;
    this.view.webview.options = {
      enableScripts: true,
    };
    this.view.webview.html = '';
    const url = 'http://localhost:3000';
    this.view.webview.html = await fetch(url).then(response => response.text());
  }

  public dispose() {
    //
  }

  public build(): Disposable {
    return window.registerWebviewViewProvider(VIEW_ID, this);
  }
}
