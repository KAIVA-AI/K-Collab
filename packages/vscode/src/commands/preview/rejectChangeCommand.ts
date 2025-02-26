import { commands, Disposable, window } from 'vscode';
import { RootStore } from '../../stores';

const COMMAND_ID = 'k-collab.command.preview.reject';

export class RejectChangeCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = () => {
    const previewEditor = window.activeTextEditor;
    if (!previewEditor) {
      return;
    }
    this.rootStore.memoryFileProvider.closePreviewTabByUri(
      previewEditor.document.uri,
    );
  };
}
