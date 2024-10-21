import * as vscode from 'vscode';
import { RootStore } from './stores';

export function activate(context: vscode.ExtensionContext) {
  new RootStore(context).register();
  const commentController = vscode.comments.createCommentController(
    'comment-sample',
    'Comment API Sample',
  );
  context.subscriptions.push(commentController);
  commentController.commentingRangeProvider = {
    provideCommentingRanges: (document: vscode.TextDocument) => {
      const lineCount = document.lineCount;
      return [new vscode.Range(0, 0, lineCount - 1, 0)];
    },
  };
  // get line number of comment
  // vscode.window.activeTextEditor?.selection.active.line

  console.log('Congratulations, your extension "v-collab" is now active!');
}

export function deactivate() {}
