import { IChannelSubscriptionParam,
     IListTopic, IMessage, 
    IMessageFlagParam, IStream, 
    ITopicPreferences, ITypingStatusParams } from "../constants/chatbox";
import axios from "axios";
import { PROJECT_ZULIP_SERVER_CURRENT, PROJECT_ZULIP_SERVER_MAP, UserLogin } from "../constants/chatbox";
import api from "../lib/api";
import { makeObservable, observable } from "mobx";

const handleSuccessfulEvents = (event: any, callback?: () => void) => { };

const handleFailedEvents = (err: any, callback?: () => void) => { };

export const eventHandler = {
    success: (evt: any, callback?: () => void) => handleSuccessfulEvents(evt, callback),
    error: (err: any, callback?: () => void) => handleFailedEvents(err, callback),
  };


export enum EventQueueType {
  message = "message",
  typing = "typing"
}

export enum EChatEventKey {
  LIST = "realtime__message__list",
  DETAIL = "realtime__message__detail",
  NEW = "realtime__message__new",
  CHATBOX = "realtime__message__chatbot"
}

const ERROR_DISCONNECT_FROM_QUEUE = "disconnect from current queue";

const BASE_DOMAIN = 'collab.vietis.com.vn:9981';


export class ZulipService {
  realm_string: string = '';
  token: string = "";

  constructor(realm: any, token: string) {
    makeObservable(this, {
      realm_string: observable,
      token: observable
    });
    this.realm_string = realm;
    this.token = token;
  }
  
  getZulipUrl(realm:string) {
    const formattedSubDomain = realm.endsWith('.') ? realm.slice(0, -1) : realm;
    console.log("GET ZULIP URL ", `https://${formattedSubDomain}.${BASE_DOMAIN}`);
    return `https://${formattedSubDomain}.${BASE_DOMAIN}`;
  }

  // getZulipToken() {
  //   return this.token;
  // }

  zulipApi = async (requestUrl: string, method: any, params?: any) => {
    try {
      // const slug = this.router.query.workspaceSlug || "";
      // if (!slug) throw "Error fetching zulip server.";
      console.log("DATA API ", params, requestUrl, method);
      return api(
        requestUrl,
        { workspaceSlug: this.realm_string },
        method,
        this.token,
        params
      );
    } catch (error) {
      console.error("url: " + requestUrl, "error: " + error);
    }
  };

  // http methods
  async get(url: string, config = {}): Promise<any> {
    const _token = this.token;
    if (!_token) return Promise.reject(_token);
    console.log("CALL AXIOS")
    return axios({
      baseURL: this.getZulipUrl(this.realm_string),
      method: "get",
      url: url,
      headers: _token ? { Authorization: `Basic ${_token}` } : {},
      ...config,
    });
  }

  request(config = {}) {
    return axios(config);
  }

  // api calls
  async getWorkspaceStreams(): Promise<[IStream]> {
    const url = `/api/v1/streams`
    return this.zulipApi(url, "GET", {});
    // return this.get("/api/v1/streams", {})
    //   .then((response) => response?.streams)
    //   .catch((error) => {
    //     if (error instanceof Error) throw error;
    //     throw error?.response?.data;
    //   });
  }

  async getTopics(streamId: string): Promise<any> {
    const url = `/api/v1/users/me/${streamId}/topics`;
    return this.zulipApi(url, "GET", {})
    // return this.get(`/api/v1/users/me/${streamId}/topics`)
    //   .then((response) => response?.data)
    //   .catch((error) => {
    //     throw error?.response?.data;
    //   });
  }

  async getMessages(params: any): Promise<any> {
    const url = `/api/v1/messages`;
    return this.zulipApi(url, "GET", params);
  }

  async getDetailMessage(msgId: IMessage["id"], params: any): Promise<any> {
    const url = `/api/v1/messages/${msgId}`;
    return this.zulipApi(url, "GET", params);
  }

  async postMessages(params: any): Promise<any> {
    const url = `/api/v1/messages`;
    return this.zulipApi(url, "POST", params);
  }

  async editMessage(msgId: IMessage["id"], params: any): Promise<any> {
    const url = `/api/v1/messages/${msgId}`;
    return this.zulipApi(url, "PATCH", params);
  }

  async deleteMessage(message_id: IMessage["id"], params: any): Promise<any> {
    const url = `/api/v1/messages/${message_id}`;
    return this.zulipApi(url, "DELETE", params);
  }

  async deleteTopic(streamId: IStream["stream_id"], topicName: IListTopic["name"]): Promise<any> {
    const params = { topic_name: topicName };
    const url = `/api/v1/streams/${streamId}/delete_topic`;
    return this.zulipApi(url, "POST", params);;
  }

  async renderMessage(content: string): Promise<any> {
    const params = { content };
    const url = `/api/v1/messages/render`;
    return this.zulipApi(url, "POST", params);
  }

  async getZulipProfile(): Promise<any> {
    const url = `/api/v1/users/me`;
    return this.zulipApi(url, "GET", undefined);
  }

  async getWorkspaceMembers(params: any): Promise<any> {
    const url = `/api/v1/users`;
    return this.zulipApi(url, "GET", params);
  }

  async getUserListDMs(params: any): Promise<any> {
    const url = `/api/v1/messages/direct_message`;
    return this.zulipApi(url, "GET", params);
  }

  async migrateTopic(params: any, draftStreamId: IStream["stream_id"]): Promise<any> {
    const url = `/api/v1/streams/migrate_topic/${draftStreamId}`;
    return this.zulipApi(url, "POST", params);
  }

  async get_api_key(params: UserLogin): Promise<any> {
    const url = `/api/v1/fetch_api_key`;
    return this.zulipApi(url, "POST", params);
  }

  async updateMessageFlag(params: IMessageFlagParam): Promise<any> {
    const url = `/api/v1/messages/flags`;
    return this.zulipApi(url, "POST", params);
  }

//   async addMessageReaction(params: IMessageReactionParam, messageId: IMessage["id"]): Promise<any> {
//     const url = `/api/v1/messages/${messageId}/reactions`;
//     return this.zulipApi(url, "POST", params);
//   }

  async addMessageEvaluation(params: { tag: string; }, messageId: IMessage["id"]): Promise<any> {
    const url = `/api/v1/messages/${messageId}/evaluation`;
    return this.zulipApi(url, "POST", params);
  }

  async subscribeToChannel(params: IChannelSubscriptionParam): Promise<any> {
    const url = `/api/v1/users/me/subscriptions`;
    return this.zulipApi(url, "POST", params);
  }

  async setTypingStatus(params: ITypingStatusParams): Promise<any> {
    const url = `/api/v1/typing`;
    return this.zulipApi(url, "POST", params);
  }

  async updateTopicPreferences(params: ITopicPreferences): Promise<any>{
    const url = '/api/v1/user_topics';
    return this.zulipApi(url, "POST", params)
  }

  // api queue
  async queueRegister(initialParams: any): Promise<any> {
    const url = `/api/v1/register`;
    const params = { ...initialParams };
    if (params.event_types) {
      params.event_types = JSON.stringify(params.event_types);
    }
    if (params.sender_apply_raw_content) {
      params.sender_apply_raw_content = JSON.stringify(params.sender_apply_raw_content);
    }
    return this.zulipApi(url, "POST", params);
  }

  async queueDeregister(params: any): Promise<any> {
    const url = `/api/v1/events`;
    return this.zulipApi(url, "DELETE", params);
  }

  async getEvents(params: any): Promise<any> {
    const url = `/api/v1/events`;
    return this.zulipApi(url, "GET", params);
  }

  // zulip client
  async subscribeEventQueue(
    callback: (e: any) => void,
    initEventCallback: () => void,
    erorHandler: (error: any) => void,
    unreadCallBack: (unreads: any) => void
  ): Promise<any> {
    let attempts = 5;
    let queueId: string | null = null;
    let lastEventId: number | null = null;

    initEventCallback();
    while (true) {
      if (!queueId) {
        [queueId, lastEventId] = await this.registerEventQueue(
          ["message", "update_message_flags", "exclude_bot", "typing",],
          unreadCallBack,
          null
        );
      }

      try {
        const payload = await this.getEventQueue(queueId!, lastEventId!);
        if (payload?.name === "AbortError") {
          attempts = 0;
          throw ERROR_DISCONNECT_FROM_QUEUE;
          // return Promise.reject(error);
        }
        if (!payload || !payload.events) throw "Error connecting to chat server";
        for (const event of payload?.events) {
          lastEventId = Math.max(
            lastEventId!, Number(event.id));
          if (event.type === 'heartbeat') {
            continue;
          }
          callback(event);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`subscribeEventQueue error: ${error}`);
        console.log('Start rertry after 1 second');
        attempts -= 1;
        if (attempts <= 0) {
          error !== ERROR_DISCONNECT_FROM_QUEUE && erorHandler(error);
          return Promise.reject(error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    }
  };

  async registerEventQueue(
    event_types: string[],
    unreadCallBack: (unreads: any) => void,
    sender_apply_raw_content?: [string] | null, // !todo: remove later when apply buttons to comtor AI's response
  ): Promise<any> {
    let attempts = 5;
    while (true) {
      try {
        const params: any = {
          event_types: event_types,
          apply_markdown: "true",
          client_capabilities: JSON.stringify({
            "stream_typing_notifications": true,
            "notification_settings_null": true
          })
        };
        if (sender_apply_raw_content) {
          params.sender_apply_raw_content = sender_apply_raw_content;
        }
        const register = await this.queueRegister(params);
        register.unread_msgs && unreadCallBack(register.unread_msgs as any);
        const { queue_id: queueId, last_event_id: lastEventId } = register;
        if (!!queueId && !!lastEventId) {
          return [
            queueId,
            lastEventId,
          ];
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`registerEventQueue error: ${error}`);
        console.log('Start rertry after 1 second');
        attempts -= 1;
        if (attempts <= 0) {
          return Promise.reject(error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  async getEventQueue(
    queue_id: String,
    lastEventId: number
  ): Promise<any> {
    try {
      const eventParams = {
        queue_id,
        last_event_id: lastEventId,
      };
      const events = await this.getEvents(eventParams);
      eventHandler.success(events);
      return events;
    } catch (error) {
      eventHandler.error(error);
      console.log(`getEventQueue error: ${error}`);
      return error;
    }
  };

  async deleteEventQueue(
    queueId: string
  ): Promise<any> {
    try {
      const deregisterParams = { queue_id: queueId };
      const result = await this.queueDeregister(deregisterParams);
      return result;
    } catch (error) {
      console.log(`deleteEventQueue error: ${error}`);
    }
  };
}