import { action, makeObservable, observable } from 'mobx';
import { IChannel, IWebviewMessage } from 'src/models';
import { RootStore } from '.';

export class SettingStore {
  @observable channels: IChannel[] = [];
  @observable currentChannel?: IChannel;
  @observable isModalSetting: boolean = false;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  openModal() {
    this.isModalSetting = true;
  }

  closeModal() {
    this.isModalSetting = false;
  }

  @action onMessageFromVSCode = async (message: IWebviewMessage) => {
    if (message.command === 'openSetting' && this.rootStore.authStore.isLogin) {
      this.openModal();
      return;
    }
  };
}
