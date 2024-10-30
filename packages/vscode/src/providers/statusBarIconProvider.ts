import { OpenSettingCommand } from 'src/commands';
import { StatusBarItem, StatusBarAlignment, window, Disposable } from 'vscode';

export class StatusBarIconProvider {
  private statusBarItem: StatusBarItem;

  constructor() {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
    this.statusBarItem.text = '$(v-collab-icon) V-Collab';
    this.statusBarItem.tooltip = 'V-Collab Menu';
    this.statusBarItem.command = OpenSettingCommand.COMMAND_ID;
  }

  register = (): Disposable => {
    this.statusBarItem.show();
    return this.statusBarItem;
  };
}
