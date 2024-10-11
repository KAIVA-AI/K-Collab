// import * as vscode from 'vscode';
// import path from 'path';
// import { setupGitlab, setupGoogle, setupZulip, setupZulipWithEmailPassword } from '../../../onboarding';
// import { getNonce, joinPath } from '../../../utils';
// import * as fs from 'fs';

// const enum LoginType {
//     zulip = 'zulip',
//     google = 'google',
//     gitlab = 'gitlab',
//     emailPassword = 'emailPassword',
// }

// export class LoginWebviewProvider implements vscode.WebviewViewProvider {

// 	public static readonly viewType = 'collab.webview.login.zulip';

// 	private _view?: vscode.WebviewView;

// 	constructor(
// 		private readonly _extensionUri: vscode.Uri,
// 	) { }

//     /**
//      * Resolves the webview view for the login provider.
//      * 
//      * Sets up the webview options, HTML content, and message handler.
//      * The message handler will call the appropriate setup function 
//      * based on the login type in the message data.
//      */
//     public resolveWebviewView(
//         webviewView: vscode.WebviewView,
//         context: vscode.WebviewViewResolveContext,
//         _token: vscode.CancellationToken,
//     ) {
//         this._view = webviewView

//         webviewView.webview.options = {
//             enableScripts: true,
//             localResourceRoots: [
//                 this._extensionUri
//             ]
//         }

//         webviewView.webview.html = this._getHtmlForWebview(context)
//         webviewView.webview.onDidReceiveMessage(async data => {
//             switch (data.loginType) {
//                 case LoginType.zulip:
//                     setupZulip();
//                     break;
//                 case LoginType.google:
//                     setupGoogle();
//                     break;
//                 case LoginType.gitlab:
//                     setupGitlab();
//                     break;
//                 case LoginType.emailPassword:
//                     setupZulipWithEmailPassword(data.email, data.password);
//                     break;
//                 default:
//                     break;
//             }
//         })
//     };

// private _getHtmlForWebview(webview: vscode.Webview) {
//     // const mediaPath = joinPath(this._extensionUri, 'src', 'webview/src', 'chat','media');
//     // const loginIconPath = joinPath(this._extensionUri, 'src' , 'webview/public', 'icons', 'login');
//     // const loadingGifPath = joinPath(this._extensionUri, 'src', 'webview/public', 'gifs', 'loading.gif');

//     // // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
//     // const scriptUri = webview.asWebviewUri(joinPath(mediaPath, 'login.js'));
//     // const styleMainUri = webview.asWebviewUri(joinPath(mediaPath, 'login.css'));
//     // const styleVSCodeUri = webview.asWebviewUri(joinPath(mediaPath, 'vscode.css'));
//     // const styleResetUri = webview.asWebviewUri(joinPath(mediaPath, 'reset.css'));

//     // const iconZulipUri = webview.asWebviewUri(joinPath(loginIconPath, 'icon-login-zulip.svg'));
//     // const iconGoogleUri = webview.asWebviewUri(joinPath(loginIconPath, 'icon-login-google.svg'));
//     // const iconGitlabUri = webview.asWebviewUri(joinPath(loginIconPath, 'icon-login-gitlab.svg'));
//     // const iconLoadingUri = webview.asWebviewUri(loadingGifPath);
//     // const scriptSrc = joinPath(this._extensionUri, 'configViewer', 'configViewer.js');
//     // console.log("url ", scriptSrc);
//     // Use a nonce to only allow a specific script to be run.
//     const nonce = getNonce();
//     // const fileIndex = joinPath(this._extensionUri, 'src', 'webview', 'configViewer', 'index.html')
//     console.log("extension path ", this._extensionUri.path)
//     const filePath: vscode.Uri = vscode.Uri.file(path.join(this._extensionUri.path, 'src', 'webview/configViewer', 'index.html'));
//     return fs.readFileSync(filePath.fsPath, 'utf8')
//     // return `<!DOCTYPE html>
//     //     <html lang="en">
//     //       <body>
//     //         <noscript>You need to enable JavaScript to run this app.</noscript>
//     //         <div id="root">Hello from other side</div>
//     //         <script src="${scriptSrc}"></script>
//     //       </body>
//     //     </html>
//     //     `;
//     // return `<!DOCTYPE html>
//     //     <html lang="en">
//     //     <head>
//     //         <meta charset="UTF-8">

//     //         <!--
//     //             Use a content security policy to only allow loading styles from our extension directory,
//     //             and only allow scripts that have a specific nonce.
//     //             (See the 'webview-sample' extension sample for img-src content security policy examples)
//     //         -->
//     //         <meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

//     //         <meta name="viewport" content="width=device-width, initial-scale=1.0">

//     //         <link href="${styleResetUri}" rel="stylesheet">
//     //         <link href="${styleVSCodeUri}" rel="stylesheet">
//     //         <link href="${styleMainUri}" rel="stylesheet">

//     //         <title>Views</title>
//     //     </head>
//     //     <body>
//     //         <h1>Welcome to Collab!</h1>
//     //         <h2>Please login to access our services<h2>
//     //         <p class="powered-by">
//     //         <em>Powered by VIETIS</em>
//     //         </p>

//     //         <div class="login-buttons">
//     //             <button id="login-with-zulip" class="login-button zulip">
//     //                 <img src="${iconZulipUri}" alt="Cody logo">
//     //                 Login with Zulip
//     //             </button>
                
//     //             <button id="login-with-google" class="login-button google">
//     //                 <img src="${iconGoogleUri}" alt="Google logo">
//     //                 Login with Google
//     //             </button>
            
//     //             <button id="login-with-gitlab" class="login-button gitlab">
//     //                 <img src="${iconGitlabUri}" alt="GitLab logo">  
//     //                 Login with GitLab
//     //             </button>
//     //         </div>

//     //         <h1>OR</h1>

//     //         <div class="login-with-email-and-password">
//     //             <h2 class="login-email-password-title">Login Zulip with email & password</h2>
//     //             <form class="login-form" action="#" method="post">
//     //                 <input type="email" name="email" placeholder="Email" required>
//     //                 <input type="password" name="password" placeholder="Password" required>
//     //                 <button type="submit">Login</button>
//     //             </form>
//     //             <div id="error-container"></div>
//     //         </div>

//     //         <div class="loading-overlay" id="loadingOverlay">
//     //             <div class="loading-spinner">
//     //                 <img src="${iconLoadingUri}" alt="Loading...">
//     //             </div>
//     //         </div>
        
//     //         <script nonce="${nonce}" src="${scriptUri}"></script>
//     //     </body>
//     //     </html>`;
// }
// }
import * as React from "react";
import {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { VSCodeButton, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";

import "./style.css";
import { MessageItem } from "./MessageItem";
import { ChatViewServiceImpl } from "./chatViewServiceImpl";
import { getServiceManager } from "../../common/ipc/webview";
import { IChatService, CHAT_SERVICE_NAME } from "../../common/chatService";
import { MessageItemModel } from "../../common/chatService/model";

function messagesWithUpdatedBotMessage(
    msgs: MessageItemModel[],
    updatedMsg: MessageItemModel
): MessageItemModel[] {
    return msgs.map((msg) => {
        if (updatedMsg.id === msg.id) {
            return updatedMsg;
        }
        return msg;
    });
}

type UseConfirmShortcut = {
    label: string;
    keyDownHandler: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};
function useConfirmShortcut(handler: () => void): UseConfirmShortcut {
    const isMac = useMemo(() => {
        const userAgentData = (window.navigator as any).userAgentData;
        if (userAgentData) {
            return userAgentData.platform === "macOS";
        }
        return window.navigator.platform === "MacIntel";
    }, []);

    return {
        label: isMac ? "⌘⏎" : "Ctrl+Enter",
        keyDownHandler: useCallback(
            (e) => {
                if (e.key !== "Enter") {
                    return;
                }
                const expected = isMac ? e.metaKey : e.ctrlKey;
                const unexpected = isMac ? e.ctrlKey : e.metaKey;
                if (!expected || e.altKey || e.shiftKey || unexpected) {
                    return;
                }
                handler();
            },
            [isMac, handler]
        ),
    };
}

const AUTO_SCROLL_FLAG_NONE = 0;
const AUTO_SCROLL_FLAG_FORCED = 1;
const AUTO_SCROLL_FLAG_AUTOMATIC = 2;

export function ChatPage() {
    const [messages, setMessages] = useState([] as MessageItemModel[]);
    const [hasSelection, setHasSelection] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [autoScrollFlag, setAutoScrollFlag] = useState(AUTO_SCROLL_FLAG_NONE);
    const chatListRef = useRef<HTMLDivElement>(null);

    // Dependent on `setMessages`, which will never change.
    const addMessageAction = useCallback((msg: MessageItemModel) => {
        setMessages((prev) => {
            return [...prev, msg];
        });
        setAutoScrollFlag(AUTO_SCROLL_FLAG_FORCED);
    }, []);
    const updateMessageAction = useCallback((msg: MessageItemModel) => {
        setMessages((prev) => {
            return messagesWithUpdatedBotMessage(prev, msg);
        });
        setAutoScrollFlag(AUTO_SCROLL_FLAG_AUTOMATIC);
    }, []);
    const clearMessageAction = useCallback(() => {
        setMessages([]);
    }, []);

    const handleAskAction = useCallback(async () => {
        const chatService = await getServiceManager().getService<IChatService>(
            CHAT_SERVICE_NAME
        );
        await chatService.confirmPrompt(prompt);
        setPrompt("");
    }, [prompt, setPrompt, setMessages]);

    const confirmShortcut = useConfirmShortcut(handleAskAction);

    useLayoutEffect(() => {
        if (!autoScrollFlag) {
            return;
        }
        const chatListEl = chatListRef.current;
        if (!chatListEl) {
            return;
        }

        setAutoScrollFlag(AUTO_SCROLL_FLAG_NONE);

        const targetScrollTop =
            chatListEl.scrollHeight - chatListEl.clientHeight;
        // TODO: implement `AUTO_SCROLL_FLAG_AUTOMATIC` flag.
        chatListEl.scrollTop = targetScrollTop;
    }, [messages, autoScrollFlag, setAutoScrollFlag, chatListRef]);

    useEffect(() => {
        const serviceManager = getServiceManager();

        const viewServiceImpl = new ChatViewServiceImpl();
        viewServiceImpl.setIsReadyAction = setIsReady;
        viewServiceImpl.setHasSelectionAction = setHasSelection;
        viewServiceImpl.addMessageAction = addMessageAction;
        viewServiceImpl.updateMessageAction = updateMessageAction;
        viewServiceImpl.clearMessageAction = clearMessageAction;
        serviceManager.registerService(viewServiceImpl);

        serviceManager
            .getService<IChatService>(CHAT_SERVICE_NAME)
            .then((chatService: { syncState: () => void; }) => {
                chatService.syncState();
            });
    }, []);

    return `
        <div className="chat-root">
            <div ref={chatListRef} className="chat-list">
                {messages.map((m) => {
                    return <MessageItem key={m.id} model={m} />;
                })}
            </div>
            <div className="chat-input-area">
                <VSCodeTextArea
                    style={{ width: "100%" }}
                    rows={3}
                    placeholder={"""Talk about the ${
                        hasSelection ? "selected contents" : "whole document"
                    }..."""}
                    disabled={!isReady}
                    value={prompt}
                    onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setPrompt(e.target.value);
                    }}
                    onKeyDown={confirmShortcut.keyDownHandler}
                />
                <VSCodeButton
                    disabled={!isReady || prompt.length === 0}
                    onClick={handleAskAction}
                >
                    {"""Ask (${confirmShortcut.label})"""}
                </VSCodeButton>
            </div>
        </div>
    `;
}
