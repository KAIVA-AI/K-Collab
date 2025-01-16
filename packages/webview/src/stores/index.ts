import { createContext, useContext } from 'react';
import { RealmStore } from './realm.store';
import { ChannelStore } from './channel.store';
import { MessageStore } from './message.store';
import { TopicStore } from './topic.store';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { ChatViewModel } from '../pages/chat/chat.viewmodel';
import { IWebviewMessage, IZulipUser } from '../models';
import { Constants, WorkspaceService, ZulipService } from '@v-collab/common';
import { v4 as uuidV4 } from 'uuid';
import { AuthStore } from './auth.store';
import { SettingStore } from './setting.store';

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const getVSCodeApi = () => {
  if (typeof acquireVsCodeApi === 'undefined') {
    return {
      postMessage: () => { },
      getState: () => { },
      setState: () => { },
    };
  }
  return acquireVsCodeApi();
};

type IWebviewMessageHandler = (message: IWebviewMessage) => void;
interface IWebviewMessageHandlerMap {
  [key: string]: IWebviewMessageHandler;
}

export class RootStore {
  private vscode = getVSCodeApi();
  authStore = new AuthStore(this);
  realmStore = new RealmStore(this);
  channelStore = new ChannelStore(this);
  topicStore = new TopicStore(this);
  messageStore = new MessageStore(this);
  settingStore = new SettingStore(this);
  chatViewModel = new ChatViewModel(this);
  private eventListeners: IWebviewMessageHandlerMap = {};

  workspaceService = new WorkspaceService();
  zulipService: ZulipService;

  @observable currentProjectMembers: IZulipUser[] = [];
  @observable currentUser: IZulipUser | null = null;

  @observable typingUsers: number[] = [];
  @observable private initialized = false;
  @observable currentTheme = 'dark';
  @observable webviewVersion = '1.0.0';
  @observable extensionVersion = '';
  @observable wakedUp = false;
  @observable pageRouter = 'chat-panel';

  @computed get useDarkTheme() {
    return this.currentTheme === 'dark';
  }

  @computed get isVersionMismatch() {
    return this.webviewVersion !== this.extensionVersion;
  }
  @computed get linkToDownload() {
    return `${Constants.WEB_URL}/vscode/v-collab-${this.webviewVersion}.vsix`;
  }

  constructor() {
    makeObservable(this);
    this.zulipService = new ZulipService();
  }

  @action init = async () => {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    await this.registerVSCodeListener();
    await this.checkExtensionVersion();
    await this.getPageRouter();
    await this.authStore.wakeup();
    runInAction(() => {
      this.wakedUp = true;
    });
    this.postMessageToVSCode({
      command: 'webviewWakedUp',
    });
  };

  @action private checkExtensionVersion = async () => {
    this.webviewVersion = Constants.WEB_VERSION;
    const extensionVersion = await this.postMessageToVSCode({
      command: 'getExtensionVersion',
      hasReturn: true,
    });
    extensionVersion &&
      runInAction(() => {
        this.extensionVersion = extensionVersion.data.version;
      });
  };

  @action private getPageRouter = async () => {
    const pageRouter = await this.postMessageToVSCode({
      command: 'getPageRouter',
      hasReturn: true,
    });
    pageRouter &&
      runInAction(() => {
        this.pageRouter = pageRouter.data.pageRouter;
      });
  };

  private registerVSCodeListener = async () => {
    if (!(window as any).isRegistered) {
      window.addEventListener('message', event => {
        const message: IWebviewMessage = event?.data as IWebviewMessage;
        if (message?.source !== 'vscode') {
          return;
        }
        this.onMessageFromVSCode(message);
      });
      (window as any).isRegistered = true;
    }
  };

  @action cleanup = () => {
    this.realmStore.cleanup();
    this.channelStore.cleanup();
    this.topicStore.cleanup();
    this.messageStore.cleanup();
  };

  addEventListener = (key: string, listener: IWebviewMessageHandler) => {
    this.eventListeners[key] = listener;
  };

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.command === 'updateWebviewTheme') {
      this.currentTheme = message.data.theme;
      return;
    }
    if (message.command === 'navigateTo') {
      if (message.data.page === 'workspace-page') {
        this.cleanup();
        return;
      }
    }
    if (message.webviewCallbackKey) {
      (window as any)[message.webviewCallbackKey](message);
      return;
    }
    if (message.store === 'AuthStore') {
      this.authStore.onMessageFromVSCode(message);
      return;
    }
    if (message.store === 'TopicStore') {
      this.topicStore.onMessageFromVSCode(message);
      return;
    }
    if (message.store === 'MessageStore') {
      this.messageStore.onMessageFromVSCode(message);
      return;
    }
    //
    if (message.store === 'SettingStore') {
      this.settingStore.onMessageFromVSCode(message);
    }

    const handler = this.eventListeners[message.store || ''];
    handler && handler(message);
  };

  @action postMessageToVSCode = async (
    message: IWebviewMessage,
  ): Promise<IWebviewMessage | undefined> => {
    if (!message.source) {
      message.source = 'webview';
    }
    if (!message.hasReturn) {
      this.vscode.postMessage(message);
      return;
    }
    let completed = false;
    return new Promise(resolve => {
      const id = uuidV4().split('-').join('');
      message.webviewCallbackKey = `webviewCallback${id}`;
      (window as any)[message.webviewCallbackKey] = (
        event: IWebviewMessage,
      ) => {
        completed = true;
        resolve(event);
      };
      this.vscode.postMessage(message);
      setTimeout(() => {
        if (!completed) resolve(undefined);
      }, 1000);
    });
  };

  @action raiseErrorMessageToVscodeWindow = async (message: string) => {
    (window as any).showErrorMessage(message);
  };

  @action setCurrentWebviewPageContext = async (context: string) => {
    await this.postMessageToVSCode({
      command: 'setCurrentWebviewPageContext',
      data: {
        context,
      },
    });
  };

  @computed get typingUsersInfo() {
    if (
      !this.currentProjectMembers ||
      !this.typingUsers ||
      this.typingUsers.length === 0
    ) {
      return [];
    }

    const find: IZulipUser[] = [];
    this.typingUsers.forEach(id => {
      const item = this.currentProjectMembers.find(mem => mem.user_id === id);
      item && item.user_id !== this.currentUser?.user_id && find.push(item);
    });

    return find;
  }

  @action getWorkspaceMembers = async () => {
    if (this.currentProjectMembers.length > 0) {
      return;
    }
    const response = await this.zulipService.getWorkspaceMembers();
    if (response && response.members) {
      this.currentProjectMembers = response.members
        ? response.members.filter((x: IZulipUser) => x.full_name && x.is_active)
        : [];
    }
  };

  @action getCurrentUser = async () => {
    if (this.currentUser !== null) {
      return;
    }
    const response = await this.zulipService.getProfileUser();
    if (response) {
      this.currentUser = response;
    }
  };
}

export const rootStore = new RootStore();
const rootStoreContext = createContext(rootStore);
export const useRootStore = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within a Provider');
  }
  return store;
};
export { RealmStore, ChannelStore, TopicStore, MessageStore };
