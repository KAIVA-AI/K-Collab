import { Constants } from '@v-collab/common';
import { IRealm } from '../models';
import { action, makeObservable, observable } from 'mobx';

export class RealmStore {
  @observable currentRealm?: IRealm;

  constructor() {
    makeObservable(this);
  }

  @action loadData = async () => {
    this.currentRealm = {
      realm_string: Constants.REALM_STRING,
    };
  };

  @action cleanup = () => {
    this.currentRealm = undefined;
  };
}
