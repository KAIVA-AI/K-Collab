import * as vscode from "vscode";
import { TreeViewManager } from "./treeView";
import { BaseStatusItem, UnreadsStatusItem } from "../status";
import { OnboardingTreeProvider } from "../onboarding";
import { SelfCommands } from "../constants";
import { setVsContext, difference } from "../utils";
import { LoginWebviewProvider } from "../webview/login/loginwebviewprovider";
import { StreamsWebviewProvider } from "../webview/streams/StreamsWebviewProvider";
// import { SettingWebviewProvider } from "../webview/setting/SettingWebviewProvider";

const PROVIDERS_WITH_TREE = ["zulip"];

const getStatusItemKey = (provider: string, team: Team) => {
    return `${provider}:${team.id}`;
};

export class ViewsManager implements vscode.Disposable {
    statusItems: Map<string, BaseStatusItem> = new Map();
    treeViews: Map<string, TreeViewManager> = new Map();
    loginWebviewProvider: LoginWebviewProvider | undefined;
    streamsWebviewProvider: StreamsWebviewProvider | undefined;
    settingWebviewProvider: SettingWebviewProvider | undefined;
    onboardingTree: OnboardingTreeProvider | undefined;
    context: vscode.ExtensionContext;

    constructor(public parentManager: IManager, context: vscode.ExtensionContext) {
        this.context = context;
    }

    initialize(enabledProviders: string[], providerTeams: { [providerName: string]: Team[] }) {
        const statusItemKeys = new Map<string, { provider: string; team: Team }>();
        enabledProviders.forEach(provider => {
            const teams = providerTeams[provider];
            teams.forEach(team => {
                statusItemKeys.set(getStatusItemKey(provider, team), {
                    provider,
                    team
                });
            });
        });

        this.initializeStatusItems(statusItemKeys);
        this.initializeTreeViews(enabledProviders);

        const showOnboarding = false;
        // Overriding showOnboarding to be always false, so that vsls extension
        // pack users don't see a slack icon in the activity bar.
        // const showOnboarding = nonVslsProviders.length === 0;

        if (showOnboarding && !this.onboardingTree) {
            // We need to initialize the tree here
            this.onboardingTree = new OnboardingTreeProvider();
        } else if (!showOnboarding && !!this.onboardingTree) {
            // Dispose the tree as we don't need it anymore
            this.onboardingTree.dispose();
            this.onboardingTree = undefined;
        }

        // Init loginWebViewProvider
        if (!this.loginWebviewProvider) {
            // TODO: check if need to login, initial LoginWebviewProvider
            this.loginWebviewProvider = new LoginWebviewProvider(this.context.extensionUri);
            this.initializeLoginWebview();
            this.setShowLoginContext('zulip');
        }

        // Init streamsWebviewProvider
        if (!this.streamsWebviewProvider) {
            this.streamsWebviewProvider = new StreamsWebviewProvider(
                this.context.extensionUri,
                (provider, streamId) => {
                    return this.parentManager.getTopics(provider, streamId);
                },
                (provider) => {
                    return this.parentManager.updateWebViewsForProvider(provider);
                }
            );
            this.initializeStreamsWebview();
        }

        if (!this.settingWebviewProvider) {
            this.settingWebviewProvider = new SettingWebviewProvider(this.context.extensionUri, this.context);
            this.initializeSettingWebview();
        }
    }

    initializeStatusItems(newKeyMap: Map<string, { provider: string; team: Team }>) {
        // Ensure new keys have status items in the map and
        // no longer used keys are removed.
        const existingKeysSet = new Set(Array.from(this.statusItems.keys()));
        const newKeysSet = new Set(Array.from(newKeyMap.keys()));
        const keysToRemove = difference(existingKeysSet, newKeysSet);
        const keysToAdd = difference(newKeysSet, existingKeysSet);

        keysToRemove.forEach(key => {
            const statusItem = this.statusItems.get(key);

            if (!!statusItem) {
                statusItem.dispose();
                this.statusItems.delete(key);
            }
        });

        keysToAdd.forEach(key => {
            const providerAndTeam = newKeyMap.get(key);

            if (!!providerAndTeam) {
                const { provider, team } = providerAndTeam;
                this.statusItems.set(key, new UnreadsStatusItem(provider, team));
            }
        });
    }

    initializeTreeViews(enabledProviders: string[]) {
        PROVIDERS_WITH_TREE.forEach(provider => {
            const hasProviderEnabled = enabledProviders.indexOf(provider) >= 0;
            setVsContext(`chat:${provider}`, hasProviderEnabled);
        });

        const enabledTreeProviders = new Set(enabledProviders.filter(p => PROVIDERS_WITH_TREE.indexOf(p) >= 0));
        const existingTreeProviders = new Set(Array.from(this.treeViews.keys()));
        const treesToAdd = difference(enabledTreeProviders, existingTreeProviders);
        const treesToRemove = difference(existingTreeProviders, enabledTreeProviders);

        treesToRemove.forEach(treeProvider => {
            const treeView = this.treeViews.get(treeProvider);
            if (!!treeView) {
                treeView.dispose();
                this.treeViews.delete(treeProvider);
            }
        });

        treesToAdd.forEach(treeProvider => {
            this.treeViews.set(treeProvider, new TreeViewManager(treeProvider, this.parentManager));
        });
    }

    initializeLoginWebview() {
        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(LoginWebviewProvider.viewType, this.loginWebviewProvider!, {
                webviewOptions: { retainContextWhenHidden: true },
            }));
    }

    initializeStreamsWebview() {
        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(StreamsWebviewProvider.viewType, this.streamsWebviewProvider!, {
                webviewOptions: { retainContextWhenHidden: true },
            }));
    }

    initializeSettingWebview() {
        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(SettingWebviewProvider.viewType, this.settingWebviewProvider!, {
                webviewOptions: { retainContextWhenHidden: true },
            }));
    }

    setShowLoginContext(provider: string) {
        const currentUser = this.parentManager.store.getCurrentUser(provider);
        setVsContext('chat:loggedIn', !!currentUser);
    };

    updateStatusItem(provider: string, team: Team) {
        const statusItem = this.statusItems.get(getStatusItemKey(provider, team));

        if (statusItem) {
            const channels = this.parentManager.store.getChannels(provider);
            const unreads = channels.map(channel => {
                return this.parentManager.getUnreadCount(provider, channel);
            });
            const totalUnreads = unreads.reduce((a, b) => a + b, 0);
            statusItem.updateCount(totalUnreads);
        }
    }

    updateTreeViews(provider: string) {
        const treeViewForProvider = this.treeViews.get(provider);

        if (!!treeViewForProvider && this.parentManager.isAuthenticated(provider)) {
            const channelLabels = this.parentManager.getChannelLabels(provider);
            const currentUserInfo = this.parentManager.getCurrentUserFor(provider);

            if (!!currentUserInfo) {
                treeViewForProvider.updateData(currentUserInfo, channelLabels);
            }
        }
    }

    /// Update webview showed in sidebar tab: StreamsWebView
    async updateStreamsWebView(provider: string) {
        if (this.parentManager.isAuthenticated(provider)) {
            const streams = await this.parentManager.getStreams(provider);
            const currentUserInfo = this.parentManager.getCurrentUserFor(provider);

            if (!!currentUserInfo) {
                this.streamsWebviewProvider?.updateStreams(streams);
            }
        }
    }

    updateWebview(
        currentUser: CurrentUser,
        provider: string,
        users: Users,
        channel: Channel,
        messages: ChannelMessages,
        typingUser?: User
    ) {
        const { fontFamily, fontSize } = vscode.workspace.getConfiguration("editor");
        let statusText = ``;

        if (typingUser) {
            statusText = `${typingUser.name} is typing...`
        }
        
        let uiMessage: UIMessage = {
            fontFamily,
            fontSize,
            provider,
            messages,
            users,
            currentUser,
            channel,
            statusText
            // atMentions: Object.values(users)
        };

        vscode.commands.executeCommand(SelfCommands.SEND_TO_WEBVIEW, {
            uiMessage
        });
    }

    dispose() {
        for (let entry of Array.from(this.statusItems.entries())) {
            let statusItem = entry[1];
            statusItem.dispose();
        }

        for (let entry of Array.from(this.treeViews.entries())) {
            let treeView = entry[1];
            treeView.dispose();
        }

        if (!!this.onboardingTree) {
            this.onboardingTree.dispose();
        }
    }
}
