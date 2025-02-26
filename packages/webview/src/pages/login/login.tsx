import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { LoginViewModel } from './login.viewmodel';
import { Constants } from '@k-collab/common';

@inject('rootStore')
@observer
class LoginPage extends Component<BaseComponentProps> {
  private clientId = Constants.GITHUB_CLIENT_ID;
  private redirectUri = Constants.GITHUB_REDIRECT_URL;
  private scope = Constants.GITHUB_SCOPE;
  private get rootStore() {
    return this.props.rootStore!;
  }
  private vm = new LoginViewModel(this.rootStore);

  componentDidMount(): void {
    this.rootStore.setCurrentWebviewPageContext('login-page');

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'loadChatPage') {
        this.handleLoginSuccess();
      }
      if (message.command === 'GitHubAuthSuccess') {
        this.handleLoginSuccess();
        localStorage.setItem('github_access_token', message.accessToken);
      }
    });
  }
  handleLoginSuccess = () => {
    this.vm.LogginSuccess(); // Switch to chat page after successful login
  };

  handleLogin = async () => {
    try {
      const response = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
          Authorization: `Basic ${btoa(`${this.vm.username}:${this.vm.password}`)}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        this.rootStore.postMessageToVSCode({
          command: 'raiseMessageToVscodeWindow',
          data: {
            message: `GitHub login failed`,
          },
        });
        throw new Error('GitHub login failed');
      }

      const userData = await response.json();
      console.log('GitHub User:', userData);

      this.vm.LogginSuccess();
    } catch (error) {
      console.error('Login Error:', error);
      this.rootStore.postMessageToVSCode({
        command: 'raiseMessageToVscodeWindow',
        data: {
          message: `Invalid credentials. Please check your username and personal access token.`,
        },
      });
    }
  };

  private handleLoginWithGitHub = () => {
    // const clientId = 'Ov23liJvUHSfWdWvlqdl';
    // const redirectUri = 'http://localhost:8080/auth/github/callback';
    // const scope = 'read:user user:email';

    // send message to trigger command open GitHub OAuth in an external browser
    this.rootStore.postMessageToVSCode({
      command: 'openGitHubLogin',
      data: {
        url: `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${this.scope}`,
      },
    });
  };

  render() {
    return (
      <div className="d-flex flex-col items-center justify-center f-g-24px">
        <div>
          <img
            className="w-auto"
            style={{ height: '12rem' }}
            src="https://zulip.kaiva.io/static/images/k-collab-logo.png"
            alt=""
          />
        </div>
        <form
          className="login-form d-flex flex-col f-g-24px"
          style={{ minWidth: '20rem' }}
          onSubmit={e => e.preventDefault()}
        >
          <div className="error-message text-red">{this.vm.errorMessage}</div>
          {/* <div className="d-flex flex-col">
            <label htmlFor="username" className="mb-6px">
              GitHub Username
            </label>
            <input
              type="text"
              id="username"
              className="vc-border vc-input-bg pa-10px"
              value={this.vm.username}
              onChange={this.vm.onChangeUsername}
            />
          </div>
          <div className="d-flex flex-col">
            <label htmlFor="password" className="mb-6px">
              Personal Access Token
            </label>
            <input
              type="password"
              id="password"
              className="vc-border vc-input-bg pa-10px"
              value={this.vm.password}
              onChange={this.vm.onChangePassword}
            />
          </div>
          <button
            className="vc-border pa-10px c-pointer bg-primary"
            onClick={this.handleLogin}
          >
            Login
          </button> */}
          <div className="d-flex flex-col items-center justify-center f-g-24px">
            <button
              className="vc-border pa-10px c-pointer bg-primary"
              onClick={this.handleLoginWithGitHub}
            >
              Sign in with GitHub
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default LoginPage;
