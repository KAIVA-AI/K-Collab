import { WebviewPanel, window, Disposable, ViewColumn, Webview } from 'vscode';
import { IBaseWebview } from './baseWebview';
import { IWebviewMessage } from 'src/models';
import { Constants } from '@v-collab/common';
import { RootStore } from 'src/stores';

const VIEW_ID = 'v-collab.panel.preview';
const VIEW_NAME = 'Preview';

export class PreviewPanelProvider implements IBaseWebview {
  private panel?: WebviewPanel;
  private view?: Webview;

  constructor(private rootStore: RootStore) {}

  #onMessageFromWebview = (message: IWebviewMessage) => {
    if (message?.source !== 'webview') {
      return;
    }
    if (message.command === 'getExtensionVersion') {
      this.getExtensionVersion(message);
    }
    if (message.command === 'getPageRouter') {
      this.getPageRouter(message);
    }
  };

  public register(): Disposable {
    if (!this.panel) {
      this.panel = window.createWebviewPanel(VIEW_ID, VIEW_NAME, {
        viewColumn: ViewColumn.Beside,
      });
      this.view = this.panel.webview;
      this.view.options = {
        enableScripts: true,
      };
      this.view.onDidReceiveMessage(this.#onMessageFromWebview);
      const url = `${Constants.WEB_URL}/?nonce=${Date.now()}`;
      fetch(url)
        .then(response => response.text())
        .then(html => {
          this.panel!.webview.html = html;
        })
        .catch(error => {
          console.error('Error fetching HTML content:', error);
        });
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }
    return this.panel;
  }

  getExtensionVersion = (message: IWebviewMessage) => {
    this.view?.postMessage({
      source: 'vscode',
      store: 'RootStore',
      command: 'webviewCallbackKey',
      webviewCallbackKey: message.webviewCallbackKey,
      data: {
        version: this.rootStore.extensionVersion(),
      },
    });
  };

  getPageRouter = (message: IWebviewMessage) => {
    this.view?.postMessage({
      source: 'vscode',
      store: 'RootStore',
      command: 'webviewCallbackKey',
      webviewCallbackKey: message.webviewCallbackKey,
      data: {
        pageRouter: 'view-diff',
      },
    });
  };

  show = (newContent: string) => {
    this.register();
    this.rootStore.registerPanel(this.panel!);
    this.panel?.reveal();

    // TODO get current selection from active editor, show diff with newContent
    console.log(newContent);
  };
}
