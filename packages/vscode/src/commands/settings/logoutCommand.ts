import { commands, Disposable } from 'vscode';
import { RootStore } from 'src/stores';

const COMMAND_ID = 'k-collab.command.setting.logout';
const COMMAND_TITLE = '$(log-out) Logout';

export class LogoutCommand {
  static COMMAND_ID = COMMAND_ID;
  static COMMAND_TITLE = COMMAND_TITLE;
  static get quickPickItem() {
    return {
      label: LogoutCommand.COMMAND_TITLE,
      command: LogoutCommand.COMMAND_ID,
    };
  }

  constructor(private rootStore: RootStore) { }

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async (): Promise<void> => {
    this.rootStore.chatPanelProvider.doLogout();
  };
}
