import * as vscode from "vscode";
import * as str from "./strings";
import { SelfCommands } from "./constants";
import { openUrl } from "./utils";
import { EventSource, Providers } from "./types";

export const setupZulipWithEmailPassword = async (email: string, password: string) => {
  vscode.commands.executeCommand(SelfCommands.SIGN_IN_WITH_EMAIL_PASSWORD, {
    source: EventSource.info,
    service: "zulip",
    email: email,
    password: password
  });
  vscode.commands.executeCommand(SelfCommands.SETUP_NEW_PROVIDER, {
    newInitialState: { provider: Providers.zulip }
  });
  
};

export const setupZulip = async () => {
  vscode.commands.executeCommand(SelfCommands.SIGN_IN, {
    source: EventSource.info,
    service: "zulip"
  });
};

export const setupGoogle = () => {
  vscode.commands.executeCommand(SelfCommands.SIGN_IN, {
    source: EventSource.info,
    service: "google"
  });
};

export const setupGitlab = () => {
  vscode.commands.executeCommand(SelfCommands.SIGN_IN, {
    source: EventSource.info,
    service: "gitlab"
  });
};

export const setupSlack = () => {
  vscode.commands.executeCommand(SelfCommands.SIGN_IN, {
    source: EventSource.info,
    service: "slack"
  });
};

export const setupDiscord = () => {
  openUrl(
    "https://github.com/karigari/vscode-chat/blob/master/docs/DISCORD.md"
  );
};

export const askForAuth = async () => {
  const actionItems = [str.SETUP_SLACK, str.SETUP_DISCORD];
  const selected = await vscode.window.showInformationMessage(
    str.TOKEN_NOT_FOUND,
    ...actionItems
  );

  switch (selected) {
    case str.SETUP_SLACK:
      setupSlack();
      break;
    case str.SETUP_DISCORD:
      setupDiscord();
      break;
  }
};

class CustomOnboardingTreeItem extends vscode.TreeItem {
  constructor(label: string, command: string) {
    super(label);
    this.command = {
      command,
      title: "",
      arguments: [{ source: EventSource.activity }]
    };
  }
}

interface OnboardingTreeNode {
  label: string;
  command: string;
}

const OnboardingCommands = {
  SETUP_SLACK: "extension.chat.onboarding.slack",
  SETUP_DISCORD: "extension.chat.onboarding.discord"
};

export class OnboardingTreeProvider
  implements vscode.TreeDataProvider<OnboardingTreeNode>, vscode.Disposable {
  // private vslsViewId = "collab.treeView.onboarding.vsls";
  private mainViewId = "collab.treeView.onboarding.main";
  private _disposables: vscode.Disposable[] = [];

  constructor() {
    this._disposables.push(
      // vscode.window.registerTreeDataProvider(this.vslsViewId, this),
      vscode.window.registerTreeDataProvider(this.mainViewId, this),
      vscode.commands.registerCommand(
        OnboardingCommands.SETUP_SLACK,
        setupSlack
      ),
      vscode.commands.registerCommand(
        OnboardingCommands.SETUP_DISCORD,
        setupDiscord
      )
    );
  }

  dispose() {
    this._disposables.forEach(dispose => dispose.dispose());
  }

  getChildren(element?: OnboardingTreeNode) {
    return Promise.resolve([
      { label: str.SETUP_SLACK, command: OnboardingCommands.SETUP_SLACK },
      { label: str.SETUP_DISCORD, command: OnboardingCommands.SETUP_DISCORD }
    ]);
  }

  getTreeItem(element: OnboardingTreeNode): vscode.TreeItem {
    const { label, command } = element;
    return new CustomOnboardingTreeItem(label, command);
  }
}
