import {
    ClientCallbackParams,
    GAME_STAGE,
    GameId,
    GameState,
    PlayerId,
    SERVER_EVENTS,
    ServerEventParams,
    USER_EVENTS,
} from '../types';
import { getPreviousPlayer, removeCards } from '../utilities';

function createReducer<S>(
    handlers: Partial<Record<string, (state: S, args: any) => S>>,
) {
    return (state: S, currAction: { type: string; payload?: any }) => {
        const handler = handlers[currAction.type];
        if (handler) {
            return (handler(state, currAction.payload));
        }
        return state;
    };
}

const initialState: GameState = {
    players: [],
    cards: [],
    scores: [],
    roundNumber: 0,
    roundEndedBy: null,
    ready: {},
    stage: GAME_STAGE.SETTING_UP,
    playerId: null,
    activePlayer: null,
    gameId: (new URLSearchParams(window.location.search)).get('game'),
    roundLeader: null,
    discard: {},
    out: [],
};

type Handlers = Omit<(
    { [P in SERVER_EVENTS]: (state: GameState, params: ServerEventParams[P]) => GameState } &
    { [P in keyof ClientCallbackParams]: (state: GameState, params: ClientCallbackParams[P]) => GameState }
), SERVER_EVENTS.ERROR>;

const handlers: Handlers = {
    [SERVER_EVENTS.ACTIVE_PLAYER_CHANGED]: (state, params) => ({
        ...state,
        ...params,
    }),
    [SERVER_EVENTS.PLAYERS_CHANGED]: (state, players) => ({
        ...state,
        players,
    }),
    [SERVER_EVENTS.CARD_PICKED_FROM_DISCARD]: (state, params) => {
        const { activePlayer, players, discard } = state;
        const prevPlayer = getPreviousPlayer(players, activePlayer);
        return {
            ...state,
            discard: {
                ...discard,
                [prevPlayer]: removeCards(discard[prevPlayer], [params.card]),
            },
        };
    },
    /**
     * @todo this may actually not need any state
     */
    [SERVER_EVENTS.CARD_PICKED_FROM_DECK]: (state, _params) => state,
    [SERVER_EVENTS.ROUND_COMPLETE]: (state, params) => {
        const { scores, ...rest } = params;
        return {
            ...state,
            ...rest,
            scores: [...state.scores, scores],
            cards: [],
        };
    },
    [SERVER_EVENTS.CARDS_PLAYED]: (state, params) => {
        const { cards, playerId, stage } = params;
        // add cards played to users discard
        let {
            cards: playerCards,
        } = state;
        if (playerId === state.playerId) {
            playerCards = removeCards(playerCards, cards);
        }

        return {
            ...state,
            stage,
            discard: {
                ...state.discard,
                [playerId]: cards,
            },
            cards: playerCards,
        };
    },
    [SERVER_EVENTS.ROUND_STARTED]: (state, params) => ({
        ...state,
        ...params,
        discard: {},
        roundEndedBy: null,
        ready: {},
    }),
    [SERVER_EVENTS.PLAYER_READY]: (state, playerId) => ({
        ...state,
        ready: {
            ...state.ready,
            [playerId]: true,
        },
    }),
    [SERVER_EVENTS.GAME_COMPLETE]: (state) => ({
        ...state,
        stage: GAME_STAGE.COMPLETE,
    }),
    [USER_EVENTS.REJOIN_GAME]: (state, gameState) => ({
        ...state,
        ...gameState,
    }),
    [USER_EVENTS.CREATE_GAME]: (state, gameId: GameId) => ({
        ...state,
        gameId,
    }),
    [USER_EVENTS.JOIN_GAME]: (state, { playerId, players }) => ({
        ...state,
        playerId,
        players,
    }),
    [USER_EVENTS.GET_STATE]: (_, nextState: GameState) => nextState,
    [USER_EVENTS.GET_PLAYERS]: (state, players: PlayerId[]) => ({
        ...state,
        players,
    }),
    /**
     * @todo
     */
    [USER_EVENTS.PICK_CARD_FROM_DECK]: (state, card) => {
        const { cards } = state;
        return {
            ...state,
            cards: [...cards, card],
        };
    },
    /**
     * @todo
     */
    [USER_EVENTS.PICK_CARD_FROM_DISCARD]: (state, card) => {
        const { cards } = state;
        return {
            ...state,
            cards: [...cards, card],
        };
    },
};

function logger<T extends(...args: any) => any = any>(func: T): typeof func {
    return ((...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(...args);
        }
        return func(...args);
    }) as unknown as typeof func;
}

const gameReducer = createReducer<GameState>(handlers);

export {
    gameReducer,
    initialState,
    logger,
};
