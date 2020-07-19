/* eslint-disable no-await-in-loop */
import getPort from 'get-port';
import { Redis } from 'ioredis';
import ioClient from 'socket.io-client';

import { server as createServer } from '..';
import {
    GAME_STAGE, GameState, PlayerId,
    SERVER_EVENTS, SUIT,
    USER_EVENTS,
} from '../../src/types';
import { NotEnoughPlayers } from '../errors';
import { Game } from '../game';

interface Client {
    emit: (e: USER_EVENTS, ...args: any[]) => Promise<any>;
    on: (e: SERVER_EVENTS) => Promise<any> | any;
    socket: SocketIOClient.Socket;
}

let port: number;
let clients: Record<PlayerId, Client>;
let server: { db: Redis; close(): void };

const getClient = async (): Promise<Client> => {
    const socket = ioClient.connect(`http://localhost:${port}`);

    const nextClient = {
        emit: (eventName: USER_EVENTS, ...args: any[]) => new Promise((resolve) => {
            socket.emit(eventName, ...args, resolve);
        }),
        on: (eventName: SERVER_EVENTS) => new Promise((resolve) => {
            console.log('setting up for event', eventName);
            socket.on(eventName, (...args: unknown[]) => {
                console.log('emmiting event?', eventName, args);
                resolve(...args);
            });
        }),
        socket,
    };

    await new Promise((resolve) => {
        socket.on('connect', () => {
            resolve();
        });
    });

    return nextClient;
};

beforeAll(async () => {
    port = await getPort();
    server = await createServer({ port });
});

afterAll(() => {
    server.close();
});

beforeEach(async () => {
    clients = {}; // in case not set elswwhere
});

afterEach(() => {
    Object.values(clients).forEach((nextClient) => {
        nextClient.socket.removeAllListeners();
        nextClient.socket.close();
    });
});

const newGameWithPlayers = async (players: string[], dontStart = false) => {
    const nextClients: Record<PlayerId, Client> = {};
    // get sockets
    for (const playerId of players) {
        nextClients[playerId] = await getClient();
    }
    const client = nextClients[players[0]];
    const nextGameId = await client.emit(USER_EVENTS.CREATE_GAME);
    // add everybody to game
    for (const playerId of players) {
        await nextClients[playerId].emit(USER_EVENTS.JOIN_GAME, nextGameId, playerId);
    }

    if (!dontStart) {
        const waitFor = Object.values(nextClients).map((nextClient) => nextClient.on(SERVER_EVENTS.ROUND_STARTED));
        client.emit(USER_EVENTS.START_GAME, nextGameId);
        await Promise.all(waitFor);
    }

    return {
        clients: nextClients,
        gameId: nextGameId,
    };
};

describe('creating a game', () => {
    let client: Client;

    beforeEach(async () => {
        clients.any = await getClient();
        client = clients.any;
    });

    it('should return gameId when creating a new game', async () => {
        const gameId = await client.emit(USER_EVENTS.CREATE_GAME);
        expect(gameId).toBeTruthy();
        expect(typeof gameId).toBe('string');
    });

    it('should create different gameId for every new game', async () => {
        const gameId1 = await client.emit(USER_EVENTS.CREATE_GAME);
        const gameId2 = await client.emit(USER_EVENTS.CREATE_GAME);
        expect(gameId1).not.toEqual(gameId2);
        await new Game(server.db, gameId1).db.deleteGame();
        await new Game(server.db, gameId2).db.deleteGame();
    });
});

describe(GAME_STAGE.SETTING_UP, () => {
    let gameId: string;
    let game: Game;
    let client: Client;

    beforeEach(async () => {
        clients.any = await getClient();
        client = clients.any;
        gameId = await client.emit(USER_EVENTS.CREATE_GAME);
        game = new Game(server.db, gameId);
    });

    afterEach(async () => {
        await game.db.deleteGame();
    });

    it('should let all the players know when a new player joins', async () => {
        const newPlayersPromise = client.on(SERVER_EVENTS.PLAYERS_CHANGED);

        await client.emit(USER_EVENTS.JOIN_GAME, gameId, 'areisle');
        const newPlayers = await newPlayersPromise;
        expect(newPlayers).toEqual(['areisle']);
    });

    it('should not allow game to be started with less than 2 players', async () => {
        const errorPromise = client.on(SERVER_EVENTS.ERROR);
        await client.emit(USER_EVENTS.JOIN_GAME, gameId, 'areisle');
        client.emit(USER_EVENTS.START_GAME, gameId);
        const error = await errorPromise;
        expect(error.type).toEqual(NotEnoughPlayers.name);
    });

    it('should allow game to be started with 2 players', async () => {
        let response = client.on(SERVER_EVENTS.ROUND_STARTED);
        await client.emit(USER_EVENTS.JOIN_GAME, gameId, 'areisle');
        await client.emit(USER_EVENTS.JOIN_GAME, gameId, 'creisle');
        client.emit(USER_EVENTS.START_GAME, gameId);
        response = await response;
        expect(response.cards).toHaveLength(5);
        expect(response.stage).toEqual(GAME_STAGE.PLAYING_CARDS);
        expect(response.activePlayer).toEqual('creisle');
    });

    it('returns the current state of the game', async () => {
        await client.emit(USER_EVENTS.JOIN_GAME, gameId, 'areisle');
        await client.emit(USER_EVENTS.JOIN_GAME, gameId, 'creisle');

        const state = await client.emit(USER_EVENTS.GET_STATE, gameId, 'areisle');
        expect(state).toEqual(expect.objectContaining({
            players: [
                'areisle',
                'creisle',
            ],
            roundNumber: null,
            scores: [],
            stage: GAME_STAGE.SETTING_UP,
            cards: [],
            ready: {
                areisle: null,
                creisle: null,
            },
            roundEndedBy: null,
            activePlayer: null,
            roundLeader: null,
            playerId: 'areisle',
            gameId,
            discard: {
                areisle: [],
                creisle: [],
            },
        }));
    });
});

describe(GAME_STAGE.PLAYING_CARDS, () => {
    let gameId: string;
    let game: Game;

    beforeEach(async () => {
        ({ clients, gameId } = await newGameWithPlayers(['areisle', 'creisle']));
        game = new Game(server.db, gameId);
    });

    afterEach(async () => {
        await game.db.deleteGame();
    });

    it('starts with state', async () => {
        const state = await clients.areisle.emit(USER_EVENTS.GET_STATE, gameId, 'areisle');
        expect(state).toEqual(expect.objectContaining({
            players: [
                'areisle',
                'creisle',
            ],
            roundNumber: 0,
            scores: [],
            stage: GAME_STAGE.PLAYING_CARDS,
            ready: {
                areisle: false,
                creisle: false,
            },
            roundEndedBy: null,
            activePlayer: 'creisle',
            roundLeader: 'creisle',
            playerId: 'areisle',
            gameId,
            discard: {
                areisle: [],
                creisle: [],
            },
        }));
    });

    it('should not allow player to pick card before playing', async () => {
        const stateBefore = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        const response = clients.creisle.on(SERVER_EVENTS.ERROR);
        clients.creisle.emit(USER_EVENTS.PICK_CARD_FROM_DECK, gameId, 'creisle');
        await response;

        const stateAfter = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        expect(stateBefore).toEqual(stateAfter);
    });

    it('should allow player to play a single card', async () => {
        const stateBefore: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        const cardsToPlay = stateBefore.cards.slice(0, 1);

        let response = clients.areisle.on(SERVER_EVENTS.CARDS_PLAYED);
        let otherResponse = clients.creisle.on(SERVER_EVENTS.CARDS_PLAYED);
        clients.creisle.emit(USER_EVENTS.PLAY_CARDS, gameId, 'creisle', cardsToPlay);
        response = await response;
        otherResponse = await otherResponse;

        const stateAfter: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        // should remove the card from the players hand
        expect(stateBefore.cards.slice(1)).toEqual(stateAfter.cards);
        // should tell all players what was discards etc.
        expect(response).toEqual({
            cards: cardsToPlay,
            playerId: 'creisle',
            stage: GAME_STAGE.PICKING_CARD,
            count: 4,
        });
        expect(otherResponse).toEqual({
            cards: cardsToPlay,
            playerId: 'creisle',
            stage: GAME_STAGE.PICKING_CARD,
            count: 4,
        });
    });

    it('should not allow player to play cards that aren\'t in their card', async () => {
        const stateBefore: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        const cardsToPlay = [{ suit: SUIT.CLUBS, number: 14 }];

        const response = clients.creisle.on(SERVER_EVENTS.ERROR);
        clients.creisle.emit(USER_EVENTS.PLAY_CARDS, gameId, 'creisle', cardsToPlay);
        await response;

        const stateAfter: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        expect(stateBefore).toEqual(stateAfter);
    });

    it('should not allow player to play cards that are not a run or pair etc.', async () => {
        const player = game.getPlayer('creisle');
        const hand = [
            { number: 3, suit: SUIT.CLUBS },
            { number: 4, suit: SUIT.CLUBS },
            { number: 6, suit: SUIT.CLUBS },
            { number: 7, suit: SUIT.CLUBS },
        ];

        await game.db.setPlayerCards(player.playerId, hand);
        const stateBefore: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        expect(stateBefore.cards).toEqual(hand);

        const response = clients.creisle.on(SERVER_EVENTS.ERROR);
        clients.creisle.emit(USER_EVENTS.PLAY_CARDS, gameId, 'creisle', hand);
        await response;

        const stateAfter: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        expect(stateBefore).toEqual(stateAfter);
    });

    it('should not allow player to play runs of less than 3.', async () => {
        const player = game.getPlayer('creisle');
        const hand = [
            { number: 3, suit: SUIT.CLUBS },
            { number: 4, suit: SUIT.CLUBS },
        ];

        await player.db.setPlayerCards(player.playerId, hand);
        const stateBefore: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        expect(stateBefore.cards).toEqual(hand);

        const response = clients.creisle.on(SERVER_EVENTS.ERROR);
        clients.creisle.emit(USER_EVENTS.PLAY_CARDS, gameId, 'creisle', hand);
        await response;

        const stateAfter: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        expect(stateBefore).toEqual(stateAfter);
    });

    it('should allow player to play runs.', async () => {
        const player = game.getPlayer('creisle');
        const hand = [
            { number: 3, suit: SUIT.CLUBS },
            { number: 4, suit: SUIT.CLUBS },
            { number: 5, suit: SUIT.HEARTS },
        ];

        await player.db.setPlayerCards(player.playerId, hand);

        const response = clients.creisle.on(SERVER_EVENTS.CARDS_PLAYED);
        clients.creisle.emit(USER_EVENTS.PLAY_CARDS, gameId, 'creisle', hand);
        await response;

        const stateAfter: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        expect(stateAfter.cards).toEqual([]);
    });

    it('should allow player to play pairs.', async () => {
        const player = game.getPlayer('creisle');
        const hand = [
            { number: 3, suit: SUIT.CLUBS },
            { number: 3, suit: SUIT.HEARTS },
        ];

        await player.db.setPlayerCards(player.playerId, hand);

        const response = clients.creisle.on(SERVER_EVENTS.CARDS_PLAYED);
        clients.creisle.emit(USER_EVENTS.PLAY_CARDS, gameId, 'creisle', hand);
        await response;

        const stateAfter: GameState = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        expect(stateAfter).toEqual(expect.objectContaining({
            roundNumber: 0,
            scores: [],
            stage: GAME_STAGE.PICKING_CARD,
            ready: {
                areisle: false,
                creisle: false,
            },
            roundEndedBy: null,
            activePlayer: 'creisle',
            roundLeader: 'creisle',
            gameId,
            cards: [],
            discard: {
                areisle: [],
                creisle: hand,
            },
        }));
    });
});

describe(GAME_STAGE.PICKING_CARD, () => {
    let gameId: string;
    let game: Game;

    beforeEach(async () => {
        ({
            clients,
            gameId,
        } = await newGameWithPlayers(['areisle', 'creisle']));
        game = new Game(server.db, gameId);
        // state for after player has played
        game.setGameState({
            stage: GAME_STAGE.PICKING_CARD,
            activePlayer: 'creisle',
            roundLeader: 'creisle',
            cardsByPlayerId: {
                creisle: [],
                areisle: [],
            },
            discard: {
                areisle: [{ number: 3, suit: SUIT.HEARTS }, { number: 4, suit: SUIT.DIAMONDS }],
                creisle: [{ number: 12, suit: SUIT.HEARTS }],
            },
        });
    });

    it('should allow user to pick from pile', async () => {
        const waitForPlayerChange = clients.creisle.on(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED);

        const before = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        const card = await clients.creisle.emit(USER_EVENTS.PICK_CARD_FROM_DECK, gameId, 'creisle');

        const playerChange = await waitForPlayerChange;
        const after = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        expect(card).toHaveProperty('number');
        expect(card).toHaveProperty('suit');
        expect(playerChange).toEqual({
            activePlayer: 'areisle',
            stage: GAME_STAGE.PLAYING_CARDS,
        });
        expect([...before.cards, card]).toEqual(after.cards);
    });

    it('should allow user to pick from discard', async () => {
        const waitForPlayerChange = clients.creisle.on(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED);

        const before = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        const card = await clients.creisle.emit(USER_EVENTS.PICK_CARD_FROM_DISCARD, gameId, 'creisle', { number: 3, suit: SUIT.HEARTS });

        const playerChange = await waitForPlayerChange;
        const after = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        expect(card).toHaveProperty('number');
        expect(card).toHaveProperty('suit');
        expect(playerChange).toEqual({
            activePlayer: 'areisle',
            stage: GAME_STAGE.PLAYING_CARDS,
        });
        expect([...before.cards, card]).toEqual(after.cards);
    });

    it('should error if user tries to pick up card from disard that\'s not there', async () => {
        const waitFor = clients.creisle.on(SERVER_EVENTS.ERROR);

        const before = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');

        clients.creisle.emit(USER_EVENTS.PICK_CARD_FROM_DISCARD, gameId, 'creisle', { number: 11, suit: SUIT.HEARTS });

        await waitFor;
        const after = await clients.creisle.emit(USER_EVENTS.GET_STATE, gameId, 'creisle');
        expect(before).toEqual(after);
    });
});
