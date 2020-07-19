import './CardSelector.scss';

import { Backdrop } from '@material-ui/core';
import clsx from 'clsx';
import React, { ReactNode, useCallback } from 'react';

import { Card } from '../../types';
import { PlayingCardsSet } from '../PlayingCardsSet';

export interface CardSelectorProps {
    onCardClicked?: (card: Card) => void;
    /**
     * @default 'grid'
     */
    variant?: 'stacked' | 'grid';
    selected?: Card[];
    /**
     * if true, cards are selectable
     */
    selectable?: boolean;
    /**
     * the cards to display
     */
    cards: Card[];
    open?: boolean;
    children?: ReactNode;
    showOnlySelected?: boolean;
    onClose?: () => void;
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
}

function CardSelector(props: CardSelectorProps) {
    const {
        cards,
        open = false,
        children,
        variant,
        selected = [],
        showOnlySelected,
        onCardClicked,
        onClose,
        header,
        footer,
        className,
    } = props;

    const handleClickCard = useCallback((e: React.MouseEvent, card: Card) => {
        e.stopPropagation();
        onCardClicked?.(card);
    }, [onCardClicked]);

    return (
        <Backdrop
            className={clsx('card-selector', className)}
            onClick={onClose}
            open={open}
        >
            {header}
            <PlayingCardsSet
                cards={showOnlySelected ? selected : cards}
                onCardClick={handleClickCard}
                selected={showOnlySelected ? [] : selected}
                variant={variant}
            >
                {children}
            </PlayingCardsSet>
            {footer}
        </Backdrop>
    );
}

export {
    CardSelector,
};
