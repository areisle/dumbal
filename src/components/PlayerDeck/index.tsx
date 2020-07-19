import './index.scss';

import { Button } from '@material-ui/core';
import clsx from 'clsx';
import without from 'lodash.without';
import React, { useCallback, useEffect, useState } from 'react';

import { Card } from '../../types';
import { CardSelector } from '../CardSelector';
import { PlayingCardsSet } from '../PlayingCardsSet';

export interface PlayerDeckProps {
    cards: Card[];
    selectable?: boolean;
    onSelectCards?: (cards: Card[]) => void;
}

function PlayerDeck(props: PlayerDeckProps) {
    const {
        cards,
        selectable,
        onSelectCards,
    } = props;

    const [selected, setSelected] = useState<Card[]>([]);
    const [open, setOpen] = useState(false);

    const handleCardClick = (_: any, card: Card) => {
        if (!open) {
            setOpen(true);
        }
        setSelected((prev) => (prev.includes(card) ? without(prev, card) : [...prev, card]));
    };

    const handleSelectCards = () => {
        onSelectCards?.(selected);
    };

    useEffect(() => {
        setSelected([]);
    }, [cards]);

    const handleClose = useCallback(() => {
        setOpen(false);
        setSelected([]);
    }, []);

    return (
        <div
            className={clsx(
                'player-deck',
                { 'player-deck--open': open },
            )}
        >
            <CardSelector
                {...props}
                cards={cards}
                className='player-deck__selector'
                onClose={handleClose}
                open={open}
                selectable={true}
                selected={selected}
                showOnlySelected={true}
                variant='stacked'
            >
                {selectable && (
                    <Button
                        color='primary'
                        disabled={!selected.length}
                        onClick={handleSelectCards}
                        variant='contained'
                    >
                        Play Card
                        {selected.length > 1 ? '(s)' : ''}
                    </Button>
                )}
            </CardSelector>
            <div
                className='player-deck__reference'
            >
                <PlayingCardsSet
                    cards={cards}
                    onCardClick={handleCardClick}
                    selected={selected}
                    variant='stacked'
                />
            </div>
        </div>
    );
}

export {
    PlayerDeck,
};
