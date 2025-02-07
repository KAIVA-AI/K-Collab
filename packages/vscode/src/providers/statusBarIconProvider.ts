import { OpenSettingCommand } from 'src/commands';
import { StatusBarItem, StatusBarAlignment, window, Disposable } from 'vscode';

export class StatusBarIconProvider {
  private statusBarItem: StatusBarItem;

  constructor() {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
    this.statusBarItem.text = '$(k-collab-icon) K-Collab';
    this.statusBarItem.tooltip = 'K-Collab Menu';
    this.statusBarItem.command = OpenSettingCommand.COMMAND_ID;
  }

  register = (): Disposable => {
    this.statusBarItem.show();
    return this.statusBarItem;
  };
}
