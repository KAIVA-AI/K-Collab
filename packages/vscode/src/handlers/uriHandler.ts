import { Disposable, Uri, window } from 'vscode';
import { RootStore } from '../stores';
import { Logger } from 'src/utils/logger';

export class UriHandler {
  constructor(private rootStore: RootStore) {}

  #handleUri(uri: Uri) {
    console.log(`Handling uri: ${uri} ${this.rootStore}`);
    // vscode.window.showInformationMessage('Handling uri: ' + uri);
    const queryParams = new URLSearchParams(uri.query);
    const accessToken = queryParams.get('token'); // Assuming token is returned as a query param
    const realm = queryParams.get('realm');
    const token = new URLSearchParams(uri.query).get('token');
    if (accessToken && realm) {
      // Send the token to the React webview
      this.rootStore.chatPanelProvider.postMessageToWebview({
        store: 'AuthStore',
        command: 'loginUri',
        data: {
          token: token,
        },
      });
    } else {
      window.showErrorMessage('Invalid or missing login token.');
      if (realm) {
        this.rootStore.setState('realm_string', realm);
      }
      window.showInformationMessage(
        `${realm} Authentication successful! ${accessToken} | ${realm}`,
      );
    }
  }

  register(): Disposable {
    Logger.log(`### , ${this.rootStore.chatPanelProvider}`);
    return window.registerUriHandler({
      handleUri: (uri: Uri) => this.#handleUri(uri), // Arrow function ensures 'this' context is correct
    });
  }
}
