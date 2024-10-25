import {
  IChannel,
  IMessage,
  ITopic,
  ITopicFileInput,
  IZulipSendMessageParams,
  TopicFileInput,
} from '../models';
import {
  IEventListener,
  IEventListeners,
  IUnread,
  IUnreadListener,
  IUnreadListeners,
  IZulipEvent,
} from '../models';

const ZULIP_PROTOCOL = 'https://';
const ZULIP_BASE_DOMAIN = 'collab.vietis.com.vn:9981';

const DEBUG = false;

interface RequestInit {
  method?: string;
  headers: Headers;
  body?: FormData;
}

export class ZulipService {
  private token: string = '';
  private eventListeners: IEventListeners = {};
  private unreadListeners: IUnreadListeners = {};

  get isAuthorized() {
    return !!this.token;
  }

  constructor(private realm: string) {}

  setToken = (token: string) => {
    this.token = token;
  };

  setBasicAuth = (email: string, apiKey: string) => {
    this.token = Buffer.from(`${email}:${apiKey}`).toString('base64');
    console.log('TOKEN ', this.token);
  };

  private buildUrl = (path: string) => {
    const prefix = !this.realm ? '' : `${this.realm}.`;
    return `${ZULIP_PROTOCOL}${prefix}${ZULIP_BASE_DOMAIN}/api/v1/${path}`;
  };

  private sendRequest = async ({
    path,
    formData,
    queryParams,
    method = 'POST',
  }: {
    path: string;
    method?: string;
    formData?: any;
    queryParams?: any;
  }): Promise<any> => {
    try {
      let url = this.buildUrl(path);
      const headers = new Headers();
      headers.set('Authorization', `Basic ${this.token}`);
      const request: RequestInit = {
        method: method,
        headers: headers,
      };
      if (formData) {
        request.body = new FormData();
        Object.keys(formData).forEach(key => {
          let data = formData[key];
          if (Array.isArray(data)) {
            data = JSON.stringify(data);
          }
          request.body?.append(key, data);
        });
      }
      if (queryParams) {
        const search = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value = JSON.stringify(value);
          }
          search.append(key, value as string);
        });
        url += `?${search}`;
      }
      const response = await fetch(url, request);
      const json = await response.json();
      DEBUG && console.log('sendRequest json', json);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return json;
    } catch (error: any) {
      DEBUG && console.error('sendRequest error', error.message);
      throw error;
    }
  };

  getChannels = async (): Promise<IChannel[]> => {
    return this.sendRequest({
      path: 'users/me/subscriptions',
      method: 'GET',
    }).then((json: any) => {
      return json.subscriptions.map((sub: any) => {
        const channel: IChannel = {
          stream_id: sub.stream_id,
          name: sub.name,
          description: sub.description,
          color: sub.color,
        };
        return channel;
      });
    });
  };

  getTopics = async (streamId: number): Promise<ITopic[]> => {
    return this.sendRequest({
      path: `users/me/${streamId}/topics`,
      method: 'GET',
    }).then((json: any) => {
      return json.topics.map((t: any) => {
        const topic: ITopic = {
          stream_id: streamId,
          name: t.name,
          max_id: t.max_id,
          file_inputs: [],
        };
        return topic;
      });
    });
  };

  getMessages = async (streamId: number, topic: string) => {
    const queryParams = {
      anchor: 'newest',
      num_before: 10,
      num_after: 0,
      narrow: JSON.stringify([
        { operator: 'stream', operand: streamId },
        { operator: 'topic', operand: topic },
      ]),
    };
    return this.sendRequest({
      path: 'messages',
      queryParams,
      method: 'GET',
    }).then((json: any) => json.messages.map((m: any) => m as IMessage));
  };

  sendMessage = async ({
    type = 'stream',
    to,
    topic,
    content,
  }: IZulipSendMessageParams) => {
    const formData = {
      type: type,
      to: to,
      topic: topic,
      content: content,
    };
    return this.sendRequest({ path: 'messages', formData });
  };

  private getEventFromQueue = async (
    queueId?: string,
    lastEventId?: number,
  ): Promise<IZulipEvent[]> => {
    return this.sendRequest({
      path: 'events',
      method: 'GET',
      queryParams: {
        queue_id: queueId,
        last_event_id: lastEventId,
      },
    }).then((json: any) => {
      if (json.result === 'error') {
        throw new Error('Error getting events');
      }
      return json.events.map((e: any) => e as IZulipEvent);
    });
  };

  private registerEventQueue = async () => {
    let attempts = 5;
    while (true) {
      try {
        const {
          queue_id: queueId,
          last_event_id: lastEventId,
          unread_msgs: unreadMsgs,
        } = await this.sendRequest({
          path: 'register',
          formData: {
            event_types: [
              'message',
              'update_message',
              'delete_message',
              'update_message_flags',
              'exclude_bot',
              'typing',
            ],
            apply_markdown: 'true',
            all_public_streams: 'true',
            client_capabilities: JSON.stringify({
              stream_typing_notifications: true,
              notification_settings_null: true,
            }),
          },
        });
        this.deliveryUnreadMessages(unreadMsgs);
        if (!!queueId && !!lastEventId) {
          return [queueId, lastEventId];
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log('Error registering event queue', error);
        console.log('Start retry after 1 second');
        attempts--;
        if (attempts <= 0) {
          return Promise.reject(error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  subscribeEventQueue = async () => {
    let attempts = 5;
    let queueId: string | undefined = undefined;
    let lastEventId: number = -1;
    let retrying = false;
    while (true) {
      try {
        if (!queueId) {
          [queueId, lastEventId] = await this.registerEventQueue();
        }
        const events = await this.getEventFromQueue(queueId, lastEventId);
        if (retrying) {
          // receive events success, reset attempts
          attempts = 5;
          retrying = false;
          console.log('Retry success');
        }
        events.forEach(this.deliveryEvent);
        lastEventId = Math.max(lastEventId, ...events.map(e => e.id));
        // await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log('Error subscribe event queue', error);
        console.log('Start retry after 1 second');
        attempts--;
        retrying = true;
        if (attempts <= 0) {
          return Promise.reject(error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  private deliveryUnreadMessages = async (unreadMsgs: IUnread) => {
    DEBUG && console.log('deliveryUnreadMessages', unreadMsgs);
    Object.values(this.unreadListeners).forEach(listener => {
      listener(unreadMsgs);
    });
  };

  private deliveryEvent = async (event: IZulipEvent) => {
    if (event.type === 'heartbeat') {
      return;
    }
    DEBUG && console.log('deliveryEvent', event);
    Object.values(this.eventListeners).forEach(listener => {
      listener(event);
    });
  };

  addEventListener = (key: string, listener: IEventListener) => {
    this.eventListeners[key] = listener;
  };

  removeEventListener = (key: string) => {
    delete this.eventListeners[key];
  };

  addUnreadListener = (key: string, listener: IUnreadListener) => {
    this.unreadListeners[key] = listener;
  };

  removeUnreadListener = (key: string) => {
    delete this.unreadListeners[key];
  };

  addFile = async (
    topic: string,
    name: string | undefined,
    path: string,
    start: string | undefined,
    end: string | undefined,
    content: string,
  ) => {
    const formData: any = {
      external_id: topic,
      path: path,
      content: content,
    };
    if (name !== undefined) {
      formData['name'] = name;
    }
    if (start !== undefined && end !== undefined) {
      formData['start'] = start;
      formData['end'] = end;
    }
    return this.sendRequest({
      path: 'assistant/add-file',
      formData,
    });
  };

  getFileInput = async (topic: string): Promise<TopicFileInput[]> => {
    return this.sendRequest({
      path: 'assistant/get-file-input',
      formData: {
        external_id: topic,
      },
    })
      .then((json: any) => (json.files || []) as ITopicFileInput[])
      .then((files: ITopicFileInput[]) =>
        files.map((f: ITopicFileInput) => {
          if (f.start === null) {
            f.start = undefined;
          }
          if (f.end === null) {
            f.end = undefined;
          }
          return new TopicFileInput(f as ITopicFileInput);
        }),
      );
  };
}
