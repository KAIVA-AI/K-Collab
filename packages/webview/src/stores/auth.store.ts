import { observable } from 'mobx';

export class AuthStore {
  @observable isLogin: boolean;
  constructor() {
    this.isLogin = true;
  }
  login() {
    this.isLogin = true;
  }
  logout() {
    this.isLogin = false;
  }
}
