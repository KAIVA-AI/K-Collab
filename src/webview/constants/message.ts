import { MessageItemModel, User } from "../../common/chatService/model";
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

export const Users: User[] = [
    {
        "id": "1",
        "avatar": "https://example.com/avatar1.png",
        "name": "name 1"
    },
    {
        "id": "1",
        "avatar": "https://example.com/avatar2.png",
        "name": "name 1"
    }
];