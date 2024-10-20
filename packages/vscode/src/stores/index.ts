import { ExtensionContext } from 'vscode';
import { ChatPanelProvider } from '../views';
import { UriHandler } from '../handlers';
import { AddSelectionCommand } from '../commands/addSelectionCommand';
import { AddFileCommand } from '../commands/addFileCommand';

export class RootStore {
  chatPanelProvider: ChatPanelProvider;
  uriHandler: UriHandler;
  // commands
  addSelectionCommand: AddSelectionCommand;
  addFileCommand: AddFileCommand;

  constructor(private context: ExtensionContext) {
    this.chatPanelProvider = new ChatPanelProvider(this);
    this.uriHandler = new UriHandler(this, context);
    // commands
    this.addSelectionCommand = new AddSelectionCommand(this);
    this.addFileCommand = new AddFileCommand(this);
  }

  register = () => {
    this.context.subscriptions.push(this.chatPanelProvider.register());
    this.context.subscriptions.push(this.uriHandler.register());
    // commands
    this.context.subscriptions.push(this.addSelectionCommand.register());
    this.context.subscriptions.push(this.addFileCommand.register());
  };
}
