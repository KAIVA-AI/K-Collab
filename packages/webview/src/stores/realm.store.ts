import { ZulipService } from '@v-collab/common';
import { IRealm } from '../models';
import { action, makeObservable, observable } from 'mobx';

export class RealmStore {
  @observable currentRealm?: IRealm;

  constructor() {
    makeObservable(this);
  }

  @action loadData = async () => {
    this.currentRealm = {
      realm_string: ZulipService.REALM_STRING,
    };
  };
}
