import { RootStore } from 'src/stores';
import * as vscode from 'vscode';

export class CodeActionProvider implements vscode.CodeActionProvider {
  constructor(private rootStore: RootStore) {}

  provideCodeActions(): vscode.ProviderResult<
    (vscode.Command | vscode.CodeAction)[]
  > {
    const action = new vscode.CodeAction(
      'Generate Code',
      vscode.CodeActionKind.QuickFix,
    );
    action.command = {
      title: 'CodeLens',
      command: this.rootStore.genCodeCommand.getCommandId(),
    };
    return [action];
  }

  register = (): vscode.Disposable => {
    return vscode.languages.registerCodeActionsProvider(
      { language: '*', scheme: 'file' },
      this,
    );
  };
}
