import * as vscode from 'vscode';
import { RootStore } from './stores';
import { Logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext) {
  new RootStore(context).register();

  Logger.log('Extension "V-Collab" activated');
}

export function deactivate() {}
