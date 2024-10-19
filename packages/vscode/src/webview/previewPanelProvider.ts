import { WebviewPanel, window, Disposable, ViewColumn } from 'vscode';

export class PreviewPanelProvider {
  private readonly panel: WebviewPanel;
  constructor() {
    this.panel = window.createWebviewPanel('chat', 'Chat', {
      viewColumn: ViewColumn.One,
    });
  }

  public build(): Disposable {
    const url = 'https://www.google.com';
    fetch(url)
      .then(response => response.text())
      .then(html => {
        this.panel.webview.html = html;
      })
      .catch(error => {
        console.error('Error fetching HTML content:', error);
      });
    return this.panel;
  }
}
