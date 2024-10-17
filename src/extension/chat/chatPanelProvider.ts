import * as vscode from "vscode";
import { Utils } from 'vscode-uri';
import { getNonce } from "../../utils";
import { sharedChatServiceImpl, ChatServiceClient } from "./chatServiceImpl";
import { ExtensionHostServiceManager } from "../../common/ipc/extensionHost";
import {
    IChatViewService,
    CHAT_VIEW_SERVICE_NAME,
} from "../../common/chatService";
import { MessageItemModel } from "../../common/chatService/model";

export class ChatPanelProvider
    implements vscode.WebviewViewProvider, ChatServiceClient
{
    static readonly viewType = "chat";

    #view: vscode.WebviewView | null = null;
    #extensionContext: vscode.ExtensionContext;
    #serviceManager: ExtensionHostServiceManager | null = null;

    constructor(extensionContext: vscode.ExtensionContext) {
        this.#extensionContext = extensionContext;
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this.#view = webviewView;
        // Send authentication state to the webview
        const isAuthenticated = this.#extensionContext.globalState.get<boolean>('isAuthenticated') || false;
        this.#view.webview.postMessage({
            command: 'setAuthState',
            isAuthenticated: isAuthenticated,
        });

        this.#view.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'setAuthState':
                    this.#extensionContext.globalState.update('isAuthenticated', message.isAuthenticated);
                    vscode.window.showInformationMessage(`User authenticated: ${message.isAuthenticated}`);
                    break;
            }
        });

        console.log("BINGO");
        const { extensionUri } = this.#extensionContext;
        const { webview } = webviewView;
        const baseUri = Utils.joinPath(extensionUri, "dist");
        webview.options = {
            enableScripts: true,
            localResourceRoots: [baseUri],
        };
        const accessToken = this.#extensionContext.globalState.get<string>("accessToken") || '';
        const realmString = this.#extensionContext.globalState.get<string>("realm_string") || '';
        // Listen for messages from the webview
        // webview.onDidReceiveMessage(
        //     message => {
        //     switch (message.command) {
        //         case 'setAuthState':
        //         // Use the token and redirect to the ChatPage inside the webview
        //         this.handleAuthentication(webviewView, message.token, message.realm);
        //         break;
        //     }
        //     },
        //     undefined,
        //     this.#extensionContext.subscriptions
        // );

        webview.html = ChatPanelProvider.#buildWebviewContents(
            webview,
            baseUri,
            accessToken,
            realmString
        );
        if (accessToken && realmString) {
            console.log("PROVIDER LOAD ", accessToken, realmString);
            this.handleAuthentication(webviewView, accessToken, realmString);
        }
        const chatService = sharedChatServiceImpl();
        chatService.attachClient(this);

        const serviceManager = new ExtensionHostServiceManager(webview);
        serviceManager.registerService(chatService);
        this.#serviceManager = serviceManager;

        const eventDisposable = vscode.window.onDidChangeTextEditorSelection(
            async (e) => {
                const hasSelection = !e.selections[0].isEmpty;
                const chatViewService =
                    await serviceManager.getService<IChatViewService>(
                        CHAT_VIEW_SERVICE_NAME
                    );
                await chatViewService.setHasSelection(hasSelection);
            }
        );

        webviewView.onDidDispose(() => {
            eventDisposable.dispose();
            serviceManager.dispose();
            chatService.detachClient(this);
        });
    }

    private handleLoginSuccess(data: { accessToken: string; realm: string }) {
        // Log the data for testing
        console.log('Login successful! Access token:', data.accessToken);
    
        // Store the token or other necessary data for later use
        this.#extensionContext.workspaceState.update('accessToken', data.accessToken);
    
        // Redirect to ChatTopicList before going to ChatPage
        vscode.commands.executeCommand('vietis-idt.showChatTopicList'); // Custom command to open a new view or ChatTopicList
    
        // Optionally, you could trigger another command to go to the ChatPage after loading topics
        // vscode.commands.executeCommand('myExtension.showChatPage');
      }

    handleAuthentication(webview:vscode.WebviewView, token: string, realm: string) {
        if (token) {
          webview?.webview.postMessage({ command: 'loadChatPage', token, realm });
        } else {
          vscode.window.showErrorMessage("Authentication failed. Please try again.");
        }
      }

    handleReadyStateChange(isReady: boolean): void {
        const serviceManager = this.#serviceManager;
        if (!serviceManager) {
            return;
        }

        serviceManager
            .getService<IChatViewService>(CHAT_VIEW_SERVICE_NAME)
            .then((service) => {
                service.setIsBusy(isReady);
            });
    }

    handleNewMessage(msg: MessageItemModel): void {
        const serviceManager = this.#serviceManager;
        if (!serviceManager) {
            return;
        }

        serviceManager
            .getService<IChatViewService>(CHAT_VIEW_SERVICE_NAME)
            .then((service) => {
                service.addMessage(msg);
            });
    }

    handleMessageChange(msg: MessageItemModel): void {
        const serviceManager = this.#serviceManager;
        if (!serviceManager) {
            return;
        }

        serviceManager
            .getService<IChatViewService>(CHAT_VIEW_SERVICE_NAME)
            .then((service) => {
                service.updateMessage(msg);
            });
    }

    handleClearMessage(): void {
        const serviceManager = this.#serviceManager;
        if (!serviceManager) {
            return;
        }

        serviceManager
            .getService<IChatViewService>(CHAT_VIEW_SERVICE_NAME)
            .then((service) => {
                service.clearMessage();
            });
    }

    static #buildWebviewContents(
        webview: vscode.Webview,
        baseUri: vscode.Uri,
        accessToken: string,
        realmString: string
    ): string {
        const scriptUri = webview.asWebviewUri(
            Utils.joinPath(baseUri, "webview.js")
        );
        const codiconsUri = webview.asWebviewUri(
            Utils.joinPath(baseUri, "codicon.css")
        );
        console.log("scriptUri ", scriptUri);
        console.log("codiconsUri ", codiconsUri);

        const nonce = getNonce();

        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline' ; script-src 'nonce-${nonce}';">
                <title>CodeCursor</title>
                <script nonce="${nonce}">
                    window.__codeCursorPageName = "chat";
                </script>
                <link href="${codiconsUri}" rel="stylesheet" />
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    // Send accessToken and realmString to the webview
                    vscode.postMessage({
                    accessToken: "${accessToken}",
                    realmString: "${realmString}"
                    });
                </script>
            </body>
        </html>
        `;
    }
}
