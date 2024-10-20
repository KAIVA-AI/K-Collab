import { Disposable, Uri, window, ExtensionContext } from 'vscode';
import { RootStore } from '../stores';

export class UriHandler {
  constructor(
    private rootStore: RootStore,
    private context: ExtensionContext,
  ) {}

  #handleUri(uri: Uri) {
    console.log('Handling uri:', uri);
    // vscode.window.showInformationMessage('Handling uri: ' + uri);
    const queryParams = new URLSearchParams(uri.query);
    const accessToken = queryParams.get('token'); // Assuming token is returned as a query param
    const realm = queryParams.get('realm');

    if (accessToken) {
      // Store the token in the global state for later use
      this.context.globalState.update('accessToken', accessToken);
    } else {
      window.showErrorMessage('Authentication failed!');
    }
    if (realm) {
      this.context.globalState.update('realm_string', realm);
    }
    window.showInformationMessage(
      `${realm} Authentication successful! ${accessToken}`,
    );
  }

  register(): Disposable {
    return window.registerUriHandler({ handleUri: this.#handleUri });
  }
}
