import { commands, Disposable } from 'vscode';
import { RootStore } from 'src/stores';

const COMMAND_ID = 'v-collab.command.setting.setting';
const COMMAND_TITLE = '$(gear) setting';

export class SettingCommand {
  static COMMAND_ID = COMMAND_ID;
  static COMMAND_TITLE = COMMAND_TITLE;
  static get quickPickItem() {
    return {
      label: SettingCommand.COMMAND_TITLE,
      command: SettingCommand.COMMAND_ID,
    };
  }

  constructor(private rootStore: RootStore) { }

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async (): Promise<void> => {
    this.rootStore.chatPanelProvider.openSetting();
  };
}
