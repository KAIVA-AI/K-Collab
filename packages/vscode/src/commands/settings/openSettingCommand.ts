import { commands, Disposable, QuickPickItem, window } from 'vscode';
import { RootStore } from 'src/stores';
import { ChangeWorkspaceCommand } from './changeWorkspaceCommand';
import { LogoutCommand } from './logoutCommand';

const COMMAND_ID = 'v-collab.command.setting.open';

interface ISettingOption extends QuickPickItem {
  command: string;
}

export class OpenSettingCommand {
  static COMMAND_ID = COMMAND_ID;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async (): Promise<void> => {
    const options = [
      ChangeWorkspaceCommand.quickPickItem,
      LogoutCommand.quickPickItem,
    ];
    const selection = await window.showQuickPick<ISettingOption>(options, {
      title: 'V-Collab Menu',
      placeHolder: 'Select an option',
    });
    if (!selection) {
      return;
    }
    commands.executeCommand(selection.command);
  };
}
