import {
  IChannel,
  IMessage,
  ITopic,
  ITopicFileInput,
  IZulipSendMessageParams,
  TopicFileInput,
  IZulipUserFileUpload,
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
  signal?: AbortSignal | null;
}

export class ZulipService {
  private token: string = '';
  private eventListeners: IEventListeners = {};
  private unreadListeners: IUnreadListeners = {};
  private tokenType: string = 'Basic';
  private controller? = new AbortController();
  private subscribeKey: number = 0;
  private realm?: string;

  get isAuthorized() {
    return !!this.token;
  }

  constructor() {}

  setToken = (token: string) => {
    this.token = token;
    this.tokenType = 'Bearer';
  };

  setBasicAuth = (email: string, apiKey: string) => {
    this.token = btoa(`${email}:${apiKey}`);
    this.tokenType = 'Basic';
  };

  setRealm = (realm: string) => {
    this.realm = realm;
  };

  private buildUrl = (path: string) => {
    if (this.realm === undefined) {
      throw new Error('Realm is not set');
    }
    const prefix = !this.realm ? '' : `${this.realm}.`;
    return `${ZULIP_PROTOCOL}${prefix}${ZULIP_BASE_DOMAIN}/api/v1/${path}`;
  };

  private sendRequest = async ({
    path,
    formData,
    queryParams,
    method = 'POST',
    controller,
  }: {
    path: string;
    method?: string;
    formData?: any;
    queryParams?: any;
    controller?: AbortController;
  }): Promise<any> => {
    try {
      let url = this.buildUrl(path);
      const headers = new Headers();
      headers.set('Authorization', `${this.tokenType} ${this.token}`);
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
      if (controller) {
        request.signal = controller.signal;
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
      num_before: 50,
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
    this.controller?.abort();
    this.controller = new AbortController();
    return this.sendRequest({
      path: 'events',
      method: 'GET',
      queryParams: {
        queue_id: queueId,
        last_event_id: lastEventId,
      },
      controller: this.controller,
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

  stopSubscribeEventQueue = () => {
    this.subscribeKey = Date.now();
    this.controller?.abort();
  };

  subscribeEventQueue = async () => {
    let attempts = 5;
    let queueId: string | undefined = undefined;
    let lastEventId: number = -1;
    let retrying = false;
    this.subscribeKey = Date.now();
    const localSubscribeKey = this.subscribeKey;
    while (true) {
      try {
        if (!queueId) {
          [queueId, lastEventId] = await this.registerEventQueue();
        }
        const events = await this.getEventFromQueue(queueId, lastEventId);
        DEBUG && console.log('subscribeEventQueue events', events);
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
        if (this.subscribeKey !== localSubscribeKey) {
          console.log('Stop subscribe event queue');
          return;
        }
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
    content: string | undefined,
    inputType: string = 'coding_context_file',
  ) => {
    const formData: any = {
      external_id: topic,
      path: path,
      input_type: inputType,
      content: content,
    };
    if (name !== undefined) {
      formData['name'] = name;
    }
    if (start !== undefined && end !== undefined) {
      formData['start'] = start;
      formData['end'] = end;
    }
    if (content !== undefined) {
      formData['content'] = content;
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

  getElementInput = async (topic: string): Promise<TopicFileInput[]> => {
    return this.sendRequest({
      path: 'assistant/get-element-input',
      formData: {
        external_id: topic,
        input_type: 'html_element',
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

  postUserUpload = async (data: any) => {
    const result = await this.sendRequest({
      path: 'user_uploads',
      formData: data,
    });
    const prefix = !this.realm ? '' : `${this.realm}.`;
    return {
      name: data.name,
      url: `${ZULIP_PROTOCOL}${prefix}${ZULIP_BASE_DOMAIN}${result?.url}`,
    };
  };
}
