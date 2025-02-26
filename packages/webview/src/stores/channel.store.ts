import { IChannel } from '../models';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from '.';
import { Constants } from '@k-collab/common';

export class ChannelStore {
  @observable channels: IChannel[] = [];
  @observable currentChannel?: IChannel;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    this.channels = await this.rootStore.zulipService.getChannels();
    console.log('channels ', this.channels);

    this.currentChannel = this.channels.find(
      c => c.name === Constants.CHANNEL_AI_CODING,
    );
    console.log('this.currentChannel ', this.currentChannel);
  };

  @action cleanup = () => {
    this.channels = [];
    this.currentChannel = undefined;
  };
}
