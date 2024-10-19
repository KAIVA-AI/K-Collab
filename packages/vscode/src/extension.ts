import * as vscode from 'vscode';
import { ChatPanelProvider } from './views';
import { UriHandler } from './handlers';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "v-collab" is now active!');

  context.subscriptions.push(new ChatPanelProvider().build());
  context.subscriptions.push(new UriHandler().register());
}

export function deactivate() {}
