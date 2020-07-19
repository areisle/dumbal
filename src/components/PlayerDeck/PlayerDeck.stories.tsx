import React from 'react';

import { SUIT } from '../../types';
import { PlayerDeck, PlayerDeckProps } from '.';

const cards = [
    { suit: SUIT.HEARTS, number: 3 },
    { suit: SUIT.DIAMONDS, number: 8 },
    { suit: SUIT.DIAMONDS, number: 13 },
    { suit: SUIT.CLUBS, number: 4 },
    { suit: SUIT.SPADES, number: 10 },
];

export default {
    component: PlayerDeck,
    title: 'PlayerDeck',
};

export const OneCard = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
    />
);

OneCard.args = {
    cards: cards.slice(0, 1),
};

export const NoCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={[]}
    />
);

export const ManyCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards}
    />
);
