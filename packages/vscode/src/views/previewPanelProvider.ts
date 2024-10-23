import { WebviewPanel, window, Disposable, ViewColumn } from 'vscode';

export class PreviewPanelProvider {
  private readonly panel: WebviewPanel;
  constructor() {
    this.panel = window.createWebviewPanel('chat', 'Chat', {
      viewColumn: ViewColumn.Beside,
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
    //   const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // // If we already have a panel, show it.
    // // Otherwise, create a new panel.
    // if (ReactPanel.currentPanel) {
    // 	ReactPanel.currentPanel._panel.reveal(column);
    // } else {
    // 	ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
    // }
    return this.panel;
  }
}
