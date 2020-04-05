import Player from "./Player";

export default class Chatroom {
    private readonly messages: Array<ChatroomMessage>;

    constructor() {
        this.messages = [];
    }

    addMessage(author: Player, message: string) {
        this.messages.push({
            authorId: author.getId(),
            message: message,
            timestamp: new Date()
        });
    }

    getMessages(offset?: number): Array<ChatroomMessage> {
        if (offset) {
            let out: Array<ChatroomMessage> = [];
            for (let i: number = offset; i < this.messages.length; i++)
                out.push(this.messages[i]);
            return out;
        } else {
            return this.messages;
        }
    }

    export(): any {
        return {messages: this.messages};
    }
}

export interface ChatroomMessage {
    authorId: string;
    message: string;
    timestamp: Date;
}