import * as vscode from "vscode";
import { Utils } from "vscode-uri";

export class LoginWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "cest_la_vie.login";

    constructor(private readonly context: vscode.ExtensionContext) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Handle incoming messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "checkAccessKey":
                    const isValid = this.checkAccessKey(message.accessKey);
                    webviewView.webview.postMessage({
                        command: "accessKeyResult",
                        isValid: isValid,
                    });
                    break;

                case "storeUserData":
                    if (message.userData) {
                        await this.context.globalState.update(
                            "loggedInUserData",
                            message.userData
                        );
                        vscode.window.showInformationMessage(
                            `User ${message.userData.username} logged in and data stored.`
                        );
                    }
                    break;
            }
        });
    }

    private checkAccessKey(accessKey: string): boolean {
        // Replace this with real validation logic
        const validKeys = ["1234", "abcd"];
        return validKeys.includes(accessKey);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            Utils.joinPath(this.context.extensionUri, "media", "main.js")
        );
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Login</title>
            </head>
            <body>
                <div id="root"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}