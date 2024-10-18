import { IMessage } from "../../common/chatService/model";

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