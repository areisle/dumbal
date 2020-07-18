/* eslint-disable react/no-array-index-key */
import './index.scss';

import { Button, Typography } from '@material-ui/core';
import { Done } from '@material-ui/icons';
import clsx from 'clsx';
import React, { useCallback } from 'react';

import {
    Card, GAME_STAGE, GameState, PlayerId,
} from '../../types';
import { Board, BoardChildRenderProps } from '../Board';
import { LoserIcon, TrophyIcon } from '../icons';
import { PlayingCardsSet } from '../PlayingCardsSet';

export interface GameBoardProps {
    activePlayer: PlayerId | null;
    players: PlayerId[];
    playerId: PlayerId | null;
    stage: GAME_STAGE;
    discard: Record<PlayerId, Card[]>;
    onOpenPickFromDiscardDialog: () => void;
    roundEndedBy: GameState['roundEndedBy'];
    winners: PlayerId[];
    ready: GameState['ready'];
    out: PlayerId[];
    cardCounts: GameState['cardCounts'];
}

interface AvatarContentProps extends BoardChildRenderProps {
    isCurrent: boolean;
    stage: GAME_STAGE;
    cards: Card[] | null;
    /**
     * if the active player is the main player, the action buttons should be visible/clickable
     */
    showActions: boolean;
    onClick: any;
    isWinner: boolean;
    isLoser: boolean;
    ready: boolean;
    /**
     * the main player is ready
     */
    showReady: boolean;
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
        onClick,
        isWinner,
        isLoser,
        ready,
        showReady,
    } = props;

    let content: JSX.Element | null = null;
    if (stage === GAME_STAGE.SETTING_UP) {
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
    } else if (stage === GAME_STAGE.PICKING_CARD && isPreviouslyActivePlayer && showActions) {
        content = (
            <Button
                color='primary'
                disabled={!cards?.length}
                onClick={onClick}
                size='small'
                variant='contained'
            >
                Pick From Discard
            </Button>
        );
    } else if (stage === GAME_STAGE.BETWEEN_ROUNDS && showReady && ready) {
        content = (
            <>
                {isCurrent ? 'you\'re ready' : `${playerId} is ready`}
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
    } else if (stage === GAME_STAGE.BETWEEN_ROUNDS && showReady) {
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
            <PlayingCardsSet
                cards={cards}
                className={clsx(
                    'game-board__avatar-content',
                    `game-board__avatar-content--${cards.length}-cards`,
                )}
                size='flexible'
            >
                {content}
            </PlayingCardsSet>
        );
    }

    return content;
};

function GameBoard(props: GameBoardProps) {
    const {
        activePlayer,
        playerId,
        players,
        stage,
        discard,
        onOpenPickFromDiscardDialog,
        winners,
        roundEndedBy,
        ready,
        out,
        cardCounts,
    } = props;

    const renderContent = useCallback((childProps: BoardChildRenderProps) => (
        <AvatarContent
            {...childProps}
            cards={childProps.playerId ? discard[childProps.playerId] : null}
            isCurrent={childProps.playerId === playerId}
            isLoser={!winners.includes(childProps.playerId as PlayerId) && roundEndedBy === childProps.playerId}
            isWinner={winners.includes(childProps.playerId as PlayerId)}
            onClick={onOpenPickFromDiscardDialog}
            ready={Boolean(ready[childProps.playerId as PlayerId])}
            showActions={activePlayer === playerId}
            showReady={Boolean(ready[playerId as PlayerId])}
            stage={stage}
        />
    ), [activePlayer, discard, onOpenPickFromDiscardDialog, playerId, ready, roundEndedBy, stage, winners]);

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
