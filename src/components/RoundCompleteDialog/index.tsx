import {
    Dialog,
    DialogContent,
    DialogProps,
    DialogTitle,
    Typography,
} from '@material-ui/core';
import React from 'react';

import { GAME_STAGE, GameState, PlayerId } from '../../types';
import { listToSentence } from '../../utilities';
import { PlayerAvatar } from '../Avatar';
import { ExplosionIcon, TrophyIcon } from '../icons';
import { ScoreBoard } from '../ScoreBoard';

export interface RoundCompleteDialogProps extends DialogProps {
    winners: PlayerId[];
    roundEndedBy: PlayerId | null;
    roundNumber: number;
    players: PlayerId[];
    scores: GameState['scores'];
}

function RoundCompleteDialog(props: RoundCompleteDialogProps) {
    const {
        winners,
        roundNumber,
        players,
        scores,
        roundEndedBy,
        ...rest
    } = props;

    const dumballed = !winners.includes(roundEndedBy as PlayerId);
    const playerNumber = players.indexOf(roundEndedBy as PlayerId) + 1;

    let title = `${roundEndedBy} has won the round!`;

    if (dumballed) {
        title = `Oh No! ${roundEndedBy} has been dumballed!`;
    }

    return (
        <Dialog
            {...rest}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <PlayerAvatar
                    player={playerNumber}
                    style={{
                        width: 200,
                        height: 200,
                        margin: '0 auto',
                    }}
                >
                    {dumballed ? <ExplosionIcon style={{ width: '100%', height: '100%' }} /> : <TrophyIcon />}
                </PlayerAvatar>
                {dumballed && (
                    <Typography align='center'>
                        {listToSentence(winners)}
                        {' '}
                        { winners.length > 1 ? 'have' : 'has'}
                        {' '}
                        won the round!
                    </Typography>
                )}
                <ScoreBoard
                    players={players}
                    roundNumber={roundNumber}
                    scores={scores}
                    stage={GAME_STAGE.BETWEEN_ROUNDS}
                />
            </DialogContent>
        </Dialog>
    );
}

export {
    RoundCompleteDialog,
};
