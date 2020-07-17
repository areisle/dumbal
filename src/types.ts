import { List } from 'ts-toolbelt';

export const API = process.env.REACT_APP_API as string;

export enum SUIT {
    HEARTS = 'Hearts',
    DIAMONDS = 'Diamonds',
    SPADES = 'Spades',
    CLUBS = 'Clubs',
}

export const MAX_NUMBER_OF_PLAYERS = 6;
export const MIN_NUMBER_OF_PLAYERS = 2;
export const MAX_NUMBER_OF_POINTS = 50;

export type GameId = string;

/**
 * username of the player
 */
export type PlayerId = string;

export const TOTAL_CARDS = 52;

export interface Card {
    /**
     * the suit of the card
     */
    suit: SUIT;
    /**
     * the number of the card within the suit.
     *
     * A king would be 13, ace is 1
     */
    number: number;
}

export enum GAME_STAGE {
    SETTING_UP = 'Setting Up',
    PLAYING_CARDS = 'Playing Cards',
    PICKING_CARD = 'Picking Card',
    BETWEEN_ROUNDS = 'Round Done',
    COMPLETE = 'Game Complete',
}

export interface GameState {
    /**
     * the usernames of players where index is players position
     */
    players: PlayerId[];
    /**
     * scores per round where index is roundNumber
     */
    scores: Record<PlayerId, number>[];
    roundNumber: number | null;
    stage: GAME_STAGE;
    cards: Card[];
    /**
     * says whether all the players are ready for the
     * next round to be dealt
     */
    ready: Record<PlayerId, boolean | null>;
    roundEndedBy: PlayerId | null;
    playerId: PlayerId | null;
    roundLeader: PlayerId | null;
    activePlayer: PlayerId | null;
    gameId: string | null;
    /**
     * the most recently discarded cards by playerId
     */
    discard: Record<PlayerId, Card[]>;
    out: PlayerId[];
}

export enum USER_EVENTS {
    /**
     * creates a new game
     */
    CREATE_GAME = 'create-game',
    /**
     * get list of players for the game
     */
    GET_PLAYERS = 'get-users',
    /**
     * get full state for game
     */
    GET_STATE = 'get-state',
    /**
     * join an existing game
     */
    JOIN_GAME = 'join-game',
    /**
     * play cards from hand
     */
    PLAY_CARDS = 'play-cards',
    /**
     * pick card from deck
     */
    PICK_CARD_FROM_DECK = 'pick-card-from-deck',
    /**
     * pick card from  discard
     */
    PICK_CARD_FROM_DISCARD = 'pick-card-from-discard',
    /**
     * request to end round
     */
    END_ROUND = 'end-round',
    READY_FOR_NEXT_ROUND = 'ready-for-next-round',
    REJOIN_GAME = 'rejoin-game',
    /**
     * start the game (once all players have joined)
     */
    START_GAME = 'start-game',
}

export enum SERVER_EVENTS {
    ACTIVE_PLAYER_CHANGED = 'active-user-changed',
    CARDS_PLAYED = 'cards-played',
    CARD_PICKED_FROM_DISCARD = 'card-picked-from-discard',
    CARD_PICKED_FROM_DECK = 'card-picked-from-deck',
    ERROR = 'custom-error',
    PLAYER_READY = 'player-ready',
    PLAYERS_CHANGED = 'users-changed',
    ROUND_STARTED = 'round-started',
    ROUND_COMPLETE = 'round-complete',
    GAME_COMPLETE = 'game-complete',
}

export type EventCallbackParams = {
    [USER_EVENTS.CREATE_GAME]: GameId;
    [USER_EVENTS.GET_STATE]: GameState;
    [USER_EVENTS.GET_PLAYERS]: PlayerId[];
    [USER_EVENTS.JOIN_GAME]: PlayerId;
}

export type ServerEventParams = {
    [SERVER_EVENTS.ACTIVE_PLAYER_CHANGED]: {
        activePlayer: PlayerId;
        stage: GAME_STAGE;
    };
    [SERVER_EVENTS.CARDS_PLAYED]: {
        playerId: PlayerId;
        cards: Card[];
        stage: GAME_STAGE.PICKING_CARD;
    };
    [SERVER_EVENTS.CARD_PICKED_FROM_DISCARD]: {
        playerId: PlayerId;
        card: Card;
    };
    [SERVER_EVENTS.CARD_PICKED_FROM_DECK]: {
        playerId: PlayerId;
    };
    [SERVER_EVENTS.ERROR]: {
        type: string;
        message: string,
    };
    [SERVER_EVENTS.GAME_COMPLETE]: unknown;
    [SERVER_EVENTS.PLAYERS_CHANGED]: PlayerId[];
    [SERVER_EVENTS.PLAYER_READY]: PlayerId;
    [SERVER_EVENTS.ROUND_COMPLETE]: {
        roundEndedBy: PlayerId;
        scores: GameState['scores'][number];
        discard: GameState['discard'],
        stage: GAME_STAGE,
        out: PlayerId[];
    };
    [SERVER_EVENTS.ROUND_STARTED]: {
        roundNumber: number;
        activePlayer: PlayerId;
        cards: Card[];
        stage: GAME_STAGE;
    };
}

export type ClientCallbackParams = {
    [USER_EVENTS.CREATE_GAME]: GameId;
    [USER_EVENTS.GET_PLAYERS]: PlayerId[];
    [USER_EVENTS.GET_STATE]: GameState;
    [USER_EVENTS.JOIN_GAME]: { playerId: PlayerId, players: PlayerId[] };
    [USER_EVENTS.PICK_CARD_FROM_DECK]: Card;
    [USER_EVENTS.PICK_CARD_FROM_DISCARD]: Card;
    [USER_EVENTS.REJOIN_GAME]: GameState;
}

export type ClientEventParamsNoCallbacks = {
    [USER_EVENTS.CREATE_GAME]: [];
    [USER_EVENTS.END_ROUND]: [GameId, PlayerId];
    [USER_EVENTS.GET_PLAYERS]: [GameId];
    [USER_EVENTS.GET_STATE]: [GameId, PlayerId];
    [USER_EVENTS.JOIN_GAME]: [GameId, PlayerId];
    [USER_EVENTS.PICK_CARD_FROM_DECK]: [GameId, PlayerId];
    [USER_EVENTS.PICK_CARD_FROM_DISCARD]: [GameId, PlayerId, Card];
    [USER_EVENTS.PLAY_CARDS]: [GameId, PlayerId, Card[]];
    [USER_EVENTS.READY_FOR_NEXT_ROUND]: [GameId, PlayerId];
    [USER_EVENTS.REJOIN_GAME]: [GameId, PlayerId];
    [USER_EVENTS.START_GAME]: [GameId];
}

export type ClientPlayerEventParamsNoCallBack = {
    [USER_EVENTS.END_ROUND]: [GameId, PlayerId];
    [USER_EVENTS.GET_STATE]: [GameId, PlayerId];
    [USER_EVENTS.JOIN_GAME]: [GameId, PlayerId];
    [USER_EVENTS.PICK_CARD_FROM_DECK]: [GameId, PlayerId];
    [USER_EVENTS.PICK_CARD_FROM_DISCARD]: [GameId, PlayerId, Card];
    [USER_EVENTS.PLAY_CARDS]: [GameId, PlayerId, Card[]];
    [USER_EVENTS.READY_FOR_NEXT_ROUND]: [GameId, PlayerId];
    [USER_EVENTS.REJOIN_GAME]: [GameId, PlayerId];
}

export type ClientEventParams = {
    [P in keyof ClientEventParamsNoCallbacks]: P extends keyof ClientCallbackParams ? List.Concat<ClientEventParamsNoCallbacks[P], [((params: ClientCallbackParams[P]) => void)?]> : ClientEventParamsNoCallbacks[P];
}

/**
 * removes first type from the array of types
 */
export type Shift<T extends any[]> = ((...t: T)=>void) extends ((h: any, ...r: infer R)=>void) ? R : never;
