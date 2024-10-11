import * as vscode from "vscode";
import {
  IMsTreeProvider,
  PrivateAITreeProvider,
  SupportTreeProvider,
  StreamTreeProvider
} from "../tree";

export class TreeViewManager implements vscode.Disposable {
  privateAITreeProvider: PrivateAITreeProvider;
  imsTreeProvider: IMsTreeProvider;
  supportTreeProvider: SupportTreeProvider;
  streamTreeProvider: StreamTreeProvider;

  constructor(public provider: string, public parentManager: IManager) {
    this.privateAITreeProvider = new PrivateAITreeProvider(provider);
    this.imsTreeProvider = new IMsTreeProvider(provider);
    this.supportTreeProvider = new SupportTreeProvider(provider);
    this.streamTreeProvider = new StreamTreeProvider(provider, parentManager);
  }

  updateData(currentUserInfo: CurrentUser, channelLabels: ChannelLabel[]) {
    this.privateAITreeProvider.updateChannels(channelLabels);
    this.imsTreeProvider.updateChannels(channelLabels);
    this.supportTreeProvider.updateChannels(channelLabels);
    this.streamTreeProvider.updateChannels(channelLabels);
  }
  

  dispose() {
    this.privateAITreeProvider.dispose();
    this.imsTreeProvider.dispose();
    this.supportTreeProvider.dispose();
    this.streamTreeProvider.dispose();
  }
}
