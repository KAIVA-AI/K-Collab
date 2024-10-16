export interface MessageItemModel {
    id: string;
    contents: string;
    isReply?: boolean;
    isFinished?: boolean;
}

export interface User {
    id: string;
    avatar: string;
    name: string;
}
