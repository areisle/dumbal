import { Button } from '@material-ui/core';
import React from 'react';

import { SUIT } from '../../types';
import { CardSelector, CardSelectorProps } from '.';

export default {
    title: 'CardSelector',
    component: CardSelector,
};

const cards = [
    { suit: SUIT.HEARTS, number: 3 },
    { suit: SUIT.DIAMONDS, number: 8 },
    { suit: SUIT.DIAMONDS, number: 13 },
    { suit: SUIT.SPADES, number: 10 },
    { suit: SUIT.CLUBS, number: 4 },
];

export const Basic = (props: CardSelectorProps) => (
    <CardSelector {...props} />
);

Basic.args = {
    cards,
    open: true,
};

export const Stacked = (props: CardSelectorProps) => (
    <CardSelector
        {...props}
        cards={cards}
        open={true}
        variant='stacked'
    />
);

export const StackedWithSelected = (props: CardSelectorProps) => (
    <CardSelector
        {...props}
        cards={cards}
        open={true}
        selected={[cards[0], cards[2]]}
        variant='stacked'
    />
);

export const StackedWithSelectedOnly = (props: CardSelectorProps) => (
    <CardSelector
        {...props}
        cards={cards}
        open={true}
        selected={[cards[0], cards[2]]}
        showOnlySelected={true}
        variant='stacked'
    />
);

export const StackedWithChildren = (props: CardSelectorProps) => (
    <CardSelector
        {...props}
        cards={cards}
        open={true}
        selected={[cards[0], cards[2]]}
        showOnlySelected={true}
        variant='stacked'
    >
        <Button
            color='primary'
            variant='contained'
        >
            Click Me
        </Button>
    </CardSelector>
);

export const GridWithFooter = (props: CardSelectorProps) => (
    <CardSelector
        {...props}
        cards={cards}
        footer={(
            <Button
                color='primary'
                variant='contained'
            >
                Click Me
            </Button>
        )}
        open={true}
        variant='grid'
    />
);
