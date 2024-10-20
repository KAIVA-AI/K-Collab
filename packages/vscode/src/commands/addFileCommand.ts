import { commands, Disposable, window } from 'vscode';
import { RootStore } from '../stores';
import path from 'path';

const COMMAND_ID = 'v-collab.command.add-file';
const COMMAND_TITLE = 'Add File to Chat';

export class AddFileCommand {
  static COMMAND_ID = COMMAND_ID;
  static COMMAND_TITLE = COMMAND_TITLE;
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
    this.rootStore.chatPanelProvider.addFileToTopic({
      name: file,
      path: filepath,
    });
  };
}
