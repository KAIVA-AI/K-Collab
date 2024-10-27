import { ExtensionContext, WebviewPanel } from 'vscode';
import { ChatPanelProvider, PreviewPanelProvider } from '../views';
import { UriHandler } from '../handlers';
import {
  AcceptChangeCommand,
  AddFileCommand,
  AddSelectionCommand,
  AskAICommand,
  CodingCommand,
  HistoryCommand,
  InlineChatCommand,
  RejectChangeCommand,
  SettingCommand,
} from '../commands';
import {
  CodeActionProvider,
  EditorCommentProvider,
  MemoryFileProvider,
  StatusBarIconProvider,
} from '../providers';
import { Logger } from '../utils/logger';

export class RootStore {
  // providers
  memoryFileProvider: MemoryFileProvider = new MemoryFileProvider();
  editorCommentProvider = new EditorCommentProvider(this);
  codeActionProvider = new CodeActionProvider(this);
  statusBarIconProvider: StatusBarIconProvider = new StatusBarIconProvider();
  // views
  chatPanelProvider: ChatPanelProvider;
  previewPanelProvider: PreviewPanelProvider = new PreviewPanelProvider(this);
  // handlers
  uriHandler: UriHandler;
  // commands
  addSelectionCommand: AddSelectionCommand;
  addFileCommand: AddFileCommand;
  historyCommand: HistoryCommand = new HistoryCommand(this);
  genCodeCommand: CodingCommand = new CodingCommand(this, 'gen-code');
  genTestCommand: CodingCommand = new CodingCommand(this, 'gen-test');
  debugCommand: CodingCommand = new CodingCommand(this, 'debug');
  commendCommand: CodingCommand = new CodingCommand(this, 'comment');
  portingCommand: CodingCommand = new CodingCommand(this, 'porting');
  explainCommand: CodingCommand = new CodingCommand(this, 'explain');
  improveCommand: CodingCommand = new CodingCommand(this, 'improve');
  reviewCommand: CodingCommand = new CodingCommand(this, 'review');
  askAICommand: AskAICommand = new AskAICommand(this);
  inlineChatCommand: InlineChatCommand = new InlineChatCommand(this);
  acceptChangeCommand: AcceptChangeCommand = new AcceptChangeCommand(this);
  rejectChangeCommand: RejectChangeCommand = new RejectChangeCommand(this);
  settingCommand: SettingCommand = new SettingCommand(this);

  get extensionVersion(): string {
    return this.context.extension.packageJSON.version;
  }

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
    this.context.subscriptions.push(this.memoryFileProvider.register());
    this.context.subscriptions.push(this.editorCommentProvider.register());
    this.context.subscriptions.push(this.codeActionProvider.register());
    this.context.subscriptions.push(this.statusBarIconProvider.register());
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
    this.context.subscriptions.push(this.commendCommand.register());
    this.context.subscriptions.push(this.portingCommand.register());
    this.context.subscriptions.push(this.explainCommand.register());
    this.context.subscriptions.push(this.improveCommand.register());
    this.context.subscriptions.push(this.reviewCommand.register());
    this.context.subscriptions.push(this.askAICommand.register());
    this.context.subscriptions.push(this.inlineChatCommand.register());
    this.context.subscriptions.push(this.acceptChangeCommand.register());
    this.context.subscriptions.push(this.rejectChangeCommand.register());
    this.context.subscriptions.push(this.settingCommand.register());
  };

  registerPanel = (panel: WebviewPanel) => {
    this.context.subscriptions.push(panel);
  };
}
