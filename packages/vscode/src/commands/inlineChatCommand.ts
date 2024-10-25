import { commands, Disposable, window, CommentReply } from 'vscode';
import { RootStore } from '../stores';
import path from 'path';

const COMMAND_ID = 'v-collab.command.inline.chat';

export class InlineChatCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = (reply: CommentReply) => {
    const filepath = reply.thread.uri.path;
    const filename = path.basename(filepath);
    let lineStart: number | undefined = undefined;
    let lineEnd: number | undefined = undefined;
    let content = '';
    const editor = window.visibleTextEditors.find(
      editor => editor.document.uri.path === reply.thread.uri.path,
    );
    // not yet support output channel
    // if (editor?.document.uri.scheme === 'output') {
    //   const content = editor?.document.getText();
    // }
    // TODO not work as expected yet
    if (editor?.selection.isEmpty) {
      // TODO select this line instead of the whole file
      content = editor.document.getText();
    } else {
      lineStart = reply.thread.range.start.line + 1;
      lineEnd = reply.thread.range.end.line + 1;
      content = editor?.document.getText(reply.thread.range) ?? '';
    }
    this.rootStore.chatPanelProvider.startNewTopic({
      topic: `ask-${new Date().getTime()}`,
      file: {
        path: filepath,
        name: filename,
        start: lineStart !== undefined ? `${lineStart}` : undefined,
        end: lineEnd !== undefined ? `${lineEnd}` : undefined,
        content,
      },
      content: reply.text,
    });
    //close the discussion panel
    reply.thread.dispose();
  };
}
