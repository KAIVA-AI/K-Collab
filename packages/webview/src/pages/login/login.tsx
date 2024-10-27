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
          <button
            className="vc-border pa-10px c-pointer"
            onClick={() => this.vm.loginTest()}
          >
            Test account: {Constants.USER_EMAIL}
          </button>
        </form>
      </div>
    );
  }
}
export default LoginPage;
