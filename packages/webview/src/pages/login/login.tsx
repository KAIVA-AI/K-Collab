import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { LoginViewModel } from './login.viewmodel';

@inject('rootStore')
@observer
class LoginPage extends Component<BaseComponentProps> {
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

  render() {
    return (
      <div className="d-flex flex-col items-center justify-center f-g-24px">
        <div>
          <img
            className="w-auto h-16"
            src="https://zulip.kaiva.io/user_uploads/2/14/lBeKTkf9EzxcKMjZ9QLXTQCZ/20250207-155525.jpeg"
            alt=""
          />
        </div>
        <form
          className="login-form d-flex flex-col f-g-24px"
          style={{ minWidth: '20rem' }}
          onSubmit={e => e.preventDefault()}
        >
          <div className="error-message text-red">{this.vm.errorMessage}</div>
          <div className="d-flex flex-col">
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
            Sign in with GitHub
          </button>
        </form>
      </div>
    );
  }
}

export default LoginPage;
