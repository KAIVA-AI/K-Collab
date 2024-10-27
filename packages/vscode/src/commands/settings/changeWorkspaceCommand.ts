import { commands, Disposable } from 'vscode';
import { RootStore } from 'src/stores';

const COMMAND_ID = 'v-collab.command.setting.change-workspace';
const COMMAND_TITLE = '$(account) Change workspace';

export class ChangeWorkspaceCommand {
  static COMMAND_ID = COMMAND_ID;
  static COMMAND_TITLE = COMMAND_TITLE;
  static get quickPickItem() {
    return {
      label: ChangeWorkspaceCommand.COMMAND_TITLE,
      command: ChangeWorkspaceCommand.COMMAND_ID,
    };
  }

  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async (): Promise<void> => {};
}
