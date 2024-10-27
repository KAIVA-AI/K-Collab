import { commands, Disposable, window } from 'vscode';
import { RootStore } from '../../stores';
import path from 'path';

const COMMAND_ID = 'v-collab.command.coding';

export class CodingCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(
    private rootStore: RootStore,
    private subCommand: string,
  ) {}

  getCommandId = () => `${COMMAND_ID}.${this.subCommand}`;

  register = (): Disposable => {
    return commands.registerCommand(
      `${COMMAND_ID}.${this.subCommand}`,
      this.#execute,
    );
  };

  #execute = () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    let file = path.basename(editor.document.fileName);
    const filepath = editor.document.uri.path;
    let lineStart: number | undefined = undefined;
    let lineEnd: number | undefined = undefined;
    let content = '';
    // if no selecting, get the whole line
    if (editor.selection.isEmpty) {
      content = editor.document.getText();
    } else {
      lineStart = editor.selection.start.line + 1;
      lineEnd = editor.selection.end.line + 1;
      content = editor.document.getText(editor.selection);
    }
    this.rootStore.chatPanelProvider.startNewTopic({
      topic: `${this.subCommand}-${new Date().getTime()}`,
      file: {
        name: file,
        path: filepath,
        start: lineStart !== undefined ? `${lineStart}` : undefined,
        end: lineEnd !== undefined ? `${lineEnd}` : undefined,
        content,
      },
      content: `/${this.subCommand}`,
    });
  };
}
