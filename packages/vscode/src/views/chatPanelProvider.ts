import { WebviewViewProvider, WebviewView, window, Disposable } from 'vscode';

export class ChatPanelProvider implements WebviewViewProvider {
  private view?: WebviewView;

  public async resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.html = '';
    const url = 'http://localhost:3000';
    webviewView.webview.html = await fetch(url).then(response =>
      response.text(),
    );
  }

  public build(): Disposable {
    return window.registerWebviewViewProvider('chat', this);
  }
}
