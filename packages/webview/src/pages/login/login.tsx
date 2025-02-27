import { Constants } from '@v-collab/common';
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
      if (message.token && message.realm) {
        // You can now use the accessToken and realmString to handle login
        this.vm.loginUri(message.token, message.realm);
        // Optionally, call your login handler here with accessToken and realmString
        // handleLogin(message.accessToken, message.realmString);
      }
    });
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.command === 'loadChatPage') {
        this.handleLoginSuccess();
      }
    };

    window.addEventListener('message', handleMessage);
  }

  handleLoginSuccess = () => {
    this.vm.LogginSuccess(); // Switch to chat page after successful login
  };

  render() {
    return (
      <div className="d-flex flex-col items-center justify-center f-g-24px">
        <div>
          <img
            className="w-auto h-16"
            src="https://pjd.collab.vietis.com.vn:9981/images/logo.png"
            alt=""
          />
        </div>
        <form
          className="login-form d-flex flex-col f-g-24px"
          style={{
            minWidth: '20rem',
          }}
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <div className="error-message text-red">{this.vm.errorMessage}</div>
          <div className="d-flex flex-col">
            <label htmlFor="username" className="mb-6px">
              Your Account
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
              Password
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
            onClick={() => this.vm.login()}
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }
}
export default LoginPage;
