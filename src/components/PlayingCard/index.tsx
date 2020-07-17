import './index.scss';

import clsx from 'clsx';
import React, { HTMLProps, useMemo } from 'react';

import { Card, SUIT } from '../../types';
import { getCardLetter } from '../../utilities';
import { SuitIcon } from '../icons';

export interface PlayingCardProps extends Card {
    /**
     * how big the card should be
     * @default medium
     */
    size?: 'medium' | 'large' | 'flexible';
    /**
     * whether the card is currently selected
     * @default false
     */
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
    stacked?: boolean;
}

function Marker(props: Card & { small?: boolean }) {
    const { suit, number = null, small = false } = props;

    const letter = useMemo(() => number && getCardLetter(number), [number]);

    return (
        <div className={clsx('marker', { 'marker--small': small })}>
            <SuitIcon
                variant={suit as SUIT}
            />
            {letter}
        </div>
    );
}

function PlayingCard(props: PlayingCardProps) {
    const {
        size = 'medium',
        suit,
        number,
        selected,
        children,
        stacked,
        ...rest
    } = props;

    return (
        <div
            {...rest}
            className={clsx(`playing-card playing-card--${size}`, {
                'playing-card--selected': selected,
                'playing-card--stacked': stacked,
            })}
        >
            <Marker number={number} small={stacked} suit={suit} />
            <div className='playing-card__content'>
                {children}
            </div>
            <Marker number={number} small={stacked} suit={suit} />
        </div>
    );
}

export {
    PlayingCard,
    Marker,
};
