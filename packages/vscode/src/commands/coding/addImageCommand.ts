import { commands, Disposable } from 'vscode';
import { RootStore } from '../../stores';

const COMMAND_ID = 'k-collab.command.add-image';
const COMMAND_TITLE = 'Add Image to Chat';

export class AddImageCommand {
  static COMMAND_ID = COMMAND_ID;
  static COMMAND_TITLE = COMMAND_TITLE;
  constructor(private rootStore: RootStore) {}

  register = (): Disposable => {
    return commands.registerCommand(COMMAND_ID, this.#execute);
  };

  #execute = async () => {
    this.rootStore.chatPanelProvider.addImageToTopic({
      // TODO hardcode image path
      name: 'image_2024_10_29T21_42_06_543Z.png',
      path: '/user_uploads/4/9e/6P8YUpC4lTNLkr9NG_z-Sx_4/image_2024_10_29T21_42_06_543Z.png',
    });
  };
}
