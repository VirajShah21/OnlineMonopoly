import express, {Express, NextFunction, Request, Response, Router} from "express";
import MonopolyGame, {DiceRoll} from "./monopoly/MonopolyGame";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import Player from "./monopoly/Player";
import {Property, Tile} from "./monopoly/MonopolyBoard";

const PORT: string = process.env.PORT || "3000";
const app: Express = express();

let games: Array<MonopolyGame> = [];

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const eventRouter: Router = Router();
const gameRouter: Router = Router();

function getIp(req: Request): string {
    let ip: string | string[] | undefined = req.headers['x-real-ip'] || req.connection.remoteAddress;
    return ip + "";
}

function cookieIdentity(req: Request): string {
    let ip: string = getIp(req);
    if (req.cookies.hasOwnProperty("gameId")) {
        let gameId: string = req.cookies.gameId;
        if (req.cookies.hasOwnProperty("playerId"))
            return `IP[${ip}] GAME[${gameId}] PLAYER[${req.cookies.playerId}]`;
        else
            return `IP[${ip}] GAME[${gameId}]`;
    } else {
        return `IP[${ip}]`;
    }
}

function logRequest(req: Request): void {
    console.log(`${cookieIdentity(req)} Entering ${req.path}`);
    console.log(JSON.stringify(req.query, null, 4));
}

function logResponse(req: Request, res: any): void {
    console.log(`${cookieIdentity(req)} Responding to ${req.path}`);
    console.log(JSON.stringify(res, null, 4));
}

app.use((req: Request, res: Response, next: NextFunction): void => {
    logRequest(req);
    next();
});

app.use("/event", eventRouter);
app.use("/game", gameRouter);


app.get("/", (req: Request, res: Response): void => {
    res.sendFile(path.join(__dirname, "public/html/startpage.html"));
});

gameRouter.get("/", (req: Request, res: Response): void => {
    res.sendFile(path.join(__dirname, "public/html/game.html"));
});

eventRouter.get("/join-game", (req: Request, res: Response): void => {
    let body: JoinGameQuery = req.query;
    let gameId: string = body.gameId;

    if (verifyGameId(gameId)) {
        let game: MonopolyGame = getGame(gameId);
        let player: Player = new Player(body.name);

        game.addPlayer(player);
        res.cookie("gameId", gameId);
        res.cookie("playerId", player.getId());
        res.send(new SimpleAPIResponse(true));
        logResponse(req, "true");
    } else {
        res.send(new MessageAPIResponse(false, `Game #${gameId} does not exist`));
        logResponse(req, "false");
    }
});

eventRouter.get("/new-game", (req: Request, res: Response): void => {
    let body: NewGameQuery = req.query;
    let gameId: string = MonopolyGame.generateGameId();
    let game: MonopolyGame = new MonopolyGame(gameId);
    let adminPlayer: Player = new Player(body.adminName);

    game.addPlayer(adminPlayer);
    games.push(game);

    res.cookie("gameId", game.getId());
    res.cookie("playerId", adminPlayer.getId());

    let response: NewGamePostResponse = new NewGamePostResponse(true, gameId, adminPlayer.getId());
    res.send(response.export());
    logResponse(req, response.export());
});

eventRouter.get("/turn-finished", (req: Request, res: Response): void => {
    if (req.cookies.hasOwnProperty("gameId") && req.cookies.hasOwnProperty("playerId")) {
        let gameId: string = req.cookies.gameId;
        let playerId: string = req.cookies.playerId;

        if (verifyGameId(gameId)) {
            if (verifyPlayerTurn(gameId, playerId)) {
                let currGame: MonopolyGame = getGame(gameId);
                currGame.setupNextTurn();
                res.send(new SimpleAPIResponse(true).export());
                logResponse(req, "true");
            } else {
                res.send(new MessageAPIResponse(false, `It is not Player#${playerId}'s turn`));
                logResponse(req, "Not this player's turn");
            }
        } else {
            res.send(new MessageAPIResponse(false, `No game matching the ID: ${gameId}`).export());
            logResponse(req, "Game doesn't exist");
        }
    } else {
        res.send(new MessageAPIResponse(false, "Either no game ID or player ID provided").export());
        logResponse(req, "Missing either gameId or or playerId cookie");
    }
});

eventRouter.get("/start-game", (req: Request, res: Response): void => {
    if (req.cookies.hasOwnProperty("gameId") && req.cookies.hasOwnProperty("playerId")) {
        let gameId: string = req.cookies.gameId;
        let playerId: string = req.cookies.playerId;

        if (verifyGameId(gameId)) {
            let game: MonopolyGame = getGame(gameId);
            if (game.getPlayers()[0].getId() == playerId) {
                game.initialize();
                res.send(new SimpleAPIResponse(true));
                logResponse(req, "success: true");
            } else {
                res.send(new MessageAPIResponse(false, "Only admin can start the game"));
                logResponse(req, "Only admin can start the game");
            }
        } else {
            res.send(new MessageAPIResponse(false, "The game does not exist"));
            logResponse(req, "The game does not exist");
        }
    }
});

eventRouter.get("/roll-dice", (req: Request, res: Response): void => {
    if (req.cookies.hasOwnProperty("gameId") && req.cookies.hasOwnProperty("playerId")) {
        let gameId: string = req.cookies.gameId;
        let playerId: string = req.cookies.playerId;

        if (verifyGameId(gameId)) {
            if (verifyPlayerTurn(gameId, playerId)) {
                let game: MonopolyGame = getGame(gameId);
                let player: Player | null = getPlayer(gameId, playerId);
                if (player) {
                    let roll: DiceRoll = game.rollDice();
                    let position: number = player.getPosition();
                    let response: DiceRollResponse = new DiceRollResponse(roll.getRoll1(), roll.getRoll2(), position, game.getBoard().tileAt(position));
                    res.send(response.export());
                    logResponse(req, response.export());
                } else {
                    res.send(new MessageAPIResponse(false, `Player#${playerId} does not exist`));
                    logResponse(req, "Player doesn't exist");
                }
            } else {
                res.send(new MessageAPIResponse(false, `It is not Player#${playerId}'s turn`).export());
                logResponse(req, "Not player's turn");
            }
        } else {
            res.send(new MessageAPIResponse(false, `No game matching the ID: ${gameId}`).export());
            logResponse(req, "Game doesn't exist");
        }
    } else {
        res.send(new SimpleAPIResponse(false).export());
        logResponse(req, "Missing cooke for either gameId or playerId");
    }
});

eventRouter.get("/purchase-property", (req: Request, res: Response): void => {
    if (req.cookies.hasOwnProperty("gameId") && req.cookies.hasOwnProperty("playerId")) {
        let gameId: string = req.cookies.gameId;
        let playerId: string = req.cookies.playerId;

        if (verifyGameId(gameId)) {
            if (verifyPlayerTurn(gameId, playerId)) {
                let game: MonopolyGame = getGame(gameId);
                let player: Player | null = getPlayer(gameId, playerId);
                if (player != null) {
                    let position: number = player.getPosition();
                    let tile: Tile = game.getBoard().tileAt(position);
                    if (tile instanceof Property) {
                        let prop: Property = tile as Property;
                        prop.setOwner(player.getId());
                        player.getPropertyManager().addProperty(prop);
                        res.send(new SimpleAPIResponse(true));
                        logResponse(req, "true");
                    } else {
                        res.send(new MessageAPIResponse(false, `${tile.getName()} is not a property`).export());
                        logResponse(req, "Tile is not a property");
                    }
                } else {
                    res.send(new MessageAPIResponse(false, `Player#${playerId} does not exist`).export());
                    logResponse(req, "Player doesn't exist");
                }
            } else {
                res.send(new MessageAPIResponse(false, `It is not Player#${playerId}'s turn`).export());
                logResponse(req, "Not player's turn");
            }
        } else {
            res.send(new MessageAPIResponse(false, `Could not find game with id: ${gameId}`).export());
            logResponse(req, "Game doesn't exist");
        }
    } else {
        res.send(new MessageAPIResponse(false, "No value provided for either gameId or playerId").export());
        logResponse(req, "Missing cookie for either gameId or playerId");
    }
});

gameRouter.get("/state", (req: Request, res: Response): void => {
    if (req.cookies.hasOwnProperty("gameId")) {
        let gameId: string = req.cookies.gameId;

        let response: any;

        if (verifyGameId(gameId))
            response = getGame(gameId).export();
        else
            response = new MessageAPIResponse(false, `No game #${gameId} exists`);

        res.send(response);
        logResponse(req, response.message ? "Game doesn't exist" : response);
    } else {
        res.send(new MessageAPIResponse(false, "No game id provided"));
        logResponse(req, "No gameId cookie was provided");
    }
});

function verifyGameId(gameId: string): boolean {
    return games.filter((game: MonopolyGame): boolean => {
        return game.getId() == gameId;
    }).length > 0;
}

function getGame(gameId: string): MonopolyGame {
    return games.filter((game: MonopolyGame) => {
        return game.getId() == gameId;
    })[0];
}

function verifyPlayerTurn(gameId: string, playerId: string): boolean {
    if (verifyGameId(gameId)) {
        let currGame: MonopolyGame = games.filter((currGame: MonopolyGame) => {
            return currGame.getId() == gameId
        })[0];

        return currGame.getPlayers()[currGame.getCurrPlayer()].getId() == playerId;
    } else {
        return false;
    }
}

function getPlayer(gameId: string, playerId: string): Player | null {
    let game: MonopolyGame = getGame(gameId);
    let players: Array<Player> = game.getPlayers();
    for (let i: number = 0; i < players.length; i++)
        if (players[i].getId() == playerId)
            return players[i];
    return null;
}

app.listen(PORT, (): void => {
    console.log(`Listening on PORT: ${PORT}`);
});

interface NewGameQuery {
    adminName: string;
}

interface JoinGameQuery {
    name: string;
    gameId: string;
}

class SimpleAPIResponse {
    success: boolean;

    constructor(success: boolean) {
        this.success = success;
    }

    export(otherProperties?: any): any {
        let out: any = {
            success: this.success
        };

        if (otherProperties)
            for (let key in otherProperties)
                if (otherProperties.hasOwnProperty(key))
                    out[key] = otherProperties[key];

        return out;
    }
}

class MessageAPIResponse extends SimpleAPIResponse {
    message: string;

    constructor(success: boolean, message: string) {
        super(success);
        this.message = message;
    }

    export(): any {
        return super.export({
            message: this.message
        });
    }
}

class DiceRollResponse extends SimpleAPIResponse {
    roll1: number;
    roll2: number;
    position: number;
    tile: Tile;

    constructor(roll1: number, roll2: number, position: number, tile: Tile) {
        super(true);
        this.roll1 = roll1;
        this.roll2 = roll2;
        this.position = position;
        this.tile = tile;
    }

    export(): any {
        return super.export({
            roll1: this.roll1,
            roll2: this.roll2,
            position: this.position,
            tile: this.tile.export()
        });
    }
}

class NewGamePostResponse extends SimpleAPIResponse {
    gameId: string;
    playerId: string;

    constructor(success: boolean, gameId: string, playerId: string) {
        super(success);
        this.gameId = gameId;
        this.playerId = playerId;
    }

    export(): any {
        return super.export({
            gameId: this.gameId,
            playerId: this.playerId
        });
    }
}