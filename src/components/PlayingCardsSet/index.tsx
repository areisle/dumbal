import './index.scss';

import clsx from 'clsx';
import React, { ReactNode, useMemo } from 'react';

import { GameState } from '../../types';
import { cardKey } from '../../utilities';
import { PlayingCard } from '../PlayingCard';

export interface PlayingCardsSetProps {
    cards: GameState['cards'];
    selected?: number[];
    onCardClick?: (e: React.MouseEvent, index: number) => void;
    onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
    /**
     * @default 'medium'
     */
    size?: 'medium' | 'large' | 'flexible';
    children?: ReactNode;
    className?: string;
    clipped?: boolean;
}

function PlayingCardsSet(props: PlayingCardsSetProps) {
    const {
        cards,
        selected = [],
        onCardClick,
        size = 'medium',
        children,
        className = '',
        clipped = false,
        onClick,
    } = props;

    const playingCards = useMemo(() => cards.map((card, i) => (
        <div
            key={cardKey(card)}
            className='playing-cards-set__card-wrapper'
        >
            <PlayingCard
                {...card}
                onClick={(e) => {
                onCardClick?.(e, i);
                }}
                selected={selected.includes(i)}
                size={size}
                stacked={cards.length > 1 || clipped}
            />
        </div>
    )), [cards, clipped, onCardClick, selected, size]);

    return (
        <div
            className={clsx(['playing-cards-set', className, `playing-cards-set--${size}`], { 'playing-cards-set--clipped': clipped })}
            onClick={onClick}
            onKeyPress={onClick}
            role='button'
            tabIndex={-1}
        >
            <div className='playing-cards-set__cards'>
                {playingCards}
            </div>
            <div className='playing-cards-set__actions'>
                {children}
            </div>
        </div>
    );
}

export {
    PlayingCardsSet,
};
