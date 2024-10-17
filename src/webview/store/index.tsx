import { makeObservable, observable, action, runInAction } from 'mobx';
import { IMessage, IListTopic, IStream } from '../constants/chatbox';
import { ZulipService } from '../services/message'; // Adjust path as necessary

class ZulipStore {
    // Observables
    messages: IMessage[] = [];
    topics: IListTopic[] = [];
    streams: IStream[] = [];
    selectedStream: IStream | null = null;
    loading: boolean = false;
    error: string | null = null;

    // Zulip service instance
    zulipService: ZulipService;

    constructor(realm: string, token: string) {
        makeObservable(this, {
            messages: observable,
            topics: observable,
            streams: observable,
            selectedStream: observable,
            loading: observable,
            error: observable,
            fetchMessages: action,
            fetchTopics: action,
            fetchStreams: action,
            fetchTopicsForGeneralStream: action,
            sendMessage: action,
            deleteMessage: action,
            editMessage: action,
        });

        // Initialize Zulip service
        this.zulipService = new ZulipService(realm, token);
    }

    // Actions
    async fetchMessages(streamId: string) {
        this.loading = true;
        this.error = null;
        try {
            const response = await this.zulipService.getMessages({ stream_id: streamId });
            runInAction(() => {
                this.messages = response.messages;
                this.loading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                this.loading = false;
            });
        }
    }

    async fetchTopics(streamId: string) {
        this.loading = true;
        this.error = null;
        try {
            const response = await this.zulipService.getTopics(streamId);
            runInAction(() => {
                this.topics = response.topics;
                this.loading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                this.loading = false;
            });
        }
    }

    async fetchStreams() {
        this.loading = true;
        this.error = null;
        try {
            const response = await this.zulipService.getWorkspaceStreams();
            runInAction(() => {
                console.log("GET RESPOSE SUCCESS ", response)
                this.streams = response;
                this.loading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                this.loading = false;
            });
        }
    }

    async sendMessage(content: string, streamId: string, topic: string) {
        this.loading = true;
        try {
            await this.zulipService.postMessages({ content, stream_id: streamId, topic });
            runInAction(() => {
                this.fetchMessages(streamId);  // Refresh the messages after sending
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
            });
        } finally {
            this.loading = false;
        }
    }

    async deleteMessage(messageId: IMessage['id'], streamId: string) {
        try {
            await this.zulipService.deleteMessage(messageId, {});
            runInAction(() => {
                this.fetchMessages(streamId);  // Refresh messages after deletion
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
            });
        }
    }

    async editMessage(messageId: IMessage['id'], content: string, streamId: string) {
        try {
            await this.zulipService.editMessage(messageId, { content });
            runInAction(() => {
                this.fetchMessages(streamId);  // Refresh the messages after editing
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
            });
        }
    }

    // Enhanced fetchTopicsForGeneralStream
    async fetchTopicsForGeneralStream() {
        this.loading = true;
        this.error = null;

        try {
            // Ensure streams are loaded before attempting to find "general"
            if (this.streams.length === 0) {
                await this.fetchStreams();
            }

            const generalStream = this.streams.find(stream => stream.name === "general");
            if (!generalStream) {
                runInAction(() => {
                    this.error = "General stream not found.";
                    this.loading = false;
                });
                return;
            }

            const topics = await this.zulipService.getTopics(generalStream.stream_id);
            runInAction(() => {
                this.selectedStream = generalStream;
                this.topics = topics;
                this.loading = false;
            });
        } catch (error: any) {
            runInAction(() => {
                this.error = error.message || "Failed to fetch topics.";
                this.loading = false;
            });
        }
    }

    // Orchestrating initialization of streams and topics for "general"
    async initialize() {
        try {
            console.log("START FETCH API")
            await this.fetchStreams();
            await this.fetchTopicsForGeneralStream();  // Auto-fetch topics for "general" stream after streams are loaded
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message || "Failed to initialize Zulip store.";
            });
        }
    }
}

export default ZulipStore;
