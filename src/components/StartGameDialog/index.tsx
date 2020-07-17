import './index.scss';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogTitle,
    TextField,
    TextFieldProps,
} from '@material-ui/core';
import React, { useCallback, useState } from 'react';

export interface StartGameDialogProps extends DialogProps {
    onStart: (newGameId: string) => void;
}

function StartGameDialog(props: StartGameDialogProps) {
    const {
        onStart,
        ...rest
    } = props;

    const [gameId, setGameId] = useState('');

    const handleGameIdChange: TextFieldProps['onChange'] = (event) => {
        let nextGameId = event?.target?.value;
        try {
            const url = new URL(nextGameId);
            if (url.searchParams.get('game')) {
                nextGameId = url.searchParams.get('game') as string;
            }
        } catch (err) {
            // pass
        }
        setGameId(nextGameId);
    };

    const handleJoinGame = useCallback(() => {
        onStart(gameId);
    }, [onStart, gameId]);

    const [isJoining, setIsJoining] = useState(false);

    return (
        <Dialog
            {...rest}
            className='start-join-game'
        >
            <DialogTitle>
                Welcome to Dumbal!
            </DialogTitle>
            <DialogContent>
                {isJoining && (
                    <TextField
                        fullWidth={true}
                        label='Enter a URL or game ID'
                        onChange={handleGameIdChange}
                    />
                )}
            </DialogContent>
            <DialogActions className='start-join-game__actions'>
                {!isJoining && (
                    <Button onClick={() => setIsJoining(true)}>join existing game</Button>
                )}
                {isJoining && (
                    <Button onClick={() => setIsJoining(false)}>back</Button>
                )}
                <Button
                    color='primary'
                    onClick={handleJoinGame}
                    variant='contained'
                >
                    {isJoining
                        ? 'join game'
                        : 'start a new game'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    StartGameDialog,
};
