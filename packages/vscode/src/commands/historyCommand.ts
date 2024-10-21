import { commands, Disposable } from 'vscode';
import { RootStore } from '../stores';

const COMMAND_ID = 'v-collab.command.chat.history';

export class HistoryCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = () => {
    this.rootStore.chatPanelProvider.backToTopicPage();
  };
}
