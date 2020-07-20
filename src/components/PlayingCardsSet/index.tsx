import './index.scss';

import clsx from 'clsx';
import React, { ReactNode, useMemo } from 'react';

import { Card, GameState } from '../../types';
import { cardKey, includesCards } from '../../utilities';
import { PlayingCard } from '../PlayingCard';

export interface PlayingCardsSetProps {
    cards: GameState['cards'];
    selected?: Card[];
    onCardClick?: (e: React.MouseEvent, card: Card) => void;
    children?: ReactNode;
    className?: string;
    /**
     * @default 'stacked'
     */
    variant?: 'stacked' | 'grid';
}

function PlayingCardsSet(props: PlayingCardsSetProps) {
    const {
        cards,
        selected = [],
        onCardClick,
        children,
        className = '',
        variant = 'stacked',
    } = props;

    const playingCards = useMemo(() => cards.map((card) => (
        <div
            key={cardKey(card)}
            className='playing-cards-set__card-wrapper'
        >
            <PlayingCard
                {...card}
                onClick={(e) => {
                    onCardClick?.(e, card);
                }}
                selected={includesCards(selected, [card])}
            />
        </div>
    )), [cards, onCardClick, selected]);

    return (
        <div
            className={clsx(
                'playing-cards-set',
                `playing-cards-set--${variant}`,
                className,
            )}
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
