import React from 'react';

import { Constrained } from '../../decorators';
import { SUIT } from '../../types';
import { TrophyIcon } from '../icons';
import { PlayingCard, PlayingCardProps } from '.';

export default {
    component: PlayingCard,
    title: 'PlayingCard',
    args: {
        suit: SUIT.DIAMONDS,
        number: 7,
    },
};

export const Example = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
    />
);

export const Selected = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        selected={true}
    />
);

export const WithContent = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
    >
        <TrophyIcon />
    </PlayingCard>
);

export const Ace = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={1}
        suit={SUIT.SPADES}
    />
);

export const King = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={13}
        suit={SUIT.HEARTS}
    />
);

export const Queen = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={12}
        suit={SUIT.CLUBS}
    />
);

export const Jack = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={11}
        suit={SUIT.DIAMONDS}
    />
);

export const SmallScreen = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={11}
        suit={SUIT.DIAMONDS}
    />
);

SmallScreen.decorators = [Constrained(150, 150)];

export const VerySmallScreen = (props: PlayingCardProps) => (
    <PlayingCard
        {...props}
        number={11}
        suit={SUIT.DIAMONDS}
    />
);

VerySmallScreen.decorators = [Constrained(100, 100)];
