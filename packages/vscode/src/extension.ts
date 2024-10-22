import * as vscode from 'vscode';
import { RootStore } from './stores';

export function activate(context: vscode.ExtensionContext) {
  new RootStore(context).register();
  const outputChannel = vscode.window.createOutputChannel('v-collab', {
    log: true,
  });
  outputChannel.appendLine('Hello World!');

  console.log('Congratulations, your extension "v-collab" is now active!');
}

export function deactivate() {}
