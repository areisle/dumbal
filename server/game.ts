import { Redis } from 'ioredis';
import shortid from 'shortid';

import {
    Card,
    DEFAULT_MAX_NUMBER_OF_POINTS,
    GAME_STAGE,
    GameId,
    GameState,
    MIN_NUMBER_OF_PLAYERS,
    PlayerId,
} from '../src/types';
import { removeCards } from '../src/utilities';
import { GameDB } from './db';
import { createDeck } from './deck';
import {
    BadTiming,
    NotEnoughPlayers,
    NotFound,
} from './errors';
import { Player } from './player';

class Game {
    public db: GameDB;

    constructor(protected redis: Redis, public gameId: GameId) {
        this.db = new GameDB(redis, gameId);
    }

    get id() {
        return this.gameId;
    }

    /**
     * creates a new game
     */
    static async create(redis: Redis, limit: number = DEFAULT_MAX_NUMBER_OF_POINTS): Promise<Game> {
        const gameId = shortid.generate();
        await GameDB.addGame(redis, gameId);
        const game = new Game(redis, gameId);
        await game.db.setPointsLimit(limit);
        return game;
    }

    /**
     * starts the game.
     * @throws {NotEnoughPlayers} if minimum number of players is not yet met
     */
    async start() {
        const players = await this.db.getPlayers();
        if (!players || players.length < MIN_NUMBER_OF_PLAYERS) {
            throw new NotEnoughPlayers(`At least ${MIN_NUMBER_OF_PLAYERS} players are required to start the game`);
        }

        const details = await this.startNextRound();
        return details;
    }

    /**
     * checks if the game has been started yet
     * @throws {NotFound} if game does not exist
     */
    async isStarted() {
        const stage = await this.db.getStage();

        if (!stage) {
            throw new NotFound(`Unable to find a game with id: ${this.gameId}.`);
        }
        return stage !== GAME_STAGE.SETTING_UP;
    }

    /**
     * deals out the cards and sets the players hands in the database
     * @returns the cards by playerId
     */
    private async deal() {
        const deck = createDeck();

        const cardsByPlayer = await this.db.forEachPlayerStillIn(async (pId) => {
            const playerCards = deck.splice(0, 5);
            await this.db.setPlayerCards(pId, playerCards);
            return playerCards;
        });
        await this.db.setDeck(deck);
        return cardsByPlayer;
    }

    /**
     * @throws if last turn is not finished
     */
    async startNextRound() {
        const stage = await this.db.getStage();
        if (!stage || ![GAME_STAGE.SETTING_UP, GAME_STAGE.BETWEEN_ROUNDS].includes(stage)) {
            throw new BadTiming('Unable to start next round in the middle of the last one.');
        }

        const lastRoundLeader = await this.db.getRoundLeader();
        const roundLeader = await this.db.getNextPlayer(lastRoundLeader);
        const roundNumber = (await this.db.getRoundNumber() ?? -1) + 1;
        await Promise.all([
            this.db.setStage(GAME_STAGE.PLAYING_CARDS),
            this.db.setActivePlayer(roundLeader),
            this.db.setRoundLeader(roundLeader),
            this.db.setRoundNumber(roundNumber),
            this.db.clearReadyforPlayers(),
            this.db.clearDiscardForPlayers(),
            this.db.setRoundEndedBy(null),
        ]);

        const cardsByPlayerId = await this.deal();

        const cardCounts: GameState['cardCounts'] = {};
        for (const [playerId, cards] of Object.entries(cardsByPlayerId)) {
            cardCounts[playerId] = cards.length;
        }

        return {
            activePlayer: roundLeader,
            stage: GAME_STAGE.PLAYING_CARDS,
            cardsByPlayerId,
            roundNumber,
            cardCounts,
        };
    }

    /**
     * @throws if last turn is not finished
     */
    async startNextTurn() {
        // @todo check all cards that need to be played are played

        const activePlayer = await this.db.getActivePlayer();
        const nextPlayer = await this.db.getNextPlayer(activePlayer);

        await Promise.all([
            this.db.setStage(GAME_STAGE.PLAYING_CARDS),
            this.db.setActivePlayer(nextPlayer),
        ]);

        return {
            activePlayer: nextPlayer,
            stage: GAME_STAGE.PLAYING_CARDS,
        };
    }

    getPlayer(playerId: PlayerId) {
        // eslint-disable-next-line no-use-before-define
        return new Player(this, playerId);
    }

    getPlayers() {
        return this.db.getPlayers();
    }

    async resetDeck() {
        const [discards, cards] = await Promise.all([
            this.db.getDiscardForPlayers(),
            this.db.getCardsForPlayers(),
        ]);

        const cardsInPlay = [
            Object.values(discards),
            Object.values(cards),
        ].flat(2);

        const fullDeck = createDeck();
        const deck = removeCards(fullDeck, cardsInPlay);
        await this.db.setDeck(deck);
        return deck;
    }

    /**
     * update game state
     */
    async setGameState(state: Partial<Omit<GameState, 'cards' | 'playerId' | 'gameId'> & { cardsByPlayerId: Record<PlayerId, Card[]>; socketByPlayerId: Record<PlayerId, string> }>) {
        const {
            activePlayer,
            cardsByPlayerId = {},
            discard = {},
            players,
            ready = {},
            roundEndedBy,
            roundLeader,
            roundNumber,
            scores,
            stage,
            socketByPlayerId = {},
        } = state;
        const promises: Promise<any>[] = [];
        if (activePlayer !== undefined) {
            promises.push(this.db.setActivePlayer(activePlayer));
        }

        for (const [playerId, cards] of Object.entries(cardsByPlayerId)) {
            promises.push(this.db.setPlayerCards(playerId, cards));
        }
        for (const [playerId, cards] of Object.entries(discard)) {
            promises.push(this.db.setPlayerDiscard(playerId, cards));
        }
        if (players) {
            promises.push(this.db.setPlayers(players));
        }
        for (const [playerId, isReady] of Object.entries(ready)) {
            promises.push(this.db.setPlayerReady(playerId, isReady));
        }
        for (const [playerId, socketId] of Object.entries(socketByPlayerId)) {
            promises.push(this.db.setPlayerSocket(playerId, socketId));
        }
        if (roundLeader !== undefined) {
            promises.push(this.db.setRoundLeader(roundLeader));
        }
        if (roundEndedBy !== undefined) {
            promises.push(this.db.setRoundEndedBy(roundEndedBy));
        }
        if (roundNumber !== undefined) {
            promises.push(this.db.setRoundNumber(roundNumber));
        }
        if (scores) {
            promises.push(this.db.setScores(scores));
        }
        if (stage !== undefined) {
            promises.push(this.db.setStage(stage));
        }

        return Promise.all(promises);
    }
}

export {
    Game,
};
