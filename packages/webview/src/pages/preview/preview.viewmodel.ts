import { makeObservable, observable } from 'mobx';
import { IWebviewMessage } from 'src/models';
import { RootStore } from 'src/stores';

export class PreviewViewModel {
  @observable oldContent = '';
  @observable newContent = '';
  @observable startLine = 0;
  @observable endLine = 0;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
    this.rootStore.addEventListener(
      PreviewViewModel.name,
      this.onMessageFromVSCode,
    );
    this.rootStore.postMessageToVSCode({
      command: 'getDiffData',
    });
  }

  private onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.command === 'setDiffData') {
      this.oldContent = message.data.oldContent;
      this.newContent = message.data.newContent;
      this.startLine = message.data.startLine;
      this.endLine = message.data.endLine;
      return;
    }
  };

  acceptChanges = () => {
    this.rootStore.postMessageToVSCode({
      command: 'acceptChanges',
    });
  };

  rejectChanges = () => {
    this.rootStore.postMessageToVSCode({
      command: 'rejectChanges',
    });
  };
}
