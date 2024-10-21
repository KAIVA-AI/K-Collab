import { commands, Disposable, window } from 'vscode';
import { RootStore } from '../stores';
import path from 'path';

const COMMAND_ID = 'v-collab.command.ask-ai';

export class AskAICommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    let file = path.basename(editor.document.fileName);
    const filepath = editor.document.uri.path;
    const lineStart = editor.selection.start.line + 1;
    const lineEnd = editor.selection.end.line + 1;
    const content = editor.document.getText(editor.selection);
    this.rootStore.chatPanelProvider.startNewTopic({
      topic: `ask-${new Date().getTime()}`,
      file: {
        name: file,
        path: filepath,
        start: lineStart,
        end: lineEnd,
        content,
      },
    });
  };
}
