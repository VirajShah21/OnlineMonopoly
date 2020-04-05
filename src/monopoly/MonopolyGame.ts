import Player from "./Player";
import Chatroom from "./Chatroom";
import MonopolyBoard from "./MonopolyBoard";

export default class MonopolyGame {
    private static readonly GAME_ID_CHARS = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private readonly id: string;
    private readonly players: Array<Player>;
    private readonly chatroom: Chatroom;
    private readonly board: MonopolyBoard;
    private currPlayer: number;
    private currDiceRoll: DiceRoll;
    private initialized: boolean;
    private diceLock: boolean;

    constructor(id: string) {
        this.id = id;
        this.players = [];
        this.chatroom = new Chatroom();
        this.currPlayer = 0;
        this.currDiceRoll = new DiceRoll(0, 0);
        this.board = new MonopolyBoard();
        this.initialized = false;
        this.diceLock = true;
    }

    initialize(): void {
        this.initialized = true;
        this.diceLock = false;

        // Assign colors
        let colors: Array<string> = ["#09FBD3", "#FE53BB", "#F5D300", "#B76CFD", "#FF9472", "#FFDEF3"];
        this.players.forEach((player: Player, index: number): void => {
            player.setColor(colors[index]);
        });
    }

    setupNextTurn(): void {
        this.currPlayer++;
        if (this.currPlayer >= this.players.length)
            this.currPlayer = 0;
    }

    rollDice(): DiceRoll {
        let one: number = Math.floor(Math.random() * 6) + 1;
        let two: number = Math.floor(Math.random() * 6) + 1;
        this.currDiceRoll = new DiceRoll(one, two);
        this.players[this.currPlayer].move(this.currDiceRoll.getSum());
        return this.currDiceRoll;
    }

    getChatroom(): Chatroom {
        return this.chatroom;
    }

    addPlayer(player: Player): void {
        this.players.push(player);
    }

    getPlayers(): Array<Player> {
        return this.players;
    }

    getCurrPlayer(): number {
        return this.currPlayer;
    }

    getCurrDiceRoll(): DiceRoll {
        return this.currDiceRoll;
    }

    getBoard(): MonopolyBoard {
        return this.board;
    }

    getId(): string {
        return this.id;
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    static generateGameId(): string {
        let out: string = "";
        for (let i = 0; i < 5; i++)
            out += this.GAME_ID_CHARS.charAt(Math.floor(Math.random() * this.GAME_ID_CHARS.length));
        return out;
    }

    export(): any {
        // Leaving out this.board during export
        // this data is too large to continuously transport
        return {
            id: this.id,
            players: this.players.map((player: Player): any => {
                return player.export();
            }),
            chatroom: this.chatroom.export(),
            currPlayer: this.currPlayer,
            currDiceRoll: this.currDiceRoll.export(),
            initialized: this.initialized,
            diceLock: this.diceLock
        };
    }
}

export class DiceRoll {
    private readonly roll1: number;
    private readonly roll2: number;

    constructor(roll1: number, roll2: number) {
        this.roll1 = roll1;
        this.roll2 = roll2;
    }

    getRoll1(): number {
        return this.roll1;
    }

    getRoll2(): number {
        return this.roll2;
    }

    getSum(): number {
        return this.roll1 + this.roll2;
    }

    export(): any {
        return {
            roll1: this.roll1,
            roll2: this.roll2
        };
    }
}