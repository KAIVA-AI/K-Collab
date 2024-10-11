import * as vscode from 'vscode';
import path from 'path';
import { setupGitlab, setupGoogle, setupZulip, setupZulipWithEmailPassword } from '../../onboarding';
import { getNonce, joinPath } from '../../utils';
import * as fs from 'fs';
import { LoginResponse, LoginResult } from '../../types';

const enum LoginType {
    zulip = 'zulip',
    google = 'google',
    gitlab = 'gitlab',
    emailPassword = 'emailPassword',
}

export class LoginWebviewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'collab.webview.login.zulip';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

    /**
     * Resolves the webview view for the login provider.
     * 
     * Sets up the webview options, HTML content, and message handler.
     * The message handler will call the appropriate setup function 
     * based on the login type in the message data.
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.loginType) {
                case LoginType.zulip:
                    setupZulip();
                    break;
                case LoginType.google:
                    setupGoogle();
                    break;
                case LoginType.gitlab:
                    setupGitlab();
                    break;
                case LoginType.emailPassword:
                    setupZulipWithEmailPassword(data.email, data.password);
                    break;
                default:
                    break;
            }
        })
    };

    public loginResponseHandler(
        loginResponse: LoginResponse,
    ) {
        this._view?.webview.postMessage({
            status: "login-completed",
            isSuccess: loginResponse.result === LoginResult.success,
            errorMessage: loginResponse.errorMessage ?? ''
        });
    }

private _getHtmlForWebview(webview: vscode.Webview) {
    const mediaPath = joinPath(this._extensionUri, 'src', 'webview/src', 'chat','media');
    const loginIconPath = joinPath(this._extensionUri, 'src' , 'webview/public', 'icons', 'login');
    const loadingGifPath = joinPath(this._extensionUri, 'src', 'webview/public', 'gifs', 'loading.gif');

    // // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(joinPath(mediaPath, 'login.js'));
    const styleMainUri = webview.asWebviewUri(joinPath(mediaPath, 'login.css'));
    const styleVSCodeUri = webview.asWebviewUri(joinPath(mediaPath, 'vscode.css'));
    const styleResetUri = webview.asWebviewUri(joinPath(mediaPath, 'reset.css'));

    const iconZulipUri = webview.asWebviewUri(joinPath(loginIconPath, 'icon-login-zulip.svg'));
    const iconGoogleUri = webview.asWebviewUri(joinPath(loginIconPath, 'icon-login-google.svg'));
    const iconGitlabUri = webview.asWebviewUri(joinPath(loginIconPath, 'icon-login-gitlab.svg'));
    const iconLoadingUri = webview.asWebviewUri(loadingGifPath);
    const scriptSrc = joinPath(this._extensionUri, 'configViewer', 'configViewer.js');
    // console.log("url ", scriptSrc);
    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();
    const fileIndex = joinPath(this._extensionUri, 'src', 'webview', 'configViewer', 'index.html')
    // console.log("extension path ", this._extensionUri.path)
    // const filePath: vscode.Uri = vscode.Uri.file(path.join(this._extensionUri.path, 'src', 'webview/configViewer', 'index.html'));
    // return fs.readFileSync(filePath.fsPath, 'utf8')
    return `<!DOCTYPE html>
        <html lang="en">
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root">Hello from other side</div>
            <script src="${scriptSrc}"></script>
          </body>
        </html>
        `;
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <!--
                Use a content security policy to only allow loading styles from our extension directory,
                and only allow scripts that have a specific nonce.
                (See the 'webview-sample' extension sample for img-src content security policy examples)
            -->
            <meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link href="${styleMainUri}" rel="stylesheet">

            <title>Views</title>
        </head>
        <body>
            <h1>Welcome to Collab!</h1>
            <h2>Please login to access our services<h2>
            <p class="powered-by">
            <em>Powered by VIETIS</em>
            </p>

            <div class="login-buttons">
                <button id="login-with-zulip" class="login-button zulip">
                    <img src="${iconZulipUri}" alt="Cody logo">
                    Login with Zulip
                </button>
                
                <button id="login-with-google" class="login-button google">
                    <img src="${iconGoogleUri}" alt="Google logo">
                    Login with Google
                </button>
            
                <button id="login-with-gitlab" class="login-button gitlab">
                    <img src="${iconGitlabUri}" alt="GitLab logo">  
                    Login with GitLab
                </button>
            </div>

            <h1>OR</h1>

            <div class="login-with-email-and-password">
                <h2 class="login-email-password-title">Login Zulip with email & password</h2>
                <form class="login-form" action="#" method="post">
                    <input type="email" name="email" placeholder="Email" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <div id="error-container"></div>
            </div>

            <div class="loading-overlay" id="loadingOverlay">
                <div class="loading-spinner">
                    <img src="${iconLoadingUri}" alt="Loading...">
                </div>
            </div>
        
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
}
}