import { WebviewViewProvider, WebviewView, window, Disposable } from 'vscode';

export class ChatPanelProvider implements WebviewViewProvider {
  private view?: WebviewView;

  public resolveWebviewView(webviewView: WebviewView) {
    this.view = webviewView;
    const url = 'https://www.google.com';
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
