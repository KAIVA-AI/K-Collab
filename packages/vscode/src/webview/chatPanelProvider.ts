import { WebviewViewProvider, WebviewView, window, Disposable } from 'vscode';

export class ChatPanelProvider implements WebviewViewProvider {
  private view?: WebviewView;

  public resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    const url = 'http://localhost:3000';
    fetch(url)
      .then(response => response.text())
      .then(html => {
        webviewView.webview.html = html;
      })
      .catch(error => {
        console.error('Error fetching HTML content:', error);
      });
  }

  public build(): Disposable {
    return window.registerWebviewViewProvider('chat', this);
  }
}
