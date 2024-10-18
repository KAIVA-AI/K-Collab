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
    implements vscode.WebviewViewProvider, ChatServiceClient {
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
        webview.onDidReceiveMessage(
            message => {
                console.log("message from react webview ", message);
                switch (message.command) {
                    case 'loadChatPage':
                        // Use the token and redirect to the ChatPage inside the webview
                        this.handleLoginSuccess({ realm: realmString, accessToken: accessToken });
                        break;
                }
            },
            undefined,
            this.#extensionContext.subscriptions
        );

        
        
        webview.html = ChatPanelProvider.#buildWebviewContents(
            webview,
            baseUri,
            accessToken,
            realmString
        );
        if (accessToken && realmString) {
            this.handleAuthentication(webviewView, accessToken, realmString);
            // this.handleLoginSuccess({ realm: realmString, accessToken: accessToken });

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
        this.#extensionContext.workspaceState.update('realmString', data.realm);


        // Redirect to ChatTopicList before going to ChatPage
        // vscode.commands.executeCommand('vietis.showChatTopicList'); // Custom command to open a new view or ChatTopicList

        // Optionally, you could trigger another command to go to the ChatPage after loading topics
        // vscode.commands.executeCommand('myExtension.showChatPage');
    }
    // send data to react webview
    handleAuthentication(webview: vscode.WebviewView, token: string, realm: string) {
        if (token) {
            console.log("chat provider load token ", token)
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
        // console.log("scriptUri ", scriptUri);
        // console.log("codiconsUri ", codiconsUri);
        console.log("START LOAD REACT APP ", webview.cspSource);

        const nonce = getNonce();

//                <meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
//<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
// font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline' ; 
// script-src 'nonce-${nonce}'; ">

        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                
                <meta http-equiv="Content-Security-Policy" content="font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">

                <title>Vietis Extension</title>
                <link href="${codiconsUri}" rel="stylesheet" />
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
        </html>
        `;
    }
}