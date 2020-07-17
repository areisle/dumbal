import './Board.scss';

import useComponentSize from '@rehooks/component-size';
import clsx from 'clsx';
import React, { ReactNode, useMemo, useRef } from 'react';

import { MAX_NUMBER_OF_PLAYERS, PlayerId } from '../../types';
import { PlayerAvatar } from '../Avatar';

export interface BoardChildRenderProps {
    playerId: PlayerId | null;
    isActive: boolean;
    isLeader: boolean;
    isPreviouslyActivePlayer: boolean;
}

export interface BoardProps {
    /**
     * @default false
     */
    showEmpty?: boolean;
    players: PlayerId[];
    leader?: PlayerId | null;
    activePlayer?: PlayerId | null;
    children?: (props: BoardChildRenderProps) => ReactNode;
    className?: string;
    disabled: PlayerId[];
}

interface CustomCSSProperties extends React.CSSProperties {
    '--row-size': string;
    '--row-count': number;
    '--col-size': string;
    '--grid-square-size': string;
    '--col-count': number;
}

const nextPlayerId = (players: PlayerId[], player: PlayerId | null) => (
    player && players[(players.indexOf(player) + 1) % players.length]
);

const getGridProperties = (
    boardWidth: number,
    boardHeight: number,
    playerCount: number,
): CustomCSSProperties => {
    const aspectRatio = boardWidth / boardHeight;
    const gap = 10;
    let columns = 1;
    let rows = playerCount;
    if (playerCount === 2 && aspectRatio > 1) {
        // 2 x 1
        columns = 2;
        rows = 1;
    } else if (playerCount === 2) {
        // 1 x 2
    } else if ([3, 4].includes(playerCount)) {
        // 2 x 2
        columns = 2;
        rows = 2;
    } else if ([5, 6].includes(playerCount) && aspectRatio > 1) {
        // 3 x 2
        columns = 3;
        rows = 2;
    } else if ([5, 6].includes(playerCount)) {
        // 2 x 3
        columns = 2;
        rows = 3;
    }

    const maxHeight = (boardHeight - (rows + 1) * gap) / rows;
    const maxWidth = (boardWidth - (columns + 1) * gap) / columns;

    let rowSize = '1fr';
    let colSize = '1fr';
    let minSize;
    if (maxHeight > maxWidth) {
        rowSize = `${maxWidth}px`;
        minSize = rowSize;
    } else {
        colSize = `${maxHeight}px`;
        minSize = colSize;
    }

    return {
        '--row-size': rowSize,
        '--grid-square-size': minSize,
        '--row-count': rows,
        '--col-size': colSize,
        '--col-count': columns,
    };
};

function Board(props: BoardProps) {
    const {
        showEmpty = false,
        players,
        children,
        activePlayer,
        leader,
        className,
        disabled,
    } = props;

    const totalPlayers = showEmpty ? MAX_NUMBER_OF_PLAYERS : players.length;

    const boardRef = useRef<HTMLDivElement | null>(null);
    const boardSize = useComponentSize(boardRef);

    const avatars = useMemo(() => (new Array(totalPlayers)).fill(null).map((_, i) => {
        const playerId = players[i];
        const isDisabled = disabled.includes(playerId);
        const isActive = Boolean(playerId && playerId === activePlayer);
        const isLeader = Boolean(playerId && playerId === leader);
        return (
            <PlayerAvatar
                key={playerId ?? `index-${i}`}
                active={isActive}
                disabled={isDisabled}
                empty={!playerId}
                leader={isLeader}
                player={i + 1}
            >
                {children?.({
                    isActive,
                    isLeader,
                    playerId,
                    isPreviouslyActivePlayer: nextPlayerId(players, playerId) === activePlayer,
                })}
            </PlayerAvatar>
        );
    }), [activePlayer, children, disabled, leader, players, totalPlayers]);

    const styles = useMemo(() => getGridProperties(
        boardSize.width,
        boardSize.height,
        totalPlayers,
    ), [boardSize.height, boardSize.width, totalPlayers]);

    return (
        <div
            ref={boardRef}
            className={clsx(
                'board',
                `board--${totalPlayers}-players`,
                className,
                { 'board--landscape': boardSize.width > boardSize.height },
            )}
            style={styles}
        >
            {avatars}
        </div>
    );
}

export {
    Board,
    getGridProperties,
};
