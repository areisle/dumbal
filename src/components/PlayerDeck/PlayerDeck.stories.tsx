import React from 'react';

import { SUIT } from '../../types';
import { PlayerDeck, PlayerDeckProps } from '.';

const PlayerNumberDecorator = (storyFn: any) => (
    <div
        className='main--player-1'
        style={{
            position: 'relative',
            height: '100vh',
        }}
    >
        {storyFn()}
    </div>
);

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
    decorators: [PlayerNumberDecorator],
};

export const ClosedWithOneCard = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
    />
);

ClosedWithOneCard.args = {
    cards: cards.slice(0, 1),
    playerNumber: 1,
};

export const OpenWithOneCard = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards.slice(0, 1)}
        open={true}
        playerNumber={1}
    />
);

export const ClosedWithNoCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={[]}
        playerNumber={1}
    />
);

export const ClosedWithManyCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards}
        playerNumber={1}
    />
);

export const OpenWithManyCards = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards}
        open={true}
        playerNumber={1}
    />
);

export const OpenAsActivePlayer = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        cards={cards}
        open={true}
        playerNumber={1}
    />
);

export const OpenWithSelectMultiple = (props: PlayerDeckProps) => (
    <PlayerDeck
        {...props}
        allowSelectMultiple={true}
        cards={cards}
        open={true}
        playerNumber={1}
        showPickAction={true}
    />
);
