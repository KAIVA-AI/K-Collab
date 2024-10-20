import { ITopic } from '@src/models';
import { action, makeObservable, observable } from 'mobx';

export class TopicStore {
  @observable topics: ITopic[] = [];
  @observable currentTopic?: ITopic;

  constructor() {
    makeObservable(this);
  }

  @action fakeData = () => {
    this.topics = [
      {
        name: 'topic1',
        stream_id: '1',
      },
    ];

    this.currentTopic = this.topics[0];
  };
}
