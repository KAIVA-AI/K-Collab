import { Disposable, Uri, window } from 'vscode';
import { RootStore } from '../stores';
import { Logger } from 'src/utils/logger';

export class UriHandler {
  constructor(private rootStore: RootStore) {}

  #handleUri(uri: Uri) {
    Logger.log(`Handling uri: ${uri}`);
    // vscode.window.showInformationMessage('Handling uri: ' + uri);
    const queryParams = new URLSearchParams(uri.query);
    const accessToken = queryParams.get('token'); // Assuming token is returned as a query param
    const realm = queryParams.get('realm');

    if (accessToken) {
      // Store the token in the global state for later use
      this.rootStore.setState('accessToken', accessToken);
    } else {
      window.showErrorMessage('Authentication failed!');
    }
    if (realm) {
      this.rootStore.setState('realm_string', realm);
    }
    window.showInformationMessage(
      `${realm} Authentication successful! ${accessToken}`,
    );
  }

  register(): Disposable {
    return window.registerUriHandler({ handleUri: this.#handleUri });
  }
}
