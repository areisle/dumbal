import without from 'lodash.without';

import {
    Card, GameState, PlayerId,
} from './types';

function getScore(
    scores: GameState['scores'],
    playerId: PlayerId,
    roundNumber?: number,
): number {
    let score = 0;

    for (let i = 0; i <= (roundNumber ?? scores.length - 1); i += 1) {
        score += scores[i][playerId] ?? 0;
    }

    return score;
}

/**
 * copy to clipboard that works on ios
 * https://stackoverflow.com/questions/40147676/javascript-copy-to-clipboard-on-safari
 * @param text
 */
function copyToClipboard(text: string) {
    const isOS = navigator.userAgent.match(/ipad|iphone/i);
    // create text area
    const textArea = document.createElement('textArea') as HTMLTextAreaElement;
    textArea.value = text;
    document.body.appendChild(textArea);

    // select text
    let range;
    let selection: Selection | null;

    if (isOS) {
        range = document.createRange();
        range.selectNodeContents(textArea);
        selection = window.getSelection();

        if (!selection) {
            return;
        }
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
    } else {
        textArea.select();
    }

    document.execCommand('copy');
    document.body.removeChild(textArea);
}

const numberToName: Record<string, string> = {
    1: 'Ace',
    11: 'Jack',
    12: 'Queen',
    13: 'King',
};

const getCardName = (card: Card) => {
    const { number, suit } = card;
    const numberName = numberToName[String(number)] ?? number;
    return `${numberName} of ${suit}`;
};

const getCardLetter = (num: number) => numberToName[String(num)]?.[0] ?? num;

const isValidSelection = (cards: Card[]) => {
    const numbers = cards.map((card) => card.number).sort((a, b) => a - b);
    // must be all the same number, or a run of 3 or more
    if (new Set(numbers).size === 1) {
        return true;
    }
    let allowBreak = false;
    if (numbers.includes(13) && numbers.includes(1)) {
        // allow one break
        allowBreak = true;
    }
    return numbers.every((n, i) => {
        if (i === 0) {
            return true;
        }
        if (n === numbers[i - 1] + 1) {
            return true;
        }
        if (allowBreak) {
            allowBreak = false;
            return true;
        }
        return false;
    }) && numbers.length >= 3;
};

const isSameCard = (a: Card, b: Card) => (
    a.number === b.number
    && b.suit === a.suit
);

const removeCards = (cards: Card[], toRemove: Card[]) => {
    const indices: number[] = toRemove.map((cardToDiscard) => cards.findIndex((card) => isSameCard(card, cardToDiscard)));
    return cards.filter((card, index) => !indices.includes(index));
};

const includesCards = (cards: Card[], subset: Card[]) => subset.every((card) => cards.findIndex((val) => isSameCard(card, val)) > -1);

const cardKey = (card: Card) => `${card.suit}${card.number}`;

/**
 * gets the player previous to the currentPlayer;
 * if the currentPlayer is null, will return the second last player
 */
const getPreviousPlayer = (players: PlayerId[], currentPlayer: PlayerId | null): PlayerId => {
    if (!players.length) {
        throw new Error('must have players');
    }
    if (!currentPlayer) {
        return getPreviousPlayer(players, players.slice(-1)[0]);
    }
    const index = players.indexOf(currentPlayer);
    if (index < 0) {
        throw new Error('player does not exist');
    }
    return players[(index - 1 + players.length) % players.length];
};

const getCardsTotal = (cards: Card[]) => cards.reduce((sum, card) => sum + card.number, 0);

const determineScoresFromCards = (cardsByPlayerId: Record<PlayerId, Card[]>, endedBy: PlayerId) => {
    const players = Object.keys(cardsByPlayerId);
    const scoresByPlayerId: Record<PlayerId, number> = {};
    let lowestScorers: PlayerId[] = [];
    let lowestScore = Infinity;
    for (const playerId of players) {
        const score = getCardsTotal(cardsByPlayerId[playerId]);
        scoresByPlayerId[playerId] = score;
        if (score < lowestScore) {
            lowestScorers = [playerId];
            lowestScore = score;
        } else if (score === lowestScore) {
            lowestScorers.push(playerId);
        }
    }

    if (lowestScorers.length > 1 || !lowestScorers.includes(endedBy)) {
        // dumballed!
        lowestScorers = without(lowestScorers, endedBy);
        for (const playerId of lowestScorers) {
            scoresByPlayerId[playerId] = 0;
        }

        scoresByPlayerId[endedBy] += 20;
    } else {
        scoresByPlayerId[endedBy] = 0;
    }

    return scoresByPlayerId;
};

const getRoundWinners = (
    players: PlayerId[],
    roundNumber: number | null,
    scores: GameState['scores'],
) => {
    if (roundNumber === null) { return []; }
    const roundScores = scores[roundNumber];
    if (!roundScores) { return []; }
    const lowest = Math.min(...Object.values(roundScores));
    return players.filter((nextPlayerId) => roundScores[nextPlayerId] === lowest);
};

const listToSentence = (list: string[]) => {
    if (list.length > 2) {
        return `${list.slice(0, -1).join(', ')} and ${list.slice(-1)[0]}`;
    }
    if (list.length === 2) {
        return list.join(' and ');
    }
    return list[0];
};

const getPlayerNumber = (players: PlayerId[], playerId: PlayerId | null) => {
    const index = players.indexOf(playerId as PlayerId);
    if (index < 0) {
        return null;
    }
    return index + 1;
};

const getTotalScores = (players: PlayerId[], scores: GameState['scores']) => {
    const totalScores: Record<PlayerId, number> = {};
    for (const round of scores) {
        for (const playerId of players) {
            totalScores[playerId] = totalScores[playerId] ?? 0;
            totalScores[playerId] += round[playerId] ?? 0;
        }
    }
    return totalScores;
};

const getOverallWinner = (players: PlayerId[], scores: GameState['scores']) => {
    const totals = getTotalScores(players, scores);
    let winner: PlayerId = players[0];
    let score: number = Infinity;
    for (const playerId of players) {
        if (totals[playerId] < score) {
            winner = playerId;
            score = totals[playerId];
        }
    }
    return winner;
};

export {
    getScore,
    copyToClipboard,
    getCardName,
    getCardLetter,
    isValidSelection,
    removeCards,
    cardKey,
    includesCards,
    getPreviousPlayer,
    getCardsTotal,
    determineScoresFromCards,
    listToSentence,
    getRoundWinners,
    getPlayerNumber,
    getTotalScores,
    getOverallWinner,
};
