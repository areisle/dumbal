import './index.scss';

import clsx from 'clsx';
import React, { HTMLProps, useMemo } from 'react';

import { Card, SUIT } from '../../types';
import { getCardLetter } from '../../utilities';
import { SuitIcon } from '../icons';

export interface PlayingCardProps extends Card {
    /**
     * whether the card is currently selected
     * @default false
     */
    selected?: boolean;
    onClick?: HTMLProps<HTMLDivElement>['onClick'];
    children?: HTMLProps<HTMLDivElement>['children'];
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
        suit,
        number,
        selected,
        children,
        ...rest
    } = props;

    return (
        <div
            {...rest}
            className={clsx('playing-card', {
                'playing-card--selected': selected,
            })}
        >
            <Marker number={number} suit={suit} />
            <div className='playing-card__content'>
                {children}
            </div>
            <Marker number={number} suit={suit} />
        </div>
    );
}

export {
    PlayingCard,
    Marker,
};
