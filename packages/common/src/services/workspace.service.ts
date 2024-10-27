import { Constants } from '../constants/constants';

interface ILoginResult {
  status: boolean;
  message?: string;
  token?: string;
}

export class WorkspaceService {
  private token: string = '';
  get isAuthorized() {
    return !!this.token;
  }
  setToken = (token: string) => {
    this.token = token;
  };
  private buildUrl = (path: string) => {
    return `${Constants.PROJECT_SETTING_HOST}/${path}`;
  };

  login = async (username: string, password: string): Promise<ILoginResult> => {
    let url = this.buildUrl('api/login');
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const result: ILoginResult = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password }),
    }).then(res => res.json());

    return result;
  };

  listWorkspace = async () => {
    let url = this.buildUrl('api/workspace/list');
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Bearer ${this.token}`);
    const result = await fetch(url, {
      headers,
    });
    if (result.status === 401) {
      console.log('Unauthorized');
      return;
    }
    console.log(result);
  };
}
