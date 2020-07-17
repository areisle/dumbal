import { Button } from '@material-ui/core';
import React from 'react';

import { SUIT } from '../../types';
import { PlayingCardsSet, PlayingCardsSetProps } from '.';

const cards = [
    { suit: SUIT.HEARTS, number: 3 },
    { suit: SUIT.DIAMONDS, number: 8 },
    { suit: SUIT.DIAMONDS, number: 13 },
    { suit: SUIT.CLUBS, number: 4 },
    { suit: SUIT.SPADES, number: 10 },
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

export const OneLargeCard = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards.slice(0, 1)}
        size='large'
    />
);

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

export const LargeCards = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        size='large'
    />
);

export const ManyCardsWithMultipleSelected = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        selected={[1, 3, 4]}
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

export const Flexible = (props: PlayingCardsSetProps) => (
    <PlayingCardsSet
        {...props}
        cards={cards}
        size='flexible'
    />
);

const Square = (storyFn: any) => <div style={{ '--flexible-card-width': '200px', '--flexible-card-height': '500px' } as React.CSSProperties}>{storyFn()}</div>;

Flexible.decorators = [Square];
