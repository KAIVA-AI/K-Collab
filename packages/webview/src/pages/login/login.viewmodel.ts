import { Constants } from '@k-collab/common';
import { observable, action, computed, makeObservable } from 'mobx';
import { ChangeEventHandler } from 'react';
import { RootStore } from 'src/stores';

export class LoginViewModel {
  @observable username = '';
  @observable password = '';
  @observable errorMessage = '';

  @computed get testAccount() {
    return Constants.USER_EMAIL;
  }

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action onChangeUsername: ChangeEventHandler<HTMLInputElement> = event => {
    this.username = event.target.value;
  };

  @action onChangePassword: ChangeEventHandler<HTMLInputElement> = event => {
    this.password = event.target.value;
  };

  // @action login = async () => {
  //   const result = await this.rootStore.authStore.login(
  //     this.username,
  //     this.password,
  //   );
  //   if (!result.status) {
  //     this.errorMessage = result.message || 'Login fail';
  //     return;
  //   }
  // };

  @action LogginSuccess = async () => {
    this.rootStore.authStore.isLogin = true;
  };

  // @action loginUri = async (token: string, realm: string) => {
  //   await this.rootStore.authStore.loginUri(token, realm);
  //   // if (!result.status) {
  //   //   this.errorMessage = result.message || 'Login fail';
  //   //   // return;
  //   // }
  // };

  // @action loginTest = () => {
  //   this.rootStore.authStore.onLoggedInTest();
  // };

  // @action openGitHubLogin = () => {
  //   this.rootStore.postMessageToVSCode;
  // };
}
