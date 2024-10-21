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
      // do not display when document is output channel
      if (document.uri.scheme === 'output') {
        return [];
      }
      const lineCount = document.lineCount;
      return [new vscode.Range(0, 0, lineCount - 1, 0)];
    },
  };
  // get line number of comment
  // vscode.window.activeTextEditor?.selection.active.line
  const outputChannel = vscode.window.createOutputChannel('v-collab', {
    log: true,
  });
  outputChannel.appendLine('Hello World!');

  console.log('Congratulations, your extension "v-collab" is now active!');
}

export function deactivate() {}
