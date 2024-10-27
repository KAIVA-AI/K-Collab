import { commands, Disposable, window } from 'vscode';
import { RootStore } from '../../stores';
import path from 'path';

const COMMAND_ID = 'v-collab.command.add-selection';
const COMMAND_TITLE = 'Add Selection to Chat';

export class AddSelectionCommand {
  static COMMAND_ID = COMMAND_ID;
  static COMMAND_TITLE = COMMAND_TITLE;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    let file = path.basename(editor.document.fileName);
    const filepath = editor.document.uri.path;
    const lineStart = editor.selection.start.line + 1;
    const lineEnd = editor.selection.end.line + 1;
    const content = editor.document.getText(editor.selection);
    this.rootStore.chatPanelProvider.addFileToTopic({
      name: file,
      path: filepath,
      start: `${lineStart}`,
      end: `${lineEnd}`,
      content,
    });
  };
}
