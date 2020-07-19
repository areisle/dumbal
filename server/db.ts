import bind from 'bind-decorator';
import { Redis } from 'ioredis';

import {
    Card,
    DEFAULT_MAX_NUMBER_OF_POINTS,
    GAME_STAGE,
    GameId,
    GameState,
    PlayerId,
} from '../src/types';
import { getPreviousPlayer, getScore, removeCards } from '../src/utilities';

const getNextPlayer = (players: PlayerId[], playerId: PlayerId | null) => {
    if (!playerId) {
        return players.slice(-1)[0];
    }
    const nextIndex = (players.indexOf(playerId) + 1) % players.length;
    return players[nextIndex];
};

async function forEachPlayer<T>(players: PlayerId[], func: (playerId: PlayerId) => Promise<T> | T) {
    const itemByPlayer: Record<PlayerId, T> = {};
    const result = await Promise.all(
        players.map(func),
    );
    for (let i = 0; i < players.length; i += 1) {
        itemByPlayer[players[i]] = result[i];
    }
    return itemByPlayer;
}

/**
 * @todo add pipe for setters
 */
class GameDB {
    protected gkey: string;

    constructor(public redis: Redis, public gameId: GameId) {
        this.gkey = `games/${gameId}`;
    }

    protected async getJSON<T = unknown>(key: string): Promise<T | null> {
        // this returns null if the key does not exist
        const data = await this.redis.get(key) as string | null;

        return data ? JSON.parse(data) : data;
    }

    protected setJSON(key: string, value: unknown) {
        return this.redis.set(key, JSON.stringify(value));
    }

    async getStage(): Promise<GAME_STAGE> {
        return (await this.redis.get(`${this.gkey}/stage`) as GAME_STAGE) ?? GAME_STAGE.SETTING_UP;
    }

    async setStage(nextStage: GAME_STAGE) {
        await this.redis.set(`${this.gkey}/stage`, nextStage);
    }

    getRoundEndedBy(): Promise<PlayerId | null> {
        return this.redis.get(`${this.gkey}/round-ended-by`);
    }

    async setRoundEndedBy(playerId: PlayerId | null) {
        if (!playerId) {
            return this.redis.del(`${this.gkey}/round-ended-by`);
        }
        return this.redis.set(`${this.gkey}/round-ended-by`, playerId);
    }

    getRoundLeader(): Promise<PlayerId | null> {
        return this.redis.get(`${this.gkey}/round-leader`);
    }

    async setRoundLeader(playerId: PlayerId | null) {
        if (!playerId) {
            return this.redis.del(`${this.gkey}/round-leader`);
        }
        return this.redis.set(`${this.gkey}/round-leader`, playerId);
    }

    getRoundNumber() {
        return this.getJSON<number>(`${this.gkey}/round`);
    }

    async setRoundNumber(roundNumber: number | null) {
        if (roundNumber === null) {
            return this.redis.del(`${this.gkey}/round`);
        }
        return this.redis.set(`${this.gkey}/round`, roundNumber);
    }

    async getPointsLimit() {
        return (await this.getJSON<number>(`${this.gkey}/points-limit`)) ?? DEFAULT_MAX_NUMBER_OF_POINTS;
    }

    async setPointsLimit(limit: number) {
        return this.redis.set(`${this.gkey}/points-limit`, limit);
    }

    getActivePlayer(): Promise<PlayerId | null> {
        return this.redis.get(`${this.gkey}/active-player`);
    }

    async setActivePlayer(playerId: PlayerId | null) {
        if (!playerId) {
            return this.redis.del(`${this.gkey}/active-player`);
        }
        return this.redis.set(`${this.gkey}/active-player`, playerId);
    }

    /**
     * gets a list of all the players in the game
     * @returns all the players in the game in the order they were added
     */
    async getPlayers() {
        return (await this.getJSON<PlayerId[]>(`${this.gkey}/players`)) ?? [];
    }

    async getPlayersStillIn() {
        const [
            players,
            outByPlayerId,
        ] = await Promise.all([
            this.getPlayers(),
            this.forEachPlayer(this.getPlayerIsOut),
        ]);

        return players.filter((pId) => !outByPlayerId[pId]);
    }

    async setPlayers(players: PlayerId[]) {
        return this.setJSON(`${this.gkey}/players`, players);
    }

    async addPlayer(playerId: PlayerId) {
        const players = await this.getPlayers();
        players.push(playerId);
        return this.setJSON(`${this.gkey}/players`, players);
    }

    async getNextPlayer(playerId: PlayerId | null) {
        const players = await this.getPlayersStillIn();
        return getNextPlayer(players, playerId);
    }

    async getPrevPlayer(playerId: PlayerId | null) {
        const players = await this.getPlayersStillIn();
        return getPreviousPlayer(players, playerId);
    }

    async checkPlayerExists(playerId: PlayerId) {
        const players = await this.getPlayers();
        return players.includes(playerId);
    }

    async getTotalScores() {
        const scores = await this.getScores();
        const scoresByPlayerId = await this.forEachPlayer((pId) => getScore(scores, pId));
        return scoresByPlayerId;
    }

    async deck() {
        return (await this.getJSON<Card[]>(`${this.gkey}/cards`)) ?? [];
    }

    setDeck(cards: Card[]) {
        return this.setJSON(`${this.gkey}/cards`, cards);
    }

    static addGame(redis: Redis, gameId: GameId) {
        return Promise.all([
            redis.sadd('games', gameId),
            redis.set(`games/${gameId}/stage`, GAME_STAGE.SETTING_UP),
        ]);
    }

    async deleteGame() {
        const keys = await this.redis.keys(`${this.gkey}*`);
        // Use pipeline instead of sending
        // one command each time to improve the
        // performance.
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => {
            pipeline.del(key);
        });
        pipeline.srem('games', this.gameId);
        return pipeline.exec();
    }

    async getScores() {
        return (await this.getJSON<GameState['scores']>(`${this.gkey}/scores`)) ?? [];
    }

    async setScores(scores: GameState['scores']) {
        return this.setJSON(`${this.gkey}/scores`, scores);
    }

    async setRoundScores(roundScores: GameState['scores'][number]) {
        const scores = await this.getScores();
        scores.push(roundScores);
        return this.setJSON(`${this.gkey}/scores`, scores);
    }

    private async forEachPlayer<T>(func: (playerId: PlayerId) => Promise<T> | T) {
        const players = await this.getPlayers();
        return forEachPlayer(players, func);
    }

    async forEachPlayerStillIn<T>(func: (playerId: PlayerId) => Promise<T> | T) {
        const players = await this.getPlayersStillIn();
        return forEachPlayer(players, func);
    }

    // player methods
    @bind
    async getPlayerCards(playerId: PlayerId) {
        return (await this.getJSON<Card[]>(`${this.gkey}/players/${playerId}/cards`)) ?? [];
    }

    setPlayerCards(playerId: PlayerId, cards: Card[]) {
        return this.setJSON(`${this.gkey}/players/${playerId}/cards`, cards);
    }

    async addToPlayerCards(playerId: PlayerId, cardsToAdd: Card[]) {
        const cards = await this.getPlayerCards(playerId);
        cards.push(...cardsToAdd);
        return this.setJSON(`${this.gkey}/players/${playerId}/cards`, cards);
    }

    async removeFromPlayerCards(playerId: PlayerId, cardsToRemove: Card[]) {
        const cards = await this.getPlayerCards(playerId);
        return this.setJSON(`${this.gkey}/players/${playerId}/cards`, removeCards(cards, cardsToRemove));
    }

    @bind
    async getPlayerDiscard(playerId: PlayerId) {
        return (await this.getJSON<Card[]>(`${this.gkey}/players/${playerId}/discard`)) ?? [];
    }

    setPlayerDiscard(playerId: PlayerId, cards: Card[]) {
        return this.setJSON(`${this.gkey}/players/${playerId}/discard`, cards);
    }

    @bind
    getPlayerSocket(playerId: PlayerId): Promise<string | null> {
        return this.redis.get(`${this.gkey}/players/${playerId}/socket`);
    }

    setPlayerSocket(playerId: PlayerId, socket: string) {
        return this.redis.set(`${this.gkey}/players/${playerId}/socket`, socket);
    }

    @bind
    getPlayerIsOut(playerId: PlayerId): Promise<boolean | null> {
        return this.getJSON(`${this.gkey}/players/${playerId}/out`);
    }

    setPlayerIsOut(playerId: PlayerId, out: boolean) {
        return this.redis.set(`${this.gkey}/players/${playerId}/out`, String(out));
    }

    @bind
    getPlayerReady(playerId: PlayerId): Promise<boolean | null> {
        return this.getJSON(`${this.gkey}/players/${playerId}/ready`);
    }

    setPlayerReady(playerId: PlayerId, ready: boolean | null) {
        return this.redis.set(`${this.gkey}/players/${playerId}/ready`, String(ready ?? false));
    }

    async getCardsForPlayers() {
        return this.forEachPlayerStillIn(this.getPlayerCards);
    }

    async getSocketsForPlayers() {
        return this.forEachPlayer(this.getPlayerSocket);
    }

    async getReadyForPlayers() {
        return this.forEachPlayer(this.getPlayerReady);
    }

    async getDiscardForPlayers() {
        return this.forEachPlayer(this.getPlayerDiscard);
    }

    async clearReadyforPlayers() {
        return this.forEachPlayer((pId) => this.setPlayerReady(pId, false));
    }

    async clearDiscardForPlayers() {
        return this.forEachPlayer((pId) => this.setPlayerDiscard(pId, []));
    }
}

export {
    GameDB,
};
