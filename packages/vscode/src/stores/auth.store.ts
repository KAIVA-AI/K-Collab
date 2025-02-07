import { RootStore } from '.';

export class AuthStore {
  private token: string = '';
  constructor(private rootStore: RootStore) {}

  getToken = () => {
    this.token = this.rootStore.getState('k-collab-token') as string;
    return this.token;
  };
  setToken = (token: string) => {
    this.token = token;
    return this.rootStore.setState('k-collab-token', this.token);
  };
}
