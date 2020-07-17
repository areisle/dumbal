import without from 'lodash.without';

import {
    Card,
    GAME_STAGE,
    GameState,
    MAX_NUMBER_OF_PLAYERS,
    MAX_NUMBER_OF_POINTS,
    PlayerId,
} from '../src/types';
import {
    determineScoresFromCards,
    getCardName,
    getCardsTotal,
    includesCards,
    isValidSelection,
    removeCards,
} from '../src/utilities';
import { GameDB } from './db';
import {
    BadTiming, Forbidden, NotFound, NotYourTurn,
} from './errors';
import { Game } from './game';

class Player {
    public db: GameDB;

    constructor(
        public game: Game,
        public playerId: PlayerId,
    ) {
        this.db = new GameDB(game.db.redis, game.gameId);
    }

    get id() {
        return this.playerId;
    }

    /**
     * plays the cards from the users hand
     * @param cards the cards to play
     * @throws {Forbidden} if the cards are not a valid play
     * @throws {NotFound} if not all the cards are in the users hand
     * @throws {BadTiming} if the user has already played their cards
     * @throws {NotYourTurn} if they not the active user
     */
    async playCards(cardsToPlay: Card[]) {
        const [
            activePlayerId,
            stage,
            cards,
        ] = await Promise.all([
            this.db.getActivePlayer(),
            this.db.getStage(),
            this.db.getPlayerCards(this.playerId),
        ]);

        if (this.playerId !== activePlayerId) {
            throw new NotYourTurn(`cannot play cards unless you are the active player. Active player is: ${activePlayerId}.`);
        }

        if (stage !== GAME_STAGE.PLAYING_CARDS) {
            throw new BadTiming(`cannot play cards during ${stage}.`);
        }

        if (!includesCards(cards, cardsToPlay)) {
            throw new NotFound('The cards to play do not match the cards in your hand.');
        }

        if (!isValidSelection(cardsToPlay)) {
            throw new Forbidden('Cards are not a valid play. You may only play: runs of 3 or more, a pair, 3 of a kind, or 4 of a kind, or a single card.');
        }

        await Promise.all([
            this.db.removeFromPlayerCards(this.playerId, cardsToPlay),
            this.db.setPlayerDiscard(this.playerId, cardsToPlay),
            this.db.setStage(GAME_STAGE.PICKING_CARD),
        ]);

        return {
            cards: cardsToPlay,
            playerId: this.playerId,
            stage: GAME_STAGE.PICKING_CARD as const,
            count: cards.length - cardsToPlay.length,
        };
    }

    /**
     * player draws a card from the deck
     * @param numberOfCards the number of cards to take
     * @returns the card the player drew
     * @throws {NotYourTurn} if not the active player
     * @throws {NotReady} if there are any unplanted plants in trading area from any player
     */
    async drawFromDeck() {
        const [
            activePlayerId,
            stage,
        ] = await Promise.all([
            this.db.getActivePlayer(),
            this.db.getStage(),
        ]);

        if (this.playerId !== activePlayerId) {
            throw new NotYourTurn(`Cannot draw a card unless you are the active player. Active player is: ${activePlayerId}.`);
        }

        if (stage !== GAME_STAGE.PICKING_CARD) {
            throw new BadTiming(`Cannot draw a card. The timing is incorrect. Current game stage is: ${stage}.`);
        }

        const deck = await this.db.deck();
        const [drawn] = deck.splice(0, 1);

        await Promise.all([
            this.db.addToPlayerCards(this.playerId, [drawn]),
            this.db.setDeck(deck),
        ]);

        return drawn;
    }

    async drawFromDiscard(card: Card) {
        const activePlayerId = await this.db.getActivePlayer();
        const prevActivePlayer = await this.db.getPrevPlayer(activePlayerId);

        if (this.playerId !== activePlayerId) {
            throw new NotYourTurn(`cannot play cards unless you are the active player. Active player is: ${activePlayerId}.`);
        }

        const discardedCards = await this.db.getPlayerDiscard(prevActivePlayer);

        if (!includesCards(discardedCards, [card])) {
            throw new NotFound(`Cannot pick up card. ${getCardName(card)} is not in the discard.`);
        }

        await Promise.all([
            this.db.addToPlayerCards(this.playerId, [card]),
            this.db.setPlayerDiscard(prevActivePlayer, removeCards(discardedCards, [card])),
        ]);

        return card;
    }

    async ready() {
        await this.db.setPlayerReady(this.playerId, true);
        const [
            ready,
            players,
        ] = await Promise.all([
            this.db.getReadyForPlayers(),
            this.db.getPlayersStillIn(),
        ]);

        return players.every((playerId) => ready[playerId]);
    }

    /**
     * @todo if a player is >= 200, kick them out
     */
    async endRound() {
        const [
            activePlayer,
            stage,
            cards,
        ] = await Promise.all([
            this.db.getActivePlayer(),
            this.db.getStage(),
            this.db.getPlayerCards(this.playerId),
        ]);

        if (this.playerId !== activePlayer) {
            throw new NotYourTurn('Cannot end round when it\'s not your turn.');
        }

        if (stage !== GAME_STAGE.PLAYING_CARDS) {
            throw new BadTiming('Cannot end round. you may only end the round at the beginning of you turn.');
        }

        if (getCardsTotal(cards) > 5) {
            throw new Forbidden('Cannot end round. Must have 5 or less points in hand to end the round.');
        }

        let nextStage = GAME_STAGE.BETWEEN_ROUNDS;

        const cardsByPlayerId = await this.db.getCardsForPlayers();
        const scores = determineScoresFromCards(cardsByPlayerId, this.playerId);
        const promises: Promise<any>[] = [
            this.db.setStage(nextStage),
            this.db.setRoundEndedBy(this.playerId),
            this.db.setRoundScores(scores),
        ];

        for (const [playerId, playerCards] of Object.entries(cardsByPlayerId)) {
            promises.push(this.db.setPlayerDiscard(playerId, playerCards));
            promises.push(this.db.setPlayerCards(playerId, []));
        }

        await Promise.all(promises);
        const [
            scoresByPlayerId,
            players,
        ] = await Promise.all([
            this.db.getTotalScores(),
            this.db.getPlayers(),
        ]);

        const playersOut: PlayerId[] = [];
        for (const pId of players) {
            // @todo points
            if (scoresByPlayerId[pId] >= MAX_NUMBER_OF_POINTS) {
                playersOut.push(pId);
            }
        }

        await Promise.all(playersOut.map((pId) => this.db.setPlayerIsOut(pId, true)));

        if (players.length === playersOut.length + 1) {
            // game is over
            nextStage = GAME_STAGE.COMPLETE;
            await this.db.setStage(nextStage);
        }

        return {
            scores,
            roundEndedBy: this.playerId,
            discard: cardsByPlayerId,
            stage: nextStage,
            out: playersOut,
        };
    }

    async rejoin(socketId: string) {
        const exists = await this.db.checkPlayerExists(this.playerId);
        if (!exists) {
            throw new NotFound(`No player exists with name: ${this.playerId}`);
        }
        await this.db.setPlayerSocket(this.playerId, socketId);
        return this.getGameState();
    }

    /**
     * adds the player to the game if it doesn't
     * exist and the game is in setup.
     * if durng game play and the player exists,
     * player rejoins the game
     * @param playerId username of the player
     * @throws if player is not in game  and game is started
     * @throws if player is not in game and maximum number of players is already met
     * @todo rejoin
     */
    async join(socket: string) {
        const [players, started] = await Promise.all([
            this.db.getPlayers(),
            this.game.isStarted(),
        ]);

        if (players.includes(this.playerId) && !started) {
            throw new Error('Username is already in use. Please chose a different username.');
        }

        if (!started && players.length >= MAX_NUMBER_OF_PLAYERS) {
            // @todo join audience here?
            throw new Error('Maximum number of players has already joined the game.');
        }

        if (started) {
            if (!players.includes(this.playerId)) {
                // @todo join audience here?
                throw new BadTiming('Game has already started, cannot add any new players.');
            }
            // @todo rejoin
            return players.length;
        }

        const [count] = await Promise.all([
            this.db.addPlayer(this.playerId),
            this.db.setPlayerSocket(this.playerId, socket),
        ]);

        return count;
    }

    async getCards() {
        return this.db.getPlayerCards(this.playerId);
    }

    /**
     * @todo roundEndedBy, roundLeader,
     */
    async getGameState(): Promise<GameState> {
        const [
            scores,
            roundNumber,
            stage,
            cards,
            ready,
            roundEndedBy,
            roundLeader,
            discard,
            players,
            activePlayer,
        ] = await Promise.all([
            this.db.getScores(),
            this.db.getRoundNumber(),
            this.db.getStage(),
            this.db.getPlayerCards(this.playerId),
            this.db.getReadyForPlayers(),
            this.db.getRoundEndedBy(),
            this.db.getRoundLeader(),
            this.db.getDiscardForPlayers(),
            this.db.getPlayers(),
            this.db.getActivePlayer(),
        ]);

        // @note I think I hit the limit for Promise.alls typescript definition
        const [stillIn, cardCounts] = await Promise.all([
            this.db.getPlayersStillIn(),
            this.db.forEachPlayerStillIn(async (pId) => {
                const playerCards = await this.db.getPlayerCards(pId);
                return playerCards.length;
            }),
        ]);

        return {
            activePlayer,
            cards,
            discard,
            gameId: this.game.gameId,
            playerId: this.playerId,
            players,
            ready,
            roundEndedBy,
            roundLeader,
            roundNumber,
            scores,
            stage,
            out: without(players, ...stillIn),
            cardCounts,
        };
    }
}

export {
    Player,
};
