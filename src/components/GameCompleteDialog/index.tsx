import './index.scss';

import {
    Dialog,
    DialogContent,
    DialogProps,
    DialogTitle,
} from '@material-ui/core';
import React from 'react';

import { PlayerId } from '../../types';
import { getPlayerNumber } from '../../utilities';
import { PlayerAvatar } from '../Avatar';
import { TrophyIcon } from '../icons';

export interface GameCompleteDialogProps extends DialogProps {
    players: PlayerId[];
    winnerId: PlayerId;
}

function GameCompleteDialog(props: GameCompleteDialogProps) {
    const {
        players,
        winnerId,
        ...rest
    } = props;
    return (
        <Dialog {...rest} className='game-complete-dialog'>
            <DialogTitle>
                Game is complete!
                {' '}
                {winnerId}
                {' '}
                has won!
            </DialogTitle>
            <DialogContent>

                <PlayerAvatar
                    player={getPlayerNumber(players, winnerId)}
                >
                    <TrophyIcon variant='gold' />

                </PlayerAvatar>
            </DialogContent>
        </Dialog>
    );
}

export {
    GameCompleteDialog,
};
