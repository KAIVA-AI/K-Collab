import * as vscode from 'vscode';
import { getNonce, joinPath } from '../../utils';
import { ICON_STREAM_TYPE_PRIVATE, ICON_STREAM_TYPE_PUBLIC, ICON_TOPIC, SelfCommands } from '../../constants';
import { Channel, ChannelLabelType, ChatArgs, Providers, Topic, EventSource } from '../../types';

export class StreamsWebviewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'collab.webview.streams.zulip';

	private _view?: vscode.WebviewView;
    private _streams!: Channel[];

	constructor(
		private readonly _extensionUri: vscode.Uri,
        private _onFetchTopics: (provider: string, streamId: number) => Promise<Topic[]>,
        private _onRefresh: (provider: string) => void
	) { }

    /**
     * Resolves the webview view for the streams provider.
     * 
     * Sets up the webview options, HTML content, and message handler.
     * The message handler will call the appropriate setup function 
     * based on the login type in the message data.
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        const isInited = !!this._view;
        this._view = webviewView

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        }

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'selectedStream':
                    const topics = await this._onFetchTopics(Providers.zulip, parseInt(data.streamId));
                    this.updateTopics(data.streamId, topics);
                    break;
                case 'selectedTopic':
                    const chatArgs: ChatArgs = {
                        channelId: data.streamId,
                        providerName: Providers.zulip,
                        source: EventSource.activity,
                        topic: data.topic
                    };
                    vscode.commands.executeCommand(SelfCommands.OPEN_WEBVIEW_CHAT, chatArgs);
                    break;
                default:
                    break;
            }
        })

        if (isInited) {
            this.updateStreams(this._streams);
            this._onRefresh(Providers.zulip);
        }
    }

    public updateStreams(streams: Channel[]) {
        this._streams = streams;
		if (this._view) {
			this._view.show?.(true);
            const mapStreams = streams.map(stream => ({
                ...stream,
                icon: stream.channelLabelType === ChannelLabelType.private
                    ? ICON_STREAM_TYPE_PRIVATE 
                    : ICON_STREAM_TYPE_PUBLIC
            }));
			this._view.webview.postMessage({ 
                type: 'updateStreams',
                streams: mapStreams
            });
		}
	}

    public updateTopics(streamId: string, topics: Topic[]) {
		if (this._view) {
			this._view.show?.(true);
			this._view.webview.postMessage({ 
                type: 'updateTopics',
                streamId: streamId,
                topics: topics.map((topic) => 
                    ({...topic, icon: ICON_TOPIC })
                )
            });
		}
    }

	private _getHtmlForWebview(webview: vscode.Webview) {
		const mediaPath = joinPath(this._extensionUri, 'src', 'webview', 'streams','media');

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(joinPath(mediaPath, 'streams.js'));
		const styleMainUri = webview.asWebviewUri(joinPath(mediaPath, 'streams.css'));
		const styleVSCodeUri = webview.asWebviewUri(joinPath(mediaPath, 'vscode.css'));
		const styleResetUri = webview.asWebviewUri(joinPath(mediaPath, 'reset.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Views</title>
			</head>
			<body>
              <div class="streams-list">
              </div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
