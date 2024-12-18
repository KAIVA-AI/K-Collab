import {
  IMessage,
  IWebviewMessage,
  IZulipEvent,
  ITopic,
  IZulipUser,
} from '../models';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { RootStore } from '.';
import { marked } from 'marked';

export class MessageStore {
  @observable messages: IMessage[] = [];
  @observable currentStreamedMessage: IMessage | undefined;
  @observable loadingMore = false;
  @observable isTyping = false; // Observable to track typing events

  @computed get topicMessages() {
    const topic = this.rootStore.topicStore.currentTopic;
    if (!topic) {
      return [];
    }
    if (this.currentStreamedMessage) {
      // Check if any message in the messages array matches the currentStreamedMessage.id
      const existingMessageIndex = this.messages.findIndex(
        m => m.id === this.currentStreamedMessage?.id,
      );

      if (existingMessageIndex !== -1) {
        // Replace the existing message with the currentStreamedMessage
        this.messages[existingMessageIndex] = this.currentStreamedMessage;
      } else {
        // If no match, push the currentStreamedMessage
        this.messages.push(this.currentStreamedMessage);
      }

      // Log the content of the currentStreamedMessage (optional for debugging)
      console.log(
        'Updated currentStreamedMessage:',
        this.currentStreamedMessage.content,
      );
    }

    // Return filtered messages based on topic
    return this.messages.filter(
      m => m.stream_id === topic.stream_id && m.subject === topic.name,
    );
  }

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    const topic = this.rootStore.topicStore.currentTopic;
    if (!topic) {
      return;
    }
    const messages = await this.rootStore.zulipService.getMessages(
      topic.stream_id,
      topic.name,
    );
    runInAction(() => {
      this.messages = messages;
    });
  };

  /**
   * Load more messages (older) from the server
   */
  @action loadMoreMessages = async (count: number = 20) => {
    const topic = this.rootStore.topicStore.currentTopic;
    if (!topic || this.loadingMore) {
      return;
    }

    this.loadingMore = true;
    try {
      const oldestMessage = this.messages[0]; // Oldest message in the current list
      const olderMessages = await this.rootStore.zulipService.getMessages(
        topic.stream_id,
        topic.name,
        oldestMessage?.id.toString(), // Pass the ID of the oldest message as anchor
        0, // Number of messages to fetch
        count, // Number of messages to fetch
      );

      runInAction(() => {
        this.messages = [...olderMessages, ...this.messages]; // Prepend older messages
      });
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      runInAction(() => {
        this.loadingMore = false;
      });
    }
  };

  parseMarkdow = async (content: string | Promise<string>) => {
    const resolvedContent = await content; // Ensure content is resolved
    return marked(resolvedContent);
  };

  @action processStreamingMessage = async (streamedMessage: IMessage) => {
    const topic = this.rootStore.topicStore.currentTopic;

    if (
      topic &&
      streamedMessage.stream_id === topic.stream_id &&
      streamedMessage.subject === topic.name
    ) {
      // Resolve content if it's a Promise<string>
      streamedMessage.content = await this.parseMarkdow(
        streamedMessage.content,
      );
      runInAction(() => {
        this.currentStreamedMessage = streamedMessage;
      });
    }
  };

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.command === 'onZulipEventMessage') {
      const event: IZulipEvent = message.data.event;
      if (event.type === 'message' && event.message) {
        const userIsMember = this.rootStore.currentProjectMembers.some(
          member => member.user_id === event.message?.sender_id,
        );
        if (userIsMember) {
          this.messages.push(event.message);
        }
      } else if (event.type === 'update_message') {
        // check propagate_mode
        const user_trigger_event = this.rootStore.currentProjectMembers.filter(
          user => user.user_id === event.user_id,
        );
        if (user_trigger_event) {
          const editedMessage: IMessage = {
            id: event.message_id ?? 0,
            stream_id: event.stream_id ?? 0,
            subject: this.rootStore.topicStore.currentTopic?.name ?? '',
            content: event.content ?? '',
            sender_id: event.user_id,
            sender_full_name: user_trigger_event[0].full_name,
            timestamp: 0,
          };
          this.processStreamingMessage(editedMessage);
        }
        // comment pending feature suggest topic name from openai
        // update new subject to current Topic
        // const topicChanged: ITopic = {
        //   stream_id: event.stream_id ?? 0,
        //   name: event.subject ?? '',
        //   file_inputs:
        //     this.rootStore.topicStore.currentTopic?.file_inputs ?? [],
        // };
        // // update new subject for message list
        // this.messages.forEach(message => {
        //   message.subject = topicChanged.name;
        // });
        // this.rootStore.topicStore.currentTopic = topicChanged;
      } else if (event.type === 'typing' && event.sender) {
        const userId = event.sender.user_id;
        // Check if the typing event was triggered by the current user
        if (
          this.rootStore.currentUser?.user_id &&
          userId === this.rootStore.currentUser.user_id
        ) {
          return; // Exit early if triggered by the current user
        }
        this.rootStore.typingUsers = this.rootStore.typingUsers.filter(
          id => id !== userId,
        );

        if (event.op === 'start') {
          runInAction(() => {
            this.isTyping = true;
          });

          if (!this.rootStore.typingUsers.includes(userId)) {
            this.rootStore.typingUsers.push(userId);
          }
        } else if (event.op === 'stop') {
          runInAction(() => {
            this.rootStore.typingUsers = this.rootStore.typingUsers.filter(
              id => id !== userId,
            );
            this.isTyping = false;
          });
        }
      }
    }
  };

  @action cleanup = () => {
    this.messages = [];
  };
}
