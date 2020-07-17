import './index.scss';

import { Button } from '@material-ui/core';
import clsx from 'clsx';
import without from 'lodash.without';
import React, {
    useCallback,
    useLayoutEffect,
    useState,
} from 'react';

import { Card, GameState } from '../../types';
import { PlayerAvatar } from '../Avatar';
import { PlayingCardsSet } from '../PlayingCardsSet';
import { useWindowSize } from './useWindowSize';

export interface PlayerDeckProps {
    onPickCards?: (cards: Card[]) => void;
    onOpen?: () => void;
    onClose?: () => void;
    /**
     * whether the deck is open or not
     * @default false
     */
    open?: boolean;
    cards: GameState['cards'];
    allowSelectMultiple?: boolean;
    /**
     * @default 'Pick'
     */
    actionLabel?: string;
    showPickAction?: boolean;
    playerNumber?: number | null;
    visibleWhenClosed?: boolean;
}

function PlayerDeck(props: PlayerDeckProps) {
    const {
        onPickCards,
        cards,
        showPickAction,
        actionLabel = 'Pick',
        onOpen,
        onClose,
        open,
        allowSelectMultiple = false,
        playerNumber = null,
        visibleWhenClosed,
    } = props;

    const [selectedIndices, setIndices] = useState<number[]>(cards.length ? [0] : []);

    useLayoutEffect(() => {
        setIndices([]);
    }, [cards]);

    const { size: windowSize } = useWindowSize();

    const handleOpen = useCallback((e) => {
        e.stopPropagation();
        if (!open) {
            onOpen?.();
        }
    }, [onOpen, open]);

    useLayoutEffect(() => {
        if (open && !visibleWhenClosed && cards.length) {
            setIndices([0]);
        }
    }, [cards.length, open, visibleWhenClosed]);

    const handleClose = useCallback(() => {
        setIndices([]);
        onClose?.();
    }, [onClose]);

    const handlePickCards = useCallback((e) => {
        e.stopPropagation();
        onPickCards?.(selectedIndices.map((i) => cards[i]));
        setIndices([]);
        onClose?.();
    }, [cards, onClose, onPickCards, selectedIndices]);

    const handleCardClick = useCallback((e: React.MouseEvent, i: number) => {
        setIndices((prev) => {
            if (allowSelectMultiple) {
                // add card if its not there, remove it if it is
                if (prev.includes(i)) {
                    return without(prev, i);
                }
                return [...prev, i];
            }
            return [i];
        });
        if (open) {
            e.stopPropagation();
        }
    }, [allowSelectMultiple, open]);

    return (
        <div
            className={clsx('playing-cards-deck', {
                'playing-cards-deck--open': open,
                'playing-cards-deck--closed': !open,
                'playing-cards-deck--small': windowSize === 'small',
            })}
            id='playing-cards-deck'
            onClick={handleClose}
            role='presentation'
        >
            <div className='playing-cards-deck__card-preview'>

                <PlayingCardsSet
                    cards={selectedIndices.map((i) => cards[i])}
                    onCardClick={(e) => e.stopPropagation()}
                    selected={[]}
                    size={windowSize === 'small' ? 'medium' : 'large'}
                >
                    {showPickAction && (
                        <Button
                            color='primary'
                            disabled={!selectedIndices.length}
                            onClick={handlePickCards}
                            variant='contained'
                        >
                            {actionLabel}
                            {' '}
                            Card
                            {selectedIndices.length > 1 ? `s (${selectedIndices.length})` : ''}
                        </Button>
                    )}
                </PlayingCardsSet>
            </div>
            {(visibleWhenClosed || open) && (
                <>
                    {/* Player Banner */}
                    <PlayerAvatar player={playerNumber} />
                    <PlayingCardsSet
                        cards={cards}
                        className='playing-cards-deck__list'
                        clipped={true}
                        onCardClick={handleCardClick}
                        onClick={handleOpen}
                        selected={open ? selectedIndices : []}
                        size={windowSize === 'large' ? 'large' : 'medium'}
                    />
                </>
            )}
        </div>
    );
}

export {
    PlayerDeck,
};
