import { RootStore } from '.';

export class AuthStore {
  private token: string = '';
  private realm: string = '';
  constructor(private rootStore: RootStore) {}

  getToken = () => {
    this.token = this.rootStore.getState('k-collab-token') as string;
    return this.token;
  };
  setToken = (token: string) => {
    this.token = token;
    return this.rootStore.setState('k-collab-token', this.token);
  };
  getRealm = () => {
    this.realm = this.rootStore.getState('k-collab-realm') as string;
    return this.realm;
  };
  setRealm = (realm: string) => {
    this.realm = realm;
    return this.rootStore.setState('k-collab-realm', this.realm);
  };
}
