import * as React from "react";
import {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { VSCodeButton, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";

import "./style.css";
import { MessageItem } from "./MessageItem";
import { ChatViewServiceImpl } from "./chatViewServiceImpl";
import { getServiceManager } from "../../common/ipc/webview";
import { IChatService, CHAT_SERVICE_NAME } from "../../common/chatService";
import { MessageItemModel, IChatRow, IGetMsgAPIParams } from "../../common/chatService/model";
import { messages as sampleMessages, Dms, ChatRowData } from "../constants/message";
import { IZulipDM } from "../constants/chatbox";
import * as vscode from 'vscode';
import { getUserAvatar, groupMessages } from "../helpers/chatbox.helper"
import { observable } from "mobx";
import { observer } from "mobx-react";
import clsx from "clsx";
import { format, isToday } from "date-fns";
import { IListTopic } from "../constants/chatbox";
import { TfiPlus, TfiComment } from "react-icons/tfi";
import ZulipStore from "../store";

function messagesWithUpdatedBotMessage(
    msgs: MessageItemModel[],
    updatedMsg: MessageItemModel
): MessageItemModel[] {
    return msgs.map((msg) => {
        if (updatedMsg.id === msg.id) {
            return updatedMsg;
        }
        return msg;
    });
}

type UseConfirmShortcut = {
    label: string;
    keyDownHandler: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};
function useConfirmShortcut(handler: () => void): UseConfirmShortcut {
    const isMac = useMemo(() => {
        const userAgentData = (window.navigator as any).userAgentData;
        if (userAgentData) {
            return userAgentData.platform === "macOS";
        }
        return window.navigator.platform === "MacIntel";
    }, []);

    return {
        label: isMac ? "⌘⏎" : "Ctrl+Enter",
        keyDownHandler: useCallback(
            (e) => {
                if (e.key !== "Enter") {
                    return;
                }
                const expected = isMac ? e.metaKey : e.ctrlKey;
                const unexpected = isMac ? e.ctrlKey : e.metaKey;
                if (!expected || e.altKey || e.shiftKey || unexpected) {
                    return;
                }
                handler();
            },
            [isMac, handler]
        ),
    };
}

const AUTO_SCROLL_FLAG_NONE = 0;
const AUTO_SCROLL_FLAG_FORCED = 1;
const AUTO_SCROLL_FLAG_AUTOMATIC = 2;

const ChatRow = observer(({ data, mode }: IChatRow) => {
    const groupMessages = data?.sub_messages && Array.isArray(data?.sub_messages) ? data?.sub_messages : [];

    const calculateTime = () => {
        const _time = data.timestamp;
        if (!_time || typeof _time !== "number") return "";
        const _date = new Date(_time * 1000);
        return format(_date, !isToday(_date) ? "dd/MM/yy, p" : "p");
    };

    const userAvatar = getUserAvatar(data.avatar_url, "prd-1");

    return (
        <div className={clsx(
            "chat__row w-full flex flex-row min-h-fit justify-center items-start gap-x-2",
            mode === "chat" && "pl-4"
        )}>
            <div className="avatar h-5 w-5 rounded-full">
            </div>
            <div className="main flex flex-1 flex-col w-[calc(100%_-_3.225rem)]">
                <div className="w-full flex flex-row items-center gap-x-8">
                    <div className={`flex-1 font-bold text-sm`}>{data.sender_full_name}</div>
                    <div className="w-fit min-w-12 flex flex-row gap-x-8 mr-2">
                        <p className="text-xs pl-2">{calculateTime()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});


export function ChatPage({ topic }: { topic: IListTopic }) {
    // declare Messages
    const [messages, setMessages] = useState([] as MessageItemModel[]);
    const [currentTopic, setCurrentTopic] = useState("");
    // delcare dms
    const [dms, setDms] = useState([] as IZulipDM[]);
    const [hasSelection, setHasSelection] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [fetchStatus, setFetchStatus] = useState<string | null>(null);
    const [autoScrollFlag, setAutoScrollFlag] = useState(AUTO_SCROLL_FLAG_NONE);
    const chatListRef = useRef<HTMLDivElement>(null);
    const zulipStore = new ZulipStore("pjd-1", "aGFvLm5ndXllbmRhbmdAdmlldGlzLmNvbS52bjpTWUpxamw3VE12MnJSTENWNGFWMVBmbUtmOUNHcVhKaA==")

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Dependent on `setMessages`, which will never change.
    const addMessageAction = useCallback((msg: MessageItemModel) => {
        setMessages((prev) => {
            return [...prev, msg];
        });
        setAutoScrollFlag(AUTO_SCROLL_FLAG_FORCED);
    }, []);
    const updateMessageAction = useCallback((msg: MessageItemModel) => {
        setMessages((prev) => {
            return messagesWithUpdatedBotMessage(prev, msg);
        });
        setAutoScrollFlag(AUTO_SCROLL_FLAG_AUTOMATIC);
    }, []);
    const clearMessageAction = useCallback(() => {
        setMessages([]);
    }, []);

    const handleAskAction = useCallback(async () => {
        const chatService = await getServiceManager().getService<IChatService>(
            CHAT_SERVICE_NAME
        );
        await chatService.confirmPrompt(prompt);
        setPrompt("");
    }, [prompt, setPrompt, setMessages]);

    const confirmShortcut = useConfirmShortcut(handleAskAction);

    useLayoutEffect(() => {
        if (!autoScrollFlag) {
            return;
        }
        const chatListEl = chatListRef.current;
        if (!chatListEl) {
            return;
        }

        setAutoScrollFlag(AUTO_SCROLL_FLAG_NONE);

        const targetScrollTop =
            chatListEl.scrollHeight - chatListEl.clientHeight;
        // TODO: implement `AUTO_SCROLL_FLAG_AUTOMATIC` flag.
        chatListEl.scrollTop = targetScrollTop;
    }, [messages, autoScrollFlag, setAutoScrollFlag, chatListRef]);

    // fetchers
  // TODO: refactor zulip messages fetcher later
  const fetchCall = async (
    { type, anchor, chatInfo }:
      { type: "first" | "extra"; anchor: string; chatInfo: any; }
  ) => {
    // extract values
    const _chatType: "topic" | "dm" = chatInfo.type;
    const subject_name = chatInfo.subject || "";
    const targetId: any = chatInfo.targetId;

    if (_chatType === "topic" && (!subject_name || !targetId)) return;
    if (_chatType === "dm" && !Array.isArray(targetId)) return;

    // contruct params
    const _params: IGetMsgAPIParams | null =
      _chatType === "topic" ?
        {
          anchor: `${type === "first" ? "newest" : anchor}`,
          num_before: 50,
          num_after: 0,
          narrow: JSON.stringify([
            { "negated": false, "operator": "stream", "operand": targetId }, // id of parent stream
            { "negated": false, "operator": "topic", "operand": subject_name } // topic name
          ]),
          client_gravatar: false
        }
        : _chatType === "dm" ?
          {
            anchor: `${type === "first" ? "newest" : anchor}`,
            num_before: 50,
            num_after: 0,
            narrow: JSON.stringify([
              { "negated": false, "operator": "dm", "operand": targetId },
            ]),
            client_gravatar: false
          }
          : null;

    if (!_params) return;
    // if (shouldTranslateChat) _params.language = currentLanguage;

    const response: any = await zulipStore.fetchMessages(_params);
    const formatted = groupMessages(response.messages);
    const oldestMessage = response.messages && Array.isArray(response.messages) ? response.messages?.[0] : null;

    return {
      formatted,
      fetch_status: {
        found_oldest: response?.found_oldest,
        anchor: oldestMessage?.id,
      },
      error: response instanceof Error ? response : null,
    };
  };

  const firstFetch = async () => {
    if (!currentChatDetailId) return;
    const _response = await fetchCall({
      type: "first",
      anchor: "0",
      chatInfo: currentChatInfo
    });
    if (!_response) return;
    setFetchStatus(
      _response.fetch_status?.anchor ?
        JSON.stringify({
          found_oldest: _response.fetch_status?.found_oldest,
          anchor: _response.fetch_status?.anchor,
        })
        : null
    );
    setGroupedMessages(_response.formatted);
  };



    useEffect(() => {
        if (topic) {
            setCurrentTopic(topic)
        }

        // const serviceManager = getServiceManager();

        // const viewServiceImpl = new ChatViewServiceImpl();
        // viewServiceImpl.setIsReadyAction = setIsReady;
        // viewServiceImpl.setHasSelectionAction = setHasSelection;
        // viewServiceImpl.addMessageAction = addMessageAction;
        // viewServiceImpl.updateMessageAction = updateMessageAction;
        // viewServiceImpl.clearMessageAction = clearMessageAction;
        // serviceManager.registerService(viewServiceImpl);

        // serviceManager
        //     .getService<IChatService>(CHAT_SERVICE_NAME)
        //     .then((chatService: { syncState: () => void; }) => {
        //         chatService.syncState();
        //     });
    }, []);
    const userAvatar = getUserAvatar("", 'prd-1');
    const handleBackClick = () => {
        console.log("CLICK PLUS");
    };

    return (<div className="chat-root">
        <div className="chat-header">
            {/* Display the selected topic */}
            <h2>{`Chatting about: ${topic.name}`}</h2>
            <div className="header-actions">
                <TfiPlus onClick={handleBackClick}/>
                <TfiComment />
            </div>
        </div>
        <div ref={chatListRef} className="chat-list">
            {ChatRowData.map((m) => (
                // <div key={m.id} className="message-item">
                //     <img src={userAvatar} alt={`${m.username}'s avatar`} className="avatar" />
                //     <div className="message-content">
                //         <div className="message-header">
                //             <span className="username">{m.username}</span>
                //         </div>
                //         <div className="message-body">
                //             <p>{m.contents}</p>
                //         </div>
                //     </div>
                // </div>
                <ChatRow mode="chat" data={m} />
            ))}
        </div>
        <div className="chat-input-area">
            <VSCodeTextArea
                style={{ width: "100%" }}
                rows={3}
                placeholder={`Talk about the ${hasSelection ? "selected contents" : "whole document"
                    }...`}
                disabled={!isReady}
                value={prompt}
                // onChange={(e: Event) => {
                //     const target = e.target as HTMLTextAreaElement;
                //     setPrompt(target.value);
                // }}
                onKeyDown={confirmShortcut.keyDownHandler}
            />
            <div className="input-actions">
                <VSCodeButton className="icon-button"
                    disabled={!isReady || prompt.length === 0}
                    onClick={handleAskAction}>
                    ↩ {`Ask follow up (${confirmShortcut.label})`}
                </VSCodeButton>
                <VSCodeButton className="icon-button">⌘ codebase</VSCodeButton>
            </div>
            {/* <VSCodeButton
                disabled={!isReady || prompt.length === 0}
                onClick={handleAskAction}
            >
                {`Ask (${confirmShortcut.label})`}
            </VSCodeButton> */}
        </div>
    </div>);
}