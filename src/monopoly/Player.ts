import PropertyManager from "./PropertyManager";

export default class Player {
    private static PLAYER_ID_CHARS = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private readonly id: string;
    private readonly name: string;
    private balance: number;
    private position: number;
    private readonly propertyManager: PropertyManager;
    private color: string;

    constructor(name: string) {
        this.id = Player.generatePlayerId();
        this.name = name;
        this.balance = 1500;
        this.position = 0;
        this.propertyManager = new PropertyManager();
        this.color = "black";
    }

    adjustBalance(amount: number): number {
        this.balance += amount;
        return this.balance;
    }

    getId(): string {
        return this.id;
    }

    setBalance(value: number): void {
        this.balance = Math.floor(value);
    }

    getName(): string {
        return this.name;
    }

    getPosition(): number {
        return this.position;
    }

    getBalance(): number {
        return this.balance;
    }

    getPropertyManager(): PropertyManager {
        return this.propertyManager;
    }

    getColor(): string {
        return this.color;
    }

    setColor(value: string): void {
        this.color = value;
    }

    move(spaces: number): number {
        this.position += spaces;
        if (this.position > 39)
            this.position -= 40;
        return this.position;
    }

    export(): any {
        return {
            id: this.id,
            name: this.name,
            balance: this.balance,
            position: this.position,
            propertyManager: this.propertyManager.export(),
            color: this.color
        }
    }

    private static generatePlayerId(): string {
        let out: string = "";
        for (let i: number = 0; i < 10; i++)
            out += this.PLAYER_ID_CHARS.charAt(Math.floor(Math.random() * this.PLAYER_ID_CHARS.length));
        return out;
    }
}