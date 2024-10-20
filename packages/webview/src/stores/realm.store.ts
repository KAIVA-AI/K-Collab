import { IRealm } from '@src/models';
import { action, makeObservable, observable } from 'mobx';

export class RealmStore {
  @observable currentRealm?: IRealm;

  constructor() {
    makeObservable(this);
  }

  @action fakeData = () => {
    this.currentRealm = {
      realm_string: 'pjd-1',
    };
  };
}
