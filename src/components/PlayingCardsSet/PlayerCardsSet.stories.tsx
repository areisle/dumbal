import { Button } from '@material-ui/core';
import React from 'react';

import { Constrained } from '../../decorators';
import { SUIT } from '../../types';
import { PlayingCardsSet, PlayingCardsSetProps } from '.';

const cards = [
    { suit: SUIT.HEARTS, number: 3 },
    { suit: SUIT.DIAMONDS, number: 8 },
    { suit: SUIT.DIAMONDS, number: 13 },
    { suit: SUIT.SPADES, number: 10 },
    { suit: SUIT.CLUBS, number: 4 },
];

export default {
    component: PlayingCardsSet,
    title: 'PlayingCardsSet',
};

export const OneCard = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
    />
);

OneCard.args = {
    cards: cards.slice(0, 1),
};

export const NoCards = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={[]}
    />
);

export const ManyCards = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
    />
);

export const ManyCardsWithMultipleSelected = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        selected={[cards[0], cards[2], cards[3]]}
    />
);

export const ManyCardsWithAction = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        selected={[]}
    >
        <Button
            color='primary'
            variant='contained'
        >
            Play Cards
        </Button>
    </PlayingCardsSet>
);

export const ManyCardsWithClick = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        selected={[]}
    >
        <Button
            color='primary'
            variant='contained'
        >
            Play Cards
        </Button>
    </PlayingCardsSet>
);

export const Stressed = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={[
            ...new Array(13).fill(null).map((_, i) => ({ suit: SUIT.CLUBS, number: i + 1 })),
            ...new Array(13).fill(null).map((_, i) => ({ suit: SUIT.DIAMONDS, number: i + 1 })),
        ]}
    />
);

export const SmallScreen = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
    />
);

SmallScreen.decorators = [Constrained(150, 150)];

export const VerySmallScreen = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
    />
);

VerySmallScreen.decorators = [Constrained(100, 100)];

export const Grid = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        variant='grid'
    />
);

export const GridSmallScreen = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        variant='grid'
    />
);

GridSmallScreen.decorators = [Constrained(150, 150)];
