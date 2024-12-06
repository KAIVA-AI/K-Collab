import { Disposable, Uri, window } from 'vscode';
import { RootStore } from '../stores';
import { Logger } from 'src/utils/logger';

export class UriHandler {
  constructor(private rootStore: RootStore) {}

  #handleUri(uri: Uri) {
    Logger.log(`Handling uri: ${uri}`);
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
    }
  }

  register(): Disposable {
    return window.registerUriHandler({
      handleUri: (uri: Uri) => this.#handleUri(uri), // Arrow function ensures 'this' context is correct
    });
  }
}
