// @ts-nocheck
import * as vscode from "vscode";
import * as str from "../strings";
import * as utils from "../utils";
import { SelfCommands, ROOT_ZULIP_REALM, LANGUAGE_COMTOR_SETTING } from "../constants";
import { ConfigHelper } from "../config";
import { Store } from "../store";
import Manager from "../manager";
import ViewController from "../controller";

const getRealm = (url: string) => {
  let match = url.match(/https:\/\/([^.]+)\.collab\.vietis\.com\.vn:\d+/);
  return match ? match[1] : "Zulip";
}

export function activateChatExtension(
  context: vscode.ExtensionContext,
  store: Store,
  manager: Manager,
  controller: ViewController,
) {
  const startAuthWithEmailPassword = async (args?: any) => {
    const hasArgs = !!args && !!args.source;
    const config: AuthConfig = {
      username: args.email,
      password: args.password,
      apiKey: args.apiKey,
      realm: args.realm ? `https://${args.realm}.${ROOT_ZULIP_REALM}` : `https://${ROOT_ZULIP_REALM}`
    }
    await manager.startAuthWithEmailPassword(args.service, config);
    return
  };

  const sendMessage = (
    providerName: string,
    channelId: string | undefined,
    topic: string | undefined,
    content: string,
    parentTimestamp: string | undefined
  ) => {
    const lastChannelId = manager.store.getLastChannelId(providerName);
    manager.updateReadMarker(providerName);

    if (!!lastChannelId) {
      // lastChannelId should always exist since this will only be
      // called after loading the webview (which requires lastChannelId)
      return manager.sendMessage(providerName, channelId, topic, content, parentTimestamp);
    }
  };

  const signout = async () => {
    await manager.signout();
  };

  const signoutFromUri = async () => {
    await manager.signoutFromUri();
  }

  const openChatWebview = async (chatArgs?: ChatArgs) => {
    let provider = !!chatArgs ? chatArgs.providerName : undefined;
    let channelId = !!chatArgs ? chatArgs.channelId : undefined;
    const topic = !!chatArgs ? chatArgs.topic : undefined;
    const source = !!chatArgs ? chatArgs.source : EventSource.command;
    const isNewChat = !!chatArgs ? chatArgs.isNewChat : false;

    if (!chatArgs) {
      const selected = await askForChannel(undefined);

      if (!!selected) {
        // TODO: handle topic
        provider = selected.providerName;
        channelId = selected.channel.id;
      }
    }

    if (!!provider && !!channelId) {
      store.updateCurrentTopic(chatArgs);
      manager.clearMessages(provider, channelId);
      controller.updateCurrentState(provider, channelId, topic, source, getRealm(store.getAuthConfig()?.realm || "Zulip"));
      controller.loadUi();

      await setup(true, undefined);
      manager.updateNewChatState(provider, isNewChat ?? false);
      await manager.updateWebviewForProvider(provider, channelId);
      manager.loadChannelHistory(provider, channelId, topic);
    }
  };

  const openSettingWebview = async () => {
    utils.setVsContext("chat:showSetting", true);
  }

  const askForChannel = async (
    providerName: string | undefined
  ): Promise<{ channel: Channel; providerName: string } | undefined> => {
    // This can be called with an undefined providerName, in which
    // case we show channels from all available providers.
    let channelList = manager.getChannelLabels(providerName).sort((a, b) => b.unread - a.unread);

    const quickpickItems: vscode.QuickPickItem[] = channelList.map(channelLabel => {
      const description = `${channelLabel.providerName} · ${channelLabel.teamName}`;
      return {
        label: channelLabel.label,
        detail: channelLabel.channel.streamName,
        description
      };
    });
    const finalList = [...quickpickItems, { label: str.RELOAD_CHANNELS }];
    const selected = await vscode.window.showQuickPick(finalList, {
      placeHolder: str.CHANGE_CHANNEL_TITLE,
      matchOnDetail: true,
      matchOnDescription: true
    });

    if (!!selected) {
      if (selected.label === str.RELOAD_CHANNELS) {
        let currentProvider = providerName;

        if (!currentProvider) {
          const providers = manager.store.getCurrentUserForAll().map(userInfo => userInfo.provider);
          currentProvider = await askForProvider(providers);
        }

        if (!!currentProvider) {
          await manager.fetchUsers(currentProvider);
          await manager.fetchChannels(currentProvider);
          return askForChannel(providerName);
        }
      }

      const selectedChannelLabel = channelList.find(
        x => x.label === selected.label && x.channel.streamName === selected.detail
      );

      if (!!selectedChannelLabel) {
        const { channel, providerName } = selectedChannelLabel;
        return { channel, providerName: providerName.toLowerCase() };
      }
    }
  };

  const askForProvider = async (enabledProviders: string[]) => {
    // VSLS providers are no longer supported. The user can still have these in their store.
    // Remove these from the list.
    const values = (enabledProviders.map(name => utils.toTitleCase(name))).filter(p => p !== 'Vsls');
    const selection = await vscode.window.showQuickPick(values, {
      placeHolder: str.CHANGE_PROVIDER_TITLE
    });
    return !!selection ? selection.toLowerCase() : undefined;
  };

  const setup = async (canPromptForAuth: boolean, newInitialState: InitialState | undefined): Promise<any> => {
    await store.runStateMigrations();
    await manager.initializeProviders();
    manager.updateUserPrefsForAll(); // async update
    await manager.initializeStateForAll();
    manager.subscribePresenceForAll();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(SelfCommands.SIGN_IN_WITH_EMAIL_PASSWORD, startAuthWithEmailPassword),
    vscode.commands.registerCommand(SelfCommands.SIGN_OUT, signout),
    vscode.commands.registerCommand(SelfCommands.SIGN_OUT_FROM_URI, signoutFromUri),
    vscode.commands.registerCommand(SelfCommands.SEND_MESSAGE, ({ providerName, channelId, topic, content, parentTimestamp }) => {
      sendMessage(providerName, channelId, topic, content, parentTimestamp)
    }),
    vscode.commands.registerCommand(SelfCommands.UPDATE_MESSAGES, ({ channelId, messages, provider }) => {
      manager.updateMessages(provider, channelId, messages);
    }),
    vscode.commands.registerCommand(SelfCommands.OPEN_WEBVIEW_CHAT, openChatWebview),
    vscode.commands.registerCommand(SelfCommands.SEND_TO_WEBVIEW, ({ uiMessage }) =>
      controller.sendToUI(uiMessage)
    ),
    vscode.commands.registerCommand(SelfCommands.SETTING, openSettingWebview),
    vscode.commands.registerCommand(SelfCommands.CLOSE_SETTING, async () => {

      utils.setVsContext("chat:showSetting", false);
    }),
    vscode.commands.registerCommand(SelfCommands.CHANGE_THREAD_POSITION, async () => {
      const result = await vscode.window.showQuickPick(
        ['Sidebar', 'Panel Tab'],
        { placeHolder: 'Select thread position' }
      );

      if (result) {
        ConfigHelper
          .getRootConfig()
          .update('threadPosition', result, vscode.ConfigurationTarget.Global);
      }
    }),
    vscode.commands.registerCommand(SelfCommands.BACK_TO_WORKSPACE, async () => {
      utils.setVsContext("chat:showThreadSidebar", false);
      store.updateCurrentTopic(undefined);
      manager.updateAllUI();
    }),
    vscode.commands.registerCommand(SelfCommands.PRIVATE_AI_CHAT_CREATE_NEW_TOPIC, async () => {
      const privateAIStreamId = store.getPrivateAIStreamId();
      if (!privateAIStreamId) {
        return;
      }
      const chatArgs: ChatArgs = {
        channelId: privateAIStreamId!.toString(),
        providerName: Providers.zulip,
        source: EventSource.activity,
        topic: undefined,
        isNewChat: true
      };
      vscode.commands.executeCommand(SelfCommands.OPEN_WEBVIEW_CHAT, chatArgs);
    }),
    vscode.commands.registerCommand(SelfCommands.PRIVATE_AI_CHAT_REFRESH, async () => {
      // TODO: implement refresh private AI chat
    }),
    vscode.commands.registerCommand(SelfCommands.UPDATE_CURRENT_STATE, async (
      args: any
    ) => {
      const { providerName, channelId, topic } = args;
      controller.updateCurrentState(
        providerName,
        channelId,
        topic,
        EventSource.activity
      );
    })
  );
}
