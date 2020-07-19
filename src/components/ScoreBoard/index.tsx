import './index.scss';
import '../Avatar/index.scss';

import {
    NativeSelect,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';

import { GameState } from '../../types';
import { getTotalScores } from '../../utilities';

export interface ScoreBoardProps extends Pick<GameState, 'scores' | 'players' | 'roundNumber' | 'stage' | 'limit'> {
    allowSelectRound?: boolean;
}

function ScoreBoard(props: ScoreBoardProps) {
    const {
        roundNumber,
        players,
        allowSelectRound = false,
        scores,
        limit,
    } = props;

    const [selectedRound, setSelectedRound] = useState(roundNumber);

    const handleSwapSelectedRound = (e: any) => {
        setSelectedRound(Number(e.target.value));
    };

    const totalScores = useMemo(() => getTotalScores(players, scores), [scores, players]);

    useEffect(() => {
        setSelectedRound(roundNumber);
    }, [roundNumber]);

    const rows = players.map((playerId, index) => (
        <TableRow key={index}>
            <TableCell
                className={`avatar avatar--player-${index + 1}`}
            >
                {playerId}
            </TableCell>
            <TableCell align='right'>
                {selectedRound !== null && scores[selectedRound]?.[playerId]}
            </TableCell>
            <TableCell align='right'>
                {totalScores[playerId]}
                {' '}
                /
                {' '}
                {limit}
            </TableCell>
        </TableRow>
    ));

    return (
        <Table
            className='score-board'
            onClick={(e) => e.stopPropagation()}
            size='small'
            stickyHeader={true}
        >
            <TableHead>
                {(allowSelectRound && roundNumber !== null) && (
                    <TableRow>
                        <TableCell colSpan={3}>
                            <NativeSelect
                                fullWidth={true}
                                onChange={handleSwapSelectedRound}
                                value={selectedRound}
                            >
                                {Array(roundNumber + 1).fill(null).map((_, index) => (
                                    <option
                                        key={index}
                                        value={index}
                                    >
                                        round
                                        {' '}
                                        {index + 1}
                                        {' '}
                                        {index === roundNumber && '(current)'}
                                    </option>
                                ))}
                            </NativeSelect>
                        </TableCell>
                    </TableRow>
                )}
                <TableRow>
                    <TableCell size='medium'>player</TableCell>
                    <TableCell className='table-cell--skinny'>
                        round score
                    </TableCell>
                    <TableCell className='table-cell--skinny'>overall total</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
        </Table>
    );
}

export {
    ScoreBoard,
};
