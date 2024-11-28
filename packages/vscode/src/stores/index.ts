import { ExtensionContext, WebviewPanel, commands } from 'vscode';
import { ChatPanelProvider, PreviewPanelProvider } from '../views';
import { UriHandler } from '../handlers';
import {
  // chat
  HistoryCommand,
  InlineChatCommand,
  // coding
  AddFileCommand,
  AddSelectionCommand,
  AskAICommand,
  CodingCommand,
  // preview
  AcceptChangeCommand,
  RejectChangeCommand,
  // setting
  OpenSettingCommand,
  ChangeWorkspaceCommand,
  LogoutCommand,
  NewTopicCommand,
  AddImageCommand,
} from '../commands';
import {
  CodeActionProvider,
  EditorCommentProvider,
  MemoryFileProvider,
  StatusBarIconProvider,
} from '../providers';
import { Logger } from '../utils/logger';
import { AuthStore } from './auth.store';

export class RootStore {
  // stores
  authStore = new AuthStore(this);

  // providers
  memoryFileProvider = new MemoryFileProvider();
  editorCommentProvider = new EditorCommentProvider(this);
  codeActionProvider = new CodeActionProvider(this);
  statusBarIconProvider = new StatusBarIconProvider();
  // views
  chatPanelProvider = new ChatPanelProvider(this);
  previewPanelProvider = new PreviewPanelProvider(this);
  // handlers
  uriHandler: UriHandler = new UriHandler(this);
  // commands
  historyCommand = new HistoryCommand(this);
  inlineChatCommand = new InlineChatCommand(this);
  newTopicCommand = new NewTopicCommand(this);

  addFileCommand = new AddFileCommand(this);
  addImageCommand = new AddImageCommand(this);
  addSelectionCommand = new AddSelectionCommand(this);
  askAICommand = new AskAICommand(this);
  genCodeCommand = new CodingCommand(this, 'gen-code');
  genTestCommand = new CodingCommand(this, 'gen-test');
  debugCommand = new CodingCommand(this, 'debug');
  commendCommand = new CodingCommand(this, 'comment');
  portingCommand = new CodingCommand(this, 'porting');
  explainCommand = new CodingCommand(this, 'explain');
  improveCommand = new CodingCommand(this, 'improve');
  reviewCommand = new CodingCommand(this, 'review');
  fixbugCommand = new CodingCommand(this, 'fixbug');

  createTableCommand = new CodingCommand(this, 'db_create_table');
  createQueryCommand = new CodingCommand(this, 'db_create_query');
  modifyTableCommand = new CodingCommand(this, 'db_modify_table');
  modifyQueryCommand = new CodingCommand(this, 'db_modify_query');
  optimizeQueryCommand = new CodingCommand(this, 'db_optimize_query');
  fixQueryCommand = new CodingCommand(this, 'db_fix_query');
  formatQuery = new CodingCommand(this, 'db_format_query');
  explainQuery = new CodingCommand(this, 'db_explain_query');
  generateData = new CodingCommand(this, 'db_generate_data');

  acceptChangeCommand = new AcceptChangeCommand(this);
  rejectChangeCommand = new RejectChangeCommand(this);

  openSettingCommand = new OpenSettingCommand(this);
  changeWorkspaceCommand = new ChangeWorkspaceCommand(this);
  logoutCommand = new LogoutCommand(this);

  get extensionVersion(): string {
    return this.context.extension.packageJSON.version;
  }

  constructor(private context: ExtensionContext) {}

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
    this.context.subscriptions.push(this.historyCommand.register());
    this.context.subscriptions.push(this.inlineChatCommand.register());
    this.context.subscriptions.push(this.newTopicCommand.register());

    this.context.subscriptions.push(this.addFileCommand.register());
    this.context.subscriptions.push(this.addImageCommand.register());
    this.context.subscriptions.push(this.addSelectionCommand.register());
    this.context.subscriptions.push(this.askAICommand.register());
    this.context.subscriptions.push(this.genCodeCommand.register());
    this.context.subscriptions.push(this.genTestCommand.register());
    this.context.subscriptions.push(this.debugCommand.register());
    this.context.subscriptions.push(this.commendCommand.register());
    this.context.subscriptions.push(this.portingCommand.register());
    this.context.subscriptions.push(this.explainCommand.register());
    this.context.subscriptions.push(this.improveCommand.register());
    this.context.subscriptions.push(this.reviewCommand.register());
    this.context.subscriptions.push(this.fixbugCommand.register());

    // db command
    this.context.subscriptions.push(this.createTableCommand.register());
    this.context.subscriptions.push(this.createQueryCommand.register());
    this.context.subscriptions.push(this.modifyTableCommand.register());
    this.context.subscriptions.push(this.modifyQueryCommand.register());
    this.context.subscriptions.push(this.optimizeQueryCommand.register());
    this.context.subscriptions.push(this.fixQueryCommand.register());
    this.context.subscriptions.push(this.formatQuery.register());
    this.context.subscriptions.push(this.explainQuery.register());
    this.context.subscriptions.push(this.generateData.register());

    this.context.subscriptions.push(this.acceptChangeCommand.register());
    this.context.subscriptions.push(this.rejectChangeCommand.register());

    this.context.subscriptions.push(this.openSettingCommand.register());
    this.context.subscriptions.push(this.changeWorkspaceCommand.register());
    this.context.subscriptions.push(this.logoutCommand.register());
  };

  registerPanel = (panel: WebviewPanel) => {
    this.context.subscriptions.push(panel);
  };

  getState = (key: string) => {
    return this.context.globalState.get(key);
  };

  setState = (key: string, value: any) => {
    this.context.globalState.update(key, value);
  };

  setContext = (name: string, value: any) => {
    commands.executeCommand('setContext', name, value);
  };
}
