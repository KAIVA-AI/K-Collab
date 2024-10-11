// import * as vscode from 'vscode';

//    export function activate(context: vscode.ExtensionContext) {
//     console.log("BINGO");
//      let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
//        vscode.window.showInformationMessage('Hello from your React app extension!');
//      });

//      context.subscriptions.push(disposable);
//    }

//    export function deactivate() {}
import * as vscode from "vscode";
import * as crypto from "crypto";

// import { GenerateSession, getScratchpadManager } from "./generate";
// import { getGlobalState } from "./globalState";
import { ChatPanelProvider } from "./extension/chat/chatPanelProvider";
import { sharedChatServiceImpl } from "./extension/chat/chatServiceImpl";

// import { ExtensionContext } from "./context.ts";
// import { handleGenerateProjectCommand } from "./project";

function setHasActiveGenerateSessionContext(value: boolean) {
    vscode.commands.executeCommand(
        "setContext",
        "aicursor.hasActiveGenerateSession",
        value
    );
}

async function handleGenerateCodeCommand() {
    const input = await vscode.window.showInputBox({
        placeHolder: "Instructions for code to generate...",
    });
    if (!input) {
        return;
    }

    // Get the current editor and selection.
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    // End the active session first.
    // const globalState = getGlobalState();
    // const activeSession = globalState.activeSession;
    // if (activeSession) {
    //     activeSession.dispose();
    // }

    // const session = new GenerateSession(input, editor);
    // session.onDidDispose(() => {
    //     globalState.activeSession = null;
    //     setHasActiveGenerateSessionContext(false);
    // });
    // session.start();
    // session.showResult();
    // globalState.activeSession = session;
    // setHasActiveGenerateSessionContext(true);
}

export function activate(context: vscode.ExtensionContext) {
    // To use crypto features in WebAssembly, we need to add this polyfill.
    global.crypto = {
        getRandomValues: (arr: Uint8Array) => {
            crypto.randomFillSync(arr);
        },
    } as any;

    // setExtensionContext(new ExtensionContext());
    // getGlobalState().storage = context.globalState;

    context.subscriptions.push(
        // getScratchpadManager().registerTextDocumentContentProvider(),
        vscode.window.registerWebviewViewProvider(
            ChatPanelProvider.viewType,
            new ChatPanelProvider(context)
        )
    );

    // TODO: No need to refresh the token every time.
    // If the token is still valid, there is no need to refresh it.
    // refreshToken();
}

export function deactivate() {
    // const globalState = getGlobalState();
    // globalState.activeSession?.dispose();
    // globalState.activeSession = null;
    // globalState.storage = null;
}
