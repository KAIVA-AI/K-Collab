import { ExtensionContext } from 'vscode';
import { ChatPanelProvider } from '../views';
import { UriHandler } from '../handlers';
import {
  AddFileCommand,
  AddSelectionCommand,
  AskAICommand,
  CodingCommand,
  HistoryCommand,
  InlineChatCommand,
} from '../commands';
import { EditorCommentProvider } from '../providers';
import { Logger } from '../utils/logger';

export class RootStore {
  // providers
  editorCommentProvider = new EditorCommentProvider(this);
  // views
  chatPanelProvider: ChatPanelProvider;
  // handlers
  uriHandler: UriHandler;
  // commands
  addSelectionCommand: AddSelectionCommand;
  addFileCommand: AddFileCommand;
  historyCommand: HistoryCommand = new HistoryCommand(this);
  genCodeCommand: CodingCommand = new CodingCommand(this, 'gen-code');
  genTestCommand: CodingCommand = new CodingCommand(this, 'gen-test');
  debugCommand: CodingCommand = new CodingCommand(this, 'debug');
  portingCommand: CodingCommand = new CodingCommand(this, 'porting');
  explainCommand: CodingCommand = new CodingCommand(this, 'explain');
  improveCommand: CodingCommand = new CodingCommand(this, 'improve');
  reviewCommand: CodingCommand = new CodingCommand(this, 'review');
  askAICommand: AskAICommand = new AskAICommand(this);
  inlineChatCommand: InlineChatCommand = new InlineChatCommand(this);

  constructor(private context: ExtensionContext) {
    this.chatPanelProvider = new ChatPanelProvider(this);
    this.uriHandler = new UriHandler(this, context);
    // commands
    this.addSelectionCommand = new AddSelectionCommand(this);
    this.addFileCommand = new AddFileCommand(this);
  }

  register = () => {
    Logger.register();
    // providers
    this.context.subscriptions.push(this.editorCommentProvider.register());
    // views
    this.context.subscriptions.push(this.chatPanelProvider.register());
    // handlers
    this.context.subscriptions.push(this.uriHandler.register());
    // commands
    this.context.subscriptions.push(this.addSelectionCommand.register());
    this.context.subscriptions.push(this.addFileCommand.register());
    this.context.subscriptions.push(this.historyCommand.register());
    this.context.subscriptions.push(this.genCodeCommand.register());
    this.context.subscriptions.push(this.genTestCommand.register());
    this.context.subscriptions.push(this.debugCommand.register());
    this.context.subscriptions.push(this.portingCommand.register());
    this.context.subscriptions.push(this.explainCommand.register());
    this.context.subscriptions.push(this.improveCommand.register());
    this.context.subscriptions.push(this.reviewCommand.register());
    this.context.subscriptions.push(this.askAICommand.register());
    this.context.subscriptions.push(this.inlineChatCommand.register());
  };
}
