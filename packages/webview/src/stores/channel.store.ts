import { IChannel } from '@src/models';
import { action, makeObservable, observable } from 'mobx';

export class ChannelStore {
  @observable channels: IChannel[] = [];
  @observable currentChannel?: IChannel;

  constructor() {
    makeObservable(this);
  }

  @action fakeData = () => {
    this.channels = [
      {
        stream_id: '1',
        realm_string: 'pjd-1',
        name: 'general',
      },
    ];

    this.currentChannel = this.channels[0];
  };
}
