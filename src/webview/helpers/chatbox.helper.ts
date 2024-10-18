import { PROJECT_ZULIP_SERVER_CURRENT, PROJECT_ZULIP_SERVER_MAP } from "../constants/chatbox";
import { IMessage } from "../../common/chatService/model";

const STOCK_USER_AVATAR_URL = "/chatbox/fixed-avatar/stock_user.jpg";
export const CHAT_ID_SEPERATOR: string = "____";


export const getUserAvatar = (stockURL: string, workspaceSlug?:string) => {
    if (!stockURL || !workspaceSlug) return STOCK_USER_AVATAR_URL;

    const projectId = "";
    const chatServerMap = JSON.parse("{}");
    const domain: string =
        chatServerMap[workspaceSlug]
            ? chatServerMap[workspaceSlug][projectId]?.url || undefined
            : undefined;

    return stockURL.startsWith("http")
        ? stockURL
        : domain
            ? domain + stockURL
            : STOCK_USER_AVATAR_URL;
};

export const generateChatDetailID = ({ type, subject, targetId, parentTarget }: { type: "dm" | "topic"; subject: string; targetId: number | string; parentTarget?: string; }) => {
    if (!subject || !targetId) return "";
    return `${subject}${CHAT_ID_SEPERATOR}${type === "topic"
      ? targetId : `[${targetId}]`
      }${type === "topic" && parentTarget
        ? CHAT_ID_SEPERATOR + parentTarget : ""
      }${CHAT_ID_SEPERATOR}${type}`;
  };
  

  export const groupMessages = (messages: IMessage[]) => {
      if (!messages || !Array.isArray(messages)) return [];
  
      // store messages by the same user in the same timespan
      const temp: any[] = [];
      const subMessages: IMessage[] = [];
      const childIds: IMessage["id"][] = [];
  
      (messages as IMessage[]).forEach((msg: IMessage, index: number) => {
          const isLast = index === messages.length - 1;
          // find previously store sender
          const prev: IMessage = temp[temp.length - 1] || null;
          if (!prev) {
              temp.push({
                  sender_full_name: msg.sender_full_name,
                  avatar_url: msg.avatar_url,
                  sender_id: msg.sender_id,
                  timestamp: msg.timestamp,
              });
          } else {
              const TIME_GAP = 3600; // 1 hour ~ 3600 seconds
              const isMessageOld = prev.timestamp && msg.timestamp ? prev.timestamp + TIME_GAP < msg.timestamp : false;
              if (prev?.sender_id !== msg.sender_id && msg.sender_id || isMessageOld) {
                  // set message of previous group
                  temp[temp.length - 1] = {
                      ...temp[temp.length - 1],
                      sub_messages: JSON.parse(JSON.stringify(subMessages)),
                      childIds: [...childIds]
                  };
                  temp.push({
                      sender_full_name: msg.sender_full_name,
                      avatar_url: msg.avatar_url,
                      sender_id: msg.sender_id,
                      timestamp: msg.timestamp,
                  });
                  // reset array for next grouping
                  subMessages.length = 0;
                  childIds.length = 0;
              }
          }
          if (isLast) {
              temp[temp.length - 1] = {
                  ...temp[temp.length - 1],
                  sub_messages: JSON.parse(JSON.stringify([...subMessages, msg])),
                  childIds: [...childIds, msg.id]
              };
          }
          subMessages.push(msg);
          childIds.push(msg.id);
      });
  
      subMessages.length = 0;
      return temp;
  };