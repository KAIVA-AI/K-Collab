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
    console.log('InlineChatCommand#execute', reply);
    const filepath = reply.thread.uri.path;
    const filename = path.basename(filepath);
    const lineStart = reply.thread.range.start.line + 1;
    const lineEnd = reply.thread.range.end.line + 1;
    const editor = window.visibleTextEditors.find(
      editor => editor.document.uri.path === reply.thread.uri.path,
    );
    if (editor?.document.uri.scheme === 'output') {
      const content = editor?.document.getText();
      console.log(content);
    }
    const content = editor?.document.getText(reply.thread.range);
    this.rootStore.chatPanelProvider.startNewTopic({
      topic: `ask-${new Date().getTime()}`,
      file: {
        path: filepath,
        name: filename,
        start: lineStart,
        end: lineEnd,
        content,
      },
      content: reply.text,
    });
    //close the discussion panel
    reply.thread.dispose();
  };
}
