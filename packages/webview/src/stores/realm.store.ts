import { IWorkspace } from '@k-collab/common';
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
    const lastRealm = await this.rootStore.postMessageToVSCode({
      command: 'getLastTopic',
      hasReturn: true,
    });
    if (lastRealm?.data?.realm) {
      const workspace = workspaces.find(
        w => w.workspace_realm === lastRealm.data.realm,
      );
      if (workspace) {
        this.selectWorkspace(workspace);
      }
    }
  };

  @action cleanup = () => {
    this.currentRealm = undefined;
    this.rootStore.postMessageToVSCode({
      command: 'setLastTopic',
      data: {},
    });
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
    this.rootStore.postMessageToVSCode({
      command: 'setLastTopic',
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
