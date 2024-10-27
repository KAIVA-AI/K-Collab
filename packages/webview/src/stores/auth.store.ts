import { action, makeObservable, observable } from 'mobx';
import { RootStore } from '.';
import { IWebviewMessage } from 'src/models';
import { Constants } from '@v-collab/common';

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
    return result;
  };

  @action logout() {
    this.onLoggedOut();
  }

  @action private onLoggedIn = (token: string) => {
    this.rootStore.workspaceService.setToken(token);
    this.rootStore.zulipService.setToken(token);
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedIn',
      data: {
        token,
      },
    });
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
    }
  };

  @action onLoggedInTest = () => {
    this.rootStore.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
    this.rootStore.postMessageToVSCode({
      command: 'onLoggedInTest',
    });
    this.isLogin = true;
  };
}
