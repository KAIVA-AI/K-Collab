import { RootStore } from '.';

export class AuthStore {
  private token: string = '';
  constructor(private rootStore: RootStore) {}

  getToken = () => {
    this.token = this.rootStore.getState('v-collab-token') as string;
    return this.token;
  };
  setToken = (token: string) => {
    this.token = token;
    return this.rootStore.setState('v-collab-token', this.token);
  };
}
