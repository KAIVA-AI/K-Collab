import { PROJECT_ZULIP_SERVER_CURRENT, PROJECT_ZULIP_SERVER_MAP } from "../constants/chatbox";

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
  