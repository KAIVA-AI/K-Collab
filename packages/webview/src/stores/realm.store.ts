import { IWorkspace } from '@v-collab/common';
import { IRealm } from '../models';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from '.';

export class RealmStore {
  @observable workspaces: IWorkspace[] = [];
  @observable currentRealm?: IRealm;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    const workspaces = await this.rootStore.workspaceService.listWorkspace();
    runInAction(() => {
      this.workspaces = workspaces.filter(w => w.workspace_flag === 1);
    });
  };

  @action cleanup = () => {
    this.currentRealm = undefined;
  };

  @action selectWorkspace = async (workspace: IWorkspace) => {
    this.rootStore.cleanup();
    const realm = workspace.workspace_realm;
    this.rootStore.zulipService.setRealm(realm);
    this.rootStore.postMessageToVSCode({
      command: 'onSelectRealm',
      data: {
        realm,
      },
    });
    await this.rootStore.channelStore.loadData();
    this.currentRealm = {
      realm_string: realm,
    };
  };
}
