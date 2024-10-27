import { commands, Disposable, window } from 'vscode';
import { RootStore } from 'src/stores';

const COMMAND_ID = 'v-collab.command.setting';

export class SettingCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async (): Promise<void> => {
    const options = [
      //
      'Change workspace',
      'Logout',
    ];
    const selection = await window.showQuickPick(options, {
      title: 'V-Collab Menu',
      placeHolder: 'Select an option',
    });
    if (!selection) {
      return;
    }
  };
}
