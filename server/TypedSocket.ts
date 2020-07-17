/* eslint-disable no-empty-function */
import { Redis } from 'ioredis';
import { List } from 'ts-toolbelt';

import {
    ClientEventParams, GameId,
    PlayerId,
    SERVER_EVENTS, ServerEventParams, USER_EVENTS,
} from '../src/types';
import { NotFound } from './errors';
import { Game } from './game';
import { Player } from './player';

const formatErr = (e: Error) => ({
    type: e.constructor.name,
    message: e.message,
});

/**
 * removes first type from the array of types
 */
type Shift<T extends any[]> = ((...t: T)=>void) extends ((h: any, ...r: infer R)=>void) ? R : never;

type Push<T extends any[], I> = List.Append<T, I>;

class TypesafeSocket {
    constructor(
        private redis: Redis,
        private io: SocketIO.Server,
        private socket: SocketIO.Socket,
    ) {}

    on<T extends USER_EVENTS>(
        eventName: T,
        handler: (...params: ClientEventParams[T]) => Promise<void>,
    ) {
        this.socket.on(eventName, async (...args) => {
            try {
                await handler(...args as ClientEventParams[T]);
            } catch (e) {
                this.socket.emit(SERVER_EVENTS.ERROR, formatErr(e));
            }
        });
        return this.socket;
    }

    emit<T extends SERVER_EVENTS>(event: T, params: ServerEventParams[T]) {
        return this.socket.emit(event, params);
    }

    emitTo<T extends SERVER_EVENTS>(to: string, event: T, params: ServerEventParams[T]) {
        return this.io.to(to).emit(event, params);
    }

    join(gameId: GameId) {
        return this.socket.join(gameId);
    }

    get id() {
        return this.socket.id;
    }

    /**
     * emmitter that allows different things to be
     * sent to each player (ex. cards)
     */
    async emitToEachPlayer<T extends SERVER_EVENTS>(gameId: GameId, event: T, handler: (player: PlayerId) => ServerEventParams[T]) {
        const game = new Game(this.redis, gameId);
        const socketsByPlayerId = await game.db.getSocketsForPlayers();

        for (const nextPlayerId of Object.keys(socketsByPlayerId)) {
            const socketId = socketsByPlayerId[nextPlayerId];
            if (!socketId) {
                throw new NotFound(`cannot find socket for player: ${nextPlayerId}`);
            }
            const data = handler(nextPlayerId);
            this.emitTo(socketId, event, data);
        }
    }

    onPlayerEvent<T extends USER_EVENTS>(
        eventName: T,
        handler: (game: Game, player: Player, ...args: Shift<Shift<ClientEventParams[T]>>) => Promise<void>,
    ) {
        this.socket.on(eventName, async (gameId: GameId, playerId: PlayerId, ...args) => {
            const game = new Game(this.redis, gameId);
            const player = game.getPlayer(playerId);
            try {
                await handler(game, player, ...args as Shift<Shift<ClientEventParams[T]>>);
            } catch (e) {
                this.socket.emit(SERVER_EVENTS.ERROR, formatErr(e));
            }
        });
        return this.socket;
    }

    onGameEvent<T extends USER_EVENTS>(
        eventName: T,
        handler: (game: Game, ...args: Shift<ClientEventParams[T]>) => Promise<void>,
    ) {
        this.socket.on(eventName, async (gameId: GameId, ...args) => {
            const game = new Game(this.redis, gameId);
            try {
                await handler(game, ...args as Shift<ClientEventParams[T]>);
            } catch (e) {
                this.socket.emit(SERVER_EVENTS.ERROR, formatErr(e));
            }
        });
        return this.socket;
    }
}

export {
    TypesafeSocket,
};
