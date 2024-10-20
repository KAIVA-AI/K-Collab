import { IChannel } from '../models';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from '.';
import { ZulipService } from '@v-collab/common';

export class ChannelStore {
  @observable channels: IChannel[] = [];
  @observable currentChannel?: IChannel;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    this.channels = await this.rootStore.zulipService.getChannels();

    this.currentChannel = this.channels.find(
      c => c.name === ZulipService.CHANNEL_BACKEND,
    );
  };
}
