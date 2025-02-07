import { action, makeObservable, observable } from 'mobx';
import { RootStore } from '.';
import { IWebviewMessage } from 'src/models';
import { Constants } from '@k-collab/common';
import { IWorkspace } from '../../../common/src/models';

export class AuthStore {
  @observable isLogin: boolean = false;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action wakeup = async () => {
    const result = await this.rootStore.postMessageToVSCode({
      command: 'getToken',
      hasReturn: true,
    });
    if (result?.data.token) {
      this.onLoggedIn(result?.data.token!);
    } else {
      this.onLoggedOut();
    }
  };

  private getRealmFromUrl(url: string): string | undefined {
    const match = url.match(/^https?:\/\/([a-zA-Z0-9-]+)/);
    return match ? match[0] : undefined;
  }

  getLastBiggestIdObject = (
    workspaces: IWorkspace[],
  ): IWorkspace | undefined => {
    return workspaces.reduce(
      (maxWorkspace, currentWorkspace) => {
        return (maxWorkspace?.id ?? 0) > currentWorkspace.id
          ? maxWorkspace
          : currentWorkspace;
      },
      undefined as IWorkspace | undefined,
    );
  };

  @action login = async (username: string, password: string) => {
    const result = await this.rootStore.workspaceService.login(
      username,
      password,
    );
    if (!result.status) {
      this.onLoggedOut();
      return result;
    }
    this.onLoggedIn(result.token!);
    const workspaces = await this.rootStore.workspaceService.listWorkspace();
    const lastWorkspace = this.getLastBiggestIdObject(workspaces);
    if (!lastWorkspace) {
      return result;
    }
    this.rootStore.zulipService.setRealm(lastWorkspace.workspace_realm);
    this.rootStore.postMessageToVSCode({
      command: 'onSelectRealm',
      data: {
        realm: lastWorkspace.workspace_realm,
      },
    });
    this.rootStore.realmStore.currentRealm = {
      realm_string: lastWorkspace.workspace_realm,
    };
    await this.rootStore.channelStore.loadData();
    await this.rootStore.getCurrentUser();
    await this.rootStore.getWorkspaceMembers();
    this.isLogin = true;
    return result;
  };

  @action loginUri = async (token: string, realm: string) => {
    this.onLoggedIn(token);
    this.rootStore.zulipService.setRealm(realm);
    this.rootStore.postMessageToVSCode({
      command: 'onSelectRealm',
      data: {
        realm: realm,
      },
    });
    this.rootStore.realmStore.currentRealm = {
      realm_string: realm,
    };
    await this.rootStore.channelStore.loadData();
    await this.rootStore.getCurrentUser();
    await this.rootStore.getWorkspaceMembers();
    this.isLogin = true;
  };

  @action logout() {
    this.onLoggedOut();
  }

  @action private onLoggedIn = async (token: string) => {
    this.rootStore.workspaceService.setToken(token);
    this.rootStore.zulipService.setToken(token);
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedIn',
      data: {
        token,
      },
    });
    await this.rootStore.getCurrentUser();
    await this.rootStore.getWorkspaceMembers();
    this.isLogin = true;
  };

  @action private onLoggedOut = () => {
    this.isLogin = false;
    this.rootStore.workspaceService.setToken('');
    this.rootStore.zulipService.setToken('');
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedOut',
    });
    this.rootStore.cleanup();
  };

  @action onMessageFromVSCode = async (message: IWebviewMessage) => {
    if (message.command === 'doLogout') {
      return this.onLoggedOut();
    } else if (message.command === 'loginUri') {
      if (message.data) {
        const token = message.data?.token;
        const realm = message.data?.realm;
        this.loginUri(token, realm);
      }
    }
  };

  @action onLoggedUri = async () => {
    this.rootStore.cleanup();
    this.rootStore.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedInTest',
    });
    const realm = Constants.REALM_STRING;
    this.rootStore.zulipService.setRealm(realm);
    this.rootStore.postMessageToVSCode({
      command: 'onSelectRealm',
      data: {
        realm,
      },
    });
    this.rootStore.realmStore.currentRealm = {
      realm_string: realm,
    };

    await this.rootStore.channelStore.loadData();
    await this.rootStore.getCurrentUser();
    await this.rootStore.getWorkspaceMembers();
    this.isLogin = true;
  };

  @action onLoggedInTest = async () => {
    this.rootStore.cleanup();
    this.rootStore.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedInTest',
    });
    const realm = Constants.REALM_STRING;
    this.rootStore.zulipService.setRealm(realm);
    this.rootStore.postMessageToVSCode({
      command: 'onSelectRealm',
      data: {
        realm,
      },
    });
    this.rootStore.realmStore.currentRealm = {
      realm_string: realm,
    };
    await this.rootStore.channelStore.loadData();
    await this.rootStore.getCurrentUser();
    await this.rootStore.getWorkspaceMembers();
    this.isLogin = true;
  };
}
