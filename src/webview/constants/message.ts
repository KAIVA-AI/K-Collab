import { MessageItemModel, User, IZulipDM, IChatRowData, IMessage } from "../../common/chatService/model";
export const messages: MessageItemModel[] = [
    {
        "id": "1",
        "contents": "some thing",
        "isReply": true,
        "isFinished": true,
    },
    {
        "id": "2",
        "contents": "some thing 2222",
        "isReply": true,
        "isFinished": true
    }
];

export const Dms: IZulipDM[] = [
    {
        "id": [1,2],
        // "avatar": "https://example.com/avatar1.png",
        "full_name": "name 1",
    },
    {
        "id": [3,4],
        // "avatar": "https://example.com/avatar2.png",
        "full_name": "name22222",
    }
];

export const Message: IMessage[] = []

export const ChatRowData: IChatRowData[] = [
    {
        "timestamp": 1729045510,
        "avatar_url": "https://example.com/avatar1.png",
        "sender_id": 1,
        "sender_full_name": "namdt",
        "sub_messages": [],
}];
