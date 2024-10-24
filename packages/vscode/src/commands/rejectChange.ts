import { commands, Disposable, window } from 'vscode';
import { RootStore } from '../stores';
import { MemoryFileProvider } from 'src/providers/memoryFileProvider';

const COMMAND_ID = 'v-collab.command.preview.reject';

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
    MemoryFileProvider.closePreviewTabByUri(previewEditor.document.uri);
  };
}
