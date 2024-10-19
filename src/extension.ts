import * as vscode from 'vscode';
import { ChatPanelProvider } from '@v-collab/vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "v-collab" is now active!');

  context.subscriptions.push(new ChatPanelProvider().build());
  // context.subscriptions.push(new PreviewPanelProvider().build());
}

export function deactivate() {}
