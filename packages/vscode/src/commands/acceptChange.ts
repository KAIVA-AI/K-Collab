import { commands, Disposable, window, Range } from 'vscode';
import { RootStore } from '../stores';
import { MemoryFileProvider } from 'src/providers/memoryFileProvider';

const COMMAND_ID = 'v-collab.command.preview.accept';

export class AcceptChangeCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async () => {
    const previewEditor = window.activeTextEditor;
    if (!previewEditor) {
      return;
    }
    const doc = this.rootStore.memoryFileProvider.getDocumentByUri(
      previewEditor.document.uri,
    );
    await MemoryFileProvider.closePreviewTabByUri(previewEditor.document.uri);

    if (!doc) {
      return;
    }
    console.log(window.visibleTextEditors.map(editor => editor.document.uri));
    const editor = window.visibleTextEditors.find(
      editor => editor.document.uri.path === doc.originUri.path,
    );
    if (editor) {
      editor.edit(editBuilder => {
        const lineStart = editor.document.lineAt(doc.startLine - 1).range.start;
        const lineEnd = editor.document.lineAt(doc.endLine - 1).range.end;
        editBuilder.replace(new Range(lineStart, lineEnd), doc.newContents);
      });
    }
  };
}
