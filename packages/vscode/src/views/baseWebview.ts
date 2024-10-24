import { Webview, Disposable, window, ColorThemeKind } from 'vscode';
import { IWebviewMessage } from 'src/models';
import { Constants } from '@v-collab/common';
import { RootStore } from 'src/stores';

interface IMessageHandler {
  [key: string]: (message: IWebviewMessage) => void;
}

export abstract class IBaseWebview {
  private isWebviewWakedUp = false;

  private get webviewUrl() {
    return `${Constants.WEB_URL}/?nonce=${Date.now()}`;
  }
  private get currentTheme() {
    return [ColorThemeKind.Dark, ColorThemeKind.HighContrast].includes(
      window.activeColorTheme.kind,
    )
      ? 'dark'
      : 'light';
  }

  constructor(public rootStore: RootStore) {
    window.onDidChangeActiveColorTheme(this.updateWebviewTheme);
  }

  abstract register: () => Disposable;
  abstract getWebview: () => Webview;
  abstract getPageRouter: () => string;
  abstract messageHandler: () => IMessageHandler;

  loadWebview = async () => {
    this.getWebview().options = {
      enableScripts: true,
    };
    this.getWebview().onDidReceiveMessage(this.onMessageFromWebview);
    this.getWebview().html = await fetch(this.webviewUrl).then(response =>
      response.text(),
    );
  };

  private onMessageFromWebview = (message: IWebviewMessage) => {
    if (message?.source !== 'webview') {
      return;
    }
    if (message.command === 'webviewWakedUp') {
      this.isWebviewWakedUp = true;
      this.updateWebviewTheme();
      this.onWebviewWakedUp();
      return;
    }
    if (message.command === 'getExtensionVersion') {
      this.postMessageToWebview({
        store: 'RootStore',
        command: 'webviewCallbackKey',
        webviewCallbackKey: message.webviewCallbackKey,
        data: {
          version: this.rootStore.extensionVersion,
        },
      });
      return;
    }
    if (message.command === 'getPageRouter') {
      this.postMessageToWebview({
        store: 'RootStore',
        command: 'webviewCallbackKey',
        webviewCallbackKey: message.webviewCallbackKey,
        data: {
          pageRouter: this.getPageRouter(),
        },
      });
      return;
    }
    const handler = this.messageHandler()[message.command];
    handler && handler(message);
  };

  postMessageToWebview = (message: IWebviewMessage) => {
    if (!message.source) {
      message.source = 'vscode';
    }
    return this.getWebview().postMessage(message);
  };

  onWebviewWakedUp = () => {};

  private updateWebviewTheme = () => {
    this.postMessageToWebview({
      store: 'RootStore',
      command: 'updateWebviewTheme',
      data: {
        theme: this.currentTheme,
      },
    });
  };
}
