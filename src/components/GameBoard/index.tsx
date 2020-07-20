/* eslint-disable react/no-array-index-key */
import './index.scss';

import { Button, Typography } from '@material-ui/core';
import { Done } from '@material-ui/icons';
import React, { useCallback, useEffect, useState } from 'react';

import {
    Card,
    GAME_STAGE, GameState, PlayerId,
} from '../../types';
import { getCardName } from '../../utilities';
import { Board, BoardChildRenderProps } from '../Board';
import { CardSelector } from '../CardSelector';
import { LoserIcon, TrophyIcon } from '../icons';
import { PlayingCardsSet } from '../PlayingCardsSet';

export interface GameBoardProps {
    activePlayer: PlayerId | null;
    players: PlayerId[];
    playerId: PlayerId | null;
    stage: GAME_STAGE;
    discard: Record<PlayerId, Card[]>;
    onPickFromDiscard?: (card: Card) => void;
    roundEndedBy?: GameState['roundEndedBy'];
    winners?: PlayerId[];
    ready?: GameState['ready'];
    out: PlayerId[];
    cardCounts?: GameState['cardCounts'];
}

interface AvatarContentProps extends BoardChildRenderProps {
    isCurrent: boolean;
    stage: GAME_STAGE;
    cards: Card[] | null;
    /**
     * if the active player is the main player, the action buttons should be visible/clickable
     */
    showActions: boolean;
    onPickFromDiscard?: (card: Card) => void;
    isWinner: boolean;
    isLoser: boolean;
    ready: boolean;
    /**
     * the main player is ready
     */
    showReady: boolean;
    out: boolean;
}

const AvatarContent = (props: AvatarContentProps) => {
    const {
        playerId,
        isActive,
        isCurrent,
        stage,
        isPreviouslyActivePlayer,
        cards,
        showActions,
        onPickFromDiscard,
        isWinner,
        isLoser,
        ready,
        showReady,
        out,
    } = props;

    const allowPickFromDiscard = (
        stage === GAME_STAGE.PICKING_CARD
        && isPreviouslyActivePlayer
        && showActions
        && !out
    );

    const [discardOpen, setDiscardOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    useEffect(() => {
        setSelectedCard(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cards]);

    const handleCardSelected = (card: Card) => {
        setDiscardOpen(true);
        if (allowPickFromDiscard) {
            setSelectedCard(card);
        }
    };

    let content: JSX.Element | null = null;
    if (stage === GAME_STAGE.SETTING_UP && playerId) {
        content = (
            <Typography>{playerId}</Typography>
        );
    } else if (stage === GAME_STAGE.PLAYING_CARDS && isActive && isCurrent) {
        content = (
            <Typography>it&apos;s your turn to discard....</Typography>
        );
    } else if (stage === GAME_STAGE.PLAYING_CARDS && isActive) {
        content = (
            <Typography>
                {playerId}
                {' '}
                is discarding....
            </Typography>
        );
    } else if (stage === GAME_STAGE.PICKING_CARD && isActive && isCurrent) {
        content = (
            <Typography>it&apos;s your turn to pick a card....</Typography>
        );
    } else if (stage === GAME_STAGE.PICKING_CARD && isActive) {
        content = (
            <Typography>
                {playerId}
                {' '}
                is picking up....
            </Typography>
        );
    } else if (allowPickFromDiscard) {
        content = (
            <Button
                color='primary'
                disabled={!cards?.length}
                onClick={() => cards && handleCardSelected(cards[0])}
                size='small'
                variant='contained'
            >
                Pick From Discard
            </Button>
        );
    } else if (stage === GAME_STAGE.BETWEEN_ROUNDS && showReady && ready && !out) {
        content = (
            <>
                <Typography>{isCurrent ? 'you\'re ready' : `${playerId} is ready`}</Typography>
                <Done
                    fontSize='large'
                    style={{
                        fontSize: '3rem',
                        fill: 'limegreen',
                        filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0))',
                    }}
                />
            </>
        );
    } else if (stage === GAME_STAGE.BETWEEN_ROUNDS && showReady && !out) {
        content = (
            <Typography>
                waiting for
                {' '}
                {playerId}
                ...
            </Typography>
        );
    } else if ([GAME_STAGE.BETWEEN_ROUNDS, GAME_STAGE.COMPLETE].includes(stage) && isWinner) {
        content = <TrophyIcon />;
    } else if ([GAME_STAGE.BETWEEN_ROUNDS, GAME_STAGE.COMPLETE].includes(stage) && isLoser) {
        content = (
            <LoserIcon />
        );
    }

    if (
        cards?.length
        && !(isActive && stage === GAME_STAGE.PLAYING_CARDS)
        && !showReady
    ) {
        content = (
            <>
                <PlayingCardsSet
                    cards={cards}
                    onCardClick={(e, card) => handleCardSelected(card)}
                >
                    {content}
                </PlayingCardsSet>
                <CardSelector
                    cards={cards}
                    footer={allowPickFromDiscard && (
                        <Button
                            color='primary'
                            disabled={!selectedCard}
                            onClick={() => selectedCard && onPickFromDiscard?.(selectedCard)}
                            size='small'
                            variant='contained'
                        >
                            {selectedCard ? `Select ${getCardName(selectedCard)}` : 'No Card Selected'}
                        </Button>
                    )}
                    onCardClicked={handleCardSelected}
                    onClose={() => setDiscardOpen(false)}
                    open={discardOpen}
                    selectable={allowPickFromDiscard}
                    selected={selectedCard ? [selectedCard] : []}
                    variant='grid'
                />
            </>
        );
    }

    return (
        <div className='game-board__avatar-content'>
            {content}
        </div>
    );
};

function GameBoard(props: GameBoardProps) {
    const {
        activePlayer,
        playerId,
        players,
        stage,
        discard,
        onPickFromDiscard,
        winners = [],
        roundEndedBy,
        ready = {},
        out,
        cardCounts = {},
    } = props;

    const renderContent = useCallback((childProps: BoardChildRenderProps) => (
        <AvatarContent
            {...childProps}
            cards={childProps.playerId ? discard[childProps.playerId] : null}
            isCurrent={childProps.playerId === playerId}
            isLoser={!winners.includes(childProps.playerId as PlayerId) && roundEndedBy === childProps.playerId}
            isWinner={winners.includes(childProps.playerId as PlayerId)}
            onPickFromDiscard={onPickFromDiscard}
            out={out.includes(childProps.playerId as PlayerId)}
            ready={Boolean(ready[childProps.playerId as PlayerId])}
            showActions={activePlayer === playerId}
            showReady={Boolean(ready[playerId as PlayerId])}
            stage={stage}
        />
    ), [activePlayer, discard, onPickFromDiscard, out, playerId, ready, roundEndedBy, stage, winners]);

    return (
        <Board
            activePlayer={activePlayer}
            cardCounts={cardCounts}
            className='game-board'
            disabled={out}
            players={players}
            showEmpty={stage === GAME_STAGE.SETTING_UP}
        >
            {renderContent}
        </Board>
    );
}

export {
    GameBoard,
};
