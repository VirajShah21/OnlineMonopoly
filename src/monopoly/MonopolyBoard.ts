export default class MonopolyBoard {
    board: Array<Tile>;

    constructor() {
        this.board = MonopolyBoard.buildBoard();
    }

    tileAt(index: number): Tile {
        return this.board[index];
    }

    static buildBoard(): Array<Tile> {
        return [
            new Tile("Go"),
            new ColoredProperty("Mediterranean Avenue", 60, PropertyGroupId.BROWN, [2, 10, 30, 90, 160, 250]),
            new Tile("Community Chest"),
            new ColoredProperty("Baltic Avenue", 60, PropertyGroupId.BROWN, [4, 20, 60, 180, 320, 450]),
            new Tile("Income Tax | $200"),
            new Railroad("Reading Railroad"),
            new ColoredProperty("Oriental Avenue", 100, PropertyGroupId.LIGHTBLUE, [6, 30, 90, 270, 400, 550]),
            new Tile("Chance"),
            new ColoredProperty("Vermont Avenue", 100, PropertyGroupId.LIGHTBLUE, [6, 30, 90, 270, 400, 550]),
            new ColoredProperty("Connecticut Avenue", 120, PropertyGroupId.LIGHTBLUE, [8, 40, 100, 300, 450, 600]),
            new Tile("Jail"),
            new ColoredProperty("St. Charles Place", 140, PropertyGroupId.PINK, [10, 50, 150, 450, 625, 750]),
            new Utility("Electric Company"),
            new ColoredProperty("States Avenue", 140, PropertyGroupId.PINK, [10, 50, 150, 450, 625, 750]),
            new ColoredProperty("Virginia Avenue", 160, PropertyGroupId.PINK, [12, 60, 180, 500, 700, 900]),
            new Railroad("Pennsylvania Railroad"),
            new ColoredProperty("St. James Place", 180, PropertyGroupId.ORANGE, [14, 70, 200, 550, 750, 950]),
            new Tile("Community Chest"),
            new ColoredProperty("Tennessee Avenue", 180, PropertyGroupId.ORANGE, [14, 70, 200, 550, 750, 950]),
            new ColoredProperty("New York Avenue", 200, PropertyGroupId.ORANGE, [16, 80, 220, 600, 800, 1000]),
            new Tile("Free Parking"),
            new ColoredProperty("Kentucky Avenue", 220, PropertyGroupId.RED, [18, 90, 250, 700, 875, 1050]),
            new Tile("Chance"),
            new ColoredProperty("Indiana Avenue", 220, PropertyGroupId.RED, [18, 90, 250, 700, 875, 1050]),
            new ColoredProperty("Illinois Avenue", 240, PropertyGroupId.RED, [20, 100, 300, 750, 925, 1100]),
            new Railroad("B&O Railroad"),
            new ColoredProperty("Atlantic Avenue", 260, PropertyGroupId.YELLOW, [22, 110, 330, 800, 975, 1150]),
            new ColoredProperty("Ventnor Avenue", 260, PropertyGroupId.YELLOW, [22, 110, 330, 800, 975, 1150]),
            new Utility("Water Works"),
            new ColoredProperty("Marvin Gardens", 260, PropertyGroupId.YELLOW, [24, 120, 360, 850, 1025, 1200]),
            new Tile("Go to Jail"),
            new ColoredProperty("Pacific Avenue", 300, PropertyGroupId.GREEN, [26, 130, 390, 900, 1100, 1275]),
            new ColoredProperty("North Carolina Avenue", 300, PropertyGroupId.GREEN, [26, 130, 390, 900, 1100, 1275]),
            new Tile("Community Chest"),
            new ColoredProperty("Pennsylvania Avenue", 320, PropertyGroupId.GREEN, [28, 150, 450, 1000, 1200, 1400]),
            new Railroad("Short Line"),
            new Tile("Chance"),
            new ColoredProperty("Park Place", 350, PropertyGroupId.DARKBLUE, [35, 175, 500, 1100, 1300, 1500]),
            new Tile("Luxury Tax | $100"),
            new ColoredProperty("Boardwalk", 400, PropertyGroupId.DARKBLUE, [50, 200, 600, 1400, 1700, 2000])
        ];
    }
}

export class Tile {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    export(other?: any): any {
        let out: any = {
            name: this.name,
            TileType: "Tile"
        };

        if (other)
            for (let key in other)
                out[key] = other[key];

        return out;
    }
}

export abstract class Property extends Tile {
    price: number;
    groupId: PropertyGroupId;
    owner: string;

    protected constructor(name: string, price: number, groupId: PropertyGroupId) {
        super(name);
        this.price = price;
        this.groupId = groupId;
        this.owner = "";
    }

    abstract getRent(...args: any): number;

    getOwner(): string {
        return this.owner;
    }

    setOwner(newOwner: string): void {
        this.owner = newOwner;
    }

    getPrice(): number {
        return this.price;
    }

    getGroupId(): number {
        return this.groupId;
    }

    export(other?: any): any {
        let out: any = super.export({
            groupId: this.groupId,
            price: this.price,
            owner: this.owner,
            TileType: "Property"
        });
        if (other)
            for (let key in other)
                out[key] = other[key];
        return out;
    }
}

export class ColoredProperty extends Property {
    rents: Array<number>;
    houses: number;

    constructor(name: string, price: number, color: PropertyGroupId, rents: Array<number>) {
        super(name, price, color);
        this.rents = rents;
        this.houses = 0;
    }

    getRent(): number {
        return this.rents[this.houses];
    }

    getHouses(): number {
        return this.houses;
    }

    export(): any {
        return super.export({
            rents: this.rents,
            houses: this.houses,
            TileType: "ColoredProperty"
        });
    }
}

export class Utility extends Property {
    constructor(name: string) {
        super(name, 150, PropertyGroupId.UTILITY);
    }

    getRent(roll: number, ownedCount: number): number {
        if (ownedCount == 2)
            return 10 * roll;
        else
            return 4 * roll;
    }

    export(): any {
        return super.export({
            TileType: "Utility"
        });
    }
}

export class Railroad extends Property {
    constructor(name: string) {
        super(name, 200, PropertyGroupId.RAILROAD);
    }

    getRent(ownedCount: number): number {
        if (ownedCount == 1)
            return 25;
        else if (ownedCount == 2)
            return 50;
        else if (ownedCount == 3)
            return 100;
        else if (ownedCount == 4)
            return 200;
        else
            return 0;
    }

    export(): any {
        return super.export({
            TileType: "Railroad"
        });
    }
}

export class PropertyGroup {
    private readonly groupId: PropertyGroupId;
    private readonly properties: Array<Property>;

    constructor(groupId: PropertyGroupId) {
        this.groupId = groupId;
        this.properties = [];
    }

    addProperty(prop: Property): void {
        this.properties.push(prop);
    }

    getGroupId(): PropertyGroupId {
        return this.groupId;
    }

    getProperties(): Array<Property> {
        return this.properties;
    }

    export(): any {
        return {
            groupId: this.groupId,
            properties: this.properties.map((prop: Property): any => {
                return prop.export()
            })
        };
    }
}

export enum PropertyGroupId {
    BROWN, LIGHTBLUE, PINK, ORANGE, RED, YELLOW, GREEN, DARKBLUE, UTILITY, RAILROAD
}