import { Disposable, Uri, window } from 'vscode';
import { RootStore } from '../stores';
import { Logger } from 'src/utils/logger';
import * as vscode from 'vscode';

export class UriGitHubHandler {
  constructor(private rootStore: RootStore) {}

  #handleUriGithub(uri: vscode.Uri) {
    Logger.log(`Handling uri: ${uri}`);
    const token = new URLSearchParams(uri.query).get('token');
    const realm = new URLSearchParams(uri.query).get('realm');

    if (token && realm) {
      this.rootStore.chatPanelProvider.postMessageToWebview({
        store: 'AuthStore',
        command: 'loginUriGitHub',
        data: {
          token: token,
          realm: realm,
        },
      });
    }
  }

  register(): Disposable {
    console.log('RESGISTER URLHANDLER GITHUB');
    return vscode.window.registerUriHandler({
      handleUri: (uri: Uri) => {
        console.log(`[DEBUG] Received URI: ${uri.toString()}`);

        this.#handleUriGithub(uri);
      },
    });
  }
}
