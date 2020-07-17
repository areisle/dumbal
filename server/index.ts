import express from 'express';
import { Server } from 'http';
import IORedis from 'ioredis';
import path from 'path';
import socketio from 'socket.io';

import {
    SERVER_EVENTS,
    USER_EVENTS,
} from '../src/types';
import { Game } from './game';
import { TypesafeSocket } from './TypedSocket';

const app = express();
const http = new Server(app);
const io = socketio(http);

const connect = async () => {
    const redis = new IORedis(process.env.REDIS_URL);
    try {
        await redis.connect();
    } catch (err) {
        // throws an error if redis is already connecting
    }
    return redis;
};

app.use(express.static(path.join(__dirname, '../../build')));

app.get('*', (_, res) => {
    const filePath = path.join(__dirname, '../../build/index.html');
    res.sendFile(filePath);
});

const server = async ({ port = 3000 }: { port: string | number }) => {
    const redis = await connect();

    await http.listen(port);
    console.log(`listening on localhost:${port}`);
    // WARNING: app.listen(80) will NOT work here!

    app.get('/', (_req, res) => {
        res.sendFile(`${__dirname}/tester.html`);
    });

    io.on('connection', (unwrappedSocket) => {
        // socket, but typed with some extra sugar
        const socket = new TypesafeSocket(redis, io, unwrappedSocket);

        socket.on(USER_EVENTS.CREATE_GAME, async (callback) => {
            const game = await Game.create(redis);
            callback?.(game.id);
        });

        socket.onPlayerEvent(USER_EVENTS.JOIN_GAME, async (game, player, callback) => {
            await player.join(socket.id);
            socket.join(game.id);
            const players = await game.getPlayers();
            callback?.({ playerId: player.id, players });
            socket.emitTo(game.id, SERVER_EVENTS.PLAYERS_CHANGED, players);
        });

        socket.on(USER_EVENTS.START_GAME, async (gameId) => {
            const game = new Game(redis, gameId);
            const {
                activePlayer,
                stage,
                cardsByPlayerId,
                roundNumber,
                cardCounts,
            } = await game.start();

            socket.emitToEachPlayer(gameId, SERVER_EVENTS.ROUND_STARTED, (pId) => ({
                activePlayer,
                roundNumber,
                stage,
                cards: cardsByPlayerId[pId],
                cardCounts,
            }));
        });

        socket.onPlayerEvent(USER_EVENTS.PICK_CARD_FROM_DECK, async (game, player, callback) => {
            const card = await player.drawFromDeck();
            callback?.(card);
            const response = await game.startNextTurn();
            const cards = await player.getCards();
            socket.emitTo(game.id, SERVER_EVENTS.CARD_PICKED_FROM_DECK, { playerId: player.id, count: cards.length });
            socket.emitTo(game.id, SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, response);
        });

        socket.onPlayerEvent(USER_EVENTS.PICK_CARD_FROM_DISCARD, async (game, player, card, callback) => {
            await player.drawFromDiscard(card);
            callback?.(card);
            const response = await game.startNextTurn();
            const cards = await player.getCards();
            socket.emitTo(game.id, SERVER_EVENTS.CARD_PICKED_FROM_DISCARD, { playerId: player.id, card, count: cards.length });
            socket.emitTo(game.id, SERVER_EVENTS.ACTIVE_PLAYER_CHANGED, response);
        });

        socket.onPlayerEvent(USER_EVENTS.PLAY_CARDS, async (game, player, cards) => {
            const response = await player.playCards(cards);
            socket.emitTo(game.id, SERVER_EVENTS.CARDS_PLAYED, response);
        });

        socket.onPlayerEvent(USER_EVENTS.GET_STATE, async (_, player, callback) => {
            const state = await player.getGameState();
            callback?.(state);
        });

        socket.onPlayerEvent(USER_EVENTS.REJOIN_GAME, async (game, player, callback) => {
            const state = await player.rejoin(socket.id);
            socket.join(game.id);
            callback?.(state);
        });

        socket.onGameEvent(USER_EVENTS.GET_PLAYERS, async (game, callback) => {
            const state = await game.getPlayers();
            callback?.(state);
        });

        socket.onPlayerEvent(USER_EVENTS.END_ROUND, async (game, player) => {
            const response = await player.endRound();
            socket.emitTo(game.id, SERVER_EVENTS.ROUND_COMPLETE, response);
        });

        socket.onPlayerEvent(USER_EVENTS.READY_FOR_NEXT_ROUND, async (game, player) => {
            const allPlayersReady = await player.ready();
            socket.emitTo(game.id, SERVER_EVENTS.PLAYER_READY, player.id);

            if (allPlayersReady) {
                const {
                    activePlayer,
                    roundNumber,
                    stage,
                    cardsByPlayerId,
                    cardCounts,
                } = await game.startNextRound();

                socket.emitToEachPlayer(game.id, SERVER_EVENTS.ROUND_STARTED, (pId) => ({
                    activePlayer,
                    roundNumber,
                    stage,
                    cards: cardsByPlayerId[pId],
                    cardCounts,
                }));
            }
        });
    });

    return {
        db: redis,
        close: () => {
            http.close();
            redis.quit();
        },
    };
};

export {
    server,
};
