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
      command: 'getAuth',
      hasReturn: true,
    });
    if (result?.data.token) {
      this.onLoggedGitHub(result?.data.token!, result?.data.realm);
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

  // @action login = async (username: string, password: string) => {
  //   const result = await this.rootStore.workspaceService.login(
  //     username,
  //     password,
  //   );
  //   if (!result.status) {
  //     this.onLoggedOut();
  //     return result;
  //   }
  //   this.onLoggedIn(result.token!);
  //   const workspaces = await this.rootStore.workspaceService.listWorkspace();
  //   const lastWorkspace = this.getLastBiggestIdObject(workspaces);
  //   if (!lastWorkspace) {
  //     return result;
  //   }
  //   this.rootStore.zulipService.setRealm(lastWorkspace.workspace_realm);
  //   this.rootStore.postMessageToVSCode({
  //     command: 'onSelectRealm',
  //     data: {
  //       realm: lastWorkspace.workspace_realm,
  //     },
  //   });
  //   this.rootStore.realmStore.currentRealm = {
  //     realm_string: lastWorkspace.workspace_realm,
  //   };
  //   await this.rootStore.channelStore.loadData();
  //   await this.rootStore.getCurrentUser();
  //   await this.rootStore.getWorkspaceMembers();
  //   this.isLogin = true;
  //   return result;
  // };

  // @action loginUri = async (token: string, realm: string) => {
  //   this.onLoggedIn(token);
  //   this.rootStore.zulipService.setRealm(realm);
  //   this.rootStore.postMessageToVSCode({
  //     command: 'onSelectRealm',
  //     data: {
  //       realm: realm,
  //     },
  //   });
  //   this.rootStore.realmStore.currentRealm = {
  //     realm_string: realm,
  //   };
  //   await this.rootStore.channelStore.loadData();
  //   await this.rootStore.getCurrentUser();
  //   await this.rootStore.getWorkspaceMembers();
  //   this.isLogin = true;
  // };

  @action logout() {
    this.onLoggedOut();
  }

  @action private onLoggedIn = async (token: string) => {
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
    this.rootStore.zulipService.setToken('');
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedOut',
    });
    this.rootStore.cleanup();
  };

  @action onMessageFromVSCode = async (message: IWebviewMessage) => {
    if (message.command === 'doLogout') {
      return this.onLoggedOut();
    } else if (message.command === 'loginUriGitHub') {
      if (message.data) {
        console.log('message from command login URI GITHUB ', message.data);
        this.loginGithub(message.data?.token, message.data?.realm);
      }
    }
  };

  @action loginGithub = async (token: string, realm: string) => {
    console.log('INTO LOGIN GITHUB');
    this.onLoggedGitHub(token, realm);
    return;
  };

  @action onLoggedGitHub = async (token: string, realm: string) => {
    this.rootStore.zulipService.setToken(token);
    console.log('TOKEN SET WHEN LOGIN GITHUB ', token);
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedIn',
      data: {
        token,
      },
    });
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
}
