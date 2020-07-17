/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { useSnackbar } from 'notistack';
import React, {
    useCallback,
    useEffect, useMemo, useState,
} from 'react';
import * as io from 'socket.io-client';

import {
    API, ClientEventParams,
    GameId, PlayerId, SERVER_EVENTS, ServerEventParams,
    Shift,
    USER_EVENTS,
} from '../types';
import { getCardName } from '../utilities';

const setQueryStringParam = (key: string, value: unknown) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, String(value));
    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    // eslint-disable-next-line no-restricted-globals
    history.pushState(null, '', newRelativePathQuery);
};

const storage = process.env.NODE_ENV === 'development' ? sessionStorage : localStorage;

const getPlayerId = (gameId: string) => storage.getItem(`game-${gameId}`);

const setPlayerId = (gameId: string | null, playerId: PlayerId) => {
    storage.setItem(`game-${gameId}`, playerId);
};

type Params<T> = T extends SERVER_EVENTS ? ServerEventParams[T] : any;

function useSocket(
    gameId: GameId | null,
    playerId: PlayerId | null,
    dispatch: any,
) {
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const on = useCallback(function<T extends SERVER_EVENTS | 'disconnect' | 'error'> (eventName: T, handler?: (params: Params<T>) => Promise<void> | void) {
        if (!socket) { return; }
        socket.on(eventName, (params: any) => {
            dispatch({
                type: eventName,
                payload: params,
            });
            handler?.(params);
        });
    }, [dispatch, socket]);

    const emit = useCallback(function<T extends USER_EVENTS> (eventName: T, ...args: ClientEventParams[T]) {
        if (!socket) { return; }
        const lastArg = args.slice(-1)[0];
        if (typeof lastArg !== 'function') {
            socket.emit(eventName, ...args, (params: any) => {
                dispatch({
                    type: eventName,
                    payload: params,
                });
            });
        } else {
            socket.emit(eventName, ...args.slice(0, -1), (params: any) => {
                dispatch({
                    type: eventName,
                    payload: params,
                });
                (lastArg as Function)(params);
            });
        }
    }, [dispatch, socket]);

    const emitForPlayer = useCallback(function<T extends USER_EVENTS> (eventName: T, ...args: Shift<Shift<ClientEventParams[T]>>) {
        if (!gameId || !playerId) { return; }
        const extendedArgs = [gameId, playerId, ...args] as ClientEventParams[T];
        emit(eventName, ...extendedArgs);
    }, [emit, gameId, playerId]);

    const emitForGame = useCallback(function<T extends USER_EVENTS> (eventName: T, ...args: Shift<ClientEventParams[T]>) {
        if (!gameId) { return; }
        const extendedArgs = [gameId, ...args] as ClientEventParams[T];
        emit(eventName, ...extendedArgs);
    }, [emit, gameId]);

    const modifiedSocket = useMemo(() => ({
        on,
        emit,
        emitForPlayer,
        emitForGame,
        connect: () => {
            socket?.connect();
        },
        removeAllListeners: () => {
            socket?.removeAllListeners();
        },
    }), [emit, emitForGame, emitForPlayer, on, socket]);

    useEffect(() => {
        const nextSocket = io.connect(API);

        setSocket(nextSocket);

        return () => {
            nextSocket.removeAllListeners();
            nextSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        modifiedSocket.on(SERVER_EVENTS.ACTIVE_PLAYER_CHANGED);

        modifiedSocket.on(SERVER_EVENTS.CARDS_PLAYED);

        modifiedSocket.on(SERVER_EVENTS.PLAYERS_CHANGED);

        modifiedSocket.on(SERVER_EVENTS.ROUND_STARTED);

        modifiedSocket.on(SERVER_EVENTS.ROUND_COMPLETE);

        modifiedSocket.on(SERVER_EVENTS.PLAYER_READY);

        modifiedSocket.on(SERVER_EVENTS.GAME_COMPLETE);

        modifiedSocket.on(SERVER_EVENTS.PLAYER_READY);

        modifiedSocket.on(SERVER_EVENTS.ERROR, (error) => {
            enqueueSnackbar(error.message, { variant: 'error' });
        });

        modifiedSocket.on(SERVER_EVENTS.CARD_PICKED_FROM_DECK, (params) => {
            if (params.playerId !== playerId) {
                enqueueSnackbar(`${params.playerId} drew a card from the deck.`);
            }
        });

        modifiedSocket.on(SERVER_EVENTS.CARD_PICKED_FROM_DISCARD, (params) => {
            if (params.playerId !== playerId) {
                enqueueSnackbar(`${params.playerId} took the ${getCardName(params.card)} from the discard.`);
            }
        });

        modifiedSocket.on('disconnect', (reason: string) => {
            if (['io server disconnect', 'ping timeout'].includes(reason)) {
                modifiedSocket.connect();
            }
        });

        modifiedSocket.on('error', (e: unknown) => {
            enqueueSnackbar(String(e), { variant: 'error' });
        });

        return () => {
            modifiedSocket.removeAllListeners();
        };
    }, [dispatch, modifiedSocket, playerId, enqueueSnackbar]);

    useEffect(() => {
        if (gameId && playerId) {
            setPlayerId(gameId, playerId);
            return;
        }
        if (playerId || !gameId) { return; }
        const storedPlayerId = getPlayerId(gameId);
        if (!storedPlayerId) { return; }
        modifiedSocket.emit(USER_EVENTS.REJOIN_GAME, gameId, storedPlayerId);
    }, [dispatch, gameId, modifiedSocket, playerId]);

    useEffect(() => {
        if (!gameId) { return; }
        setQueryStringParam('game', gameId);
        modifiedSocket.emit(USER_EVENTS.GET_PLAYERS, gameId);
    }, [dispatch, gameId, modifiedSocket]);

    return modifiedSocket;
}

export {
    useSocket,
};
