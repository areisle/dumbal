import shuffle from 'shuffle-array';

import {
    Card, SUIT,
} from '../src/types';

const createDeck = () => {
    const cards: Card[] = [];

    for (const suit of Object.values(SUIT)) {
        for (let value = 1; value <= 13; value += 1) {
            cards.push({ suit, number: value });
        }
    }
    return shuffle(cards);
};

export {
    createDeck,
};
