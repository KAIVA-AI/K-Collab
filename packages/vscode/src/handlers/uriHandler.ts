import { Disposable, Uri, window } from 'vscode';

export class UriHandler {
  #handleUri(uri: Uri) {
    console.log('Handling uri:', uri);
    // vscode.window.showInformationMessage('Handling uri: ' + uri);
    const queryParams = new URLSearchParams(uri.query);
    const accessToken = queryParams.get('token'); // Assuming token is returned as a query param
    const realm = queryParams.get('realm');

    if (accessToken) {
      // Store the token in the global state for later use
      // context.globalState.update('accessToken', accessToken);
    } else {
      window.showErrorMessage('Authentication failed!');
    }
    if (realm) {
      // context.globalState.update('realm_string', realm);
    }
    window.showInformationMessage(
      `${realm} Authentication successful! ${accessToken}`,
    );
  }

  register(): Disposable {
    return window.registerUriHandler({ handleUri: this.#handleUri });
  }
}
