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

import { DEFAULT_MAX_NUMBER_OF_POINTS } from '../../types';

export interface StartGameDialogProps extends DialogProps {
    onStart: (newGameId: string, limit: number) => void;
}

function StartGameDialog(props: StartGameDialogProps) {
    const {
        onStart,
        ...rest
    } = props;

    const [gameId, setGameId] = useState('');
    const [limit, setLimit] = useState(DEFAULT_MAX_NUMBER_OF_POINTS);

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
        onStart(gameId, limit);
    }, [onStart, gameId, limit]);

    const [isJoining, setIsJoining] = useState(false);

    const errorInLimit = limit < 30 || limit > 300;

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
                {!isJoining && (
                    <TextField
                        error={errorInLimit}
                        fullWidth={true}
                        helperText={errorInLimit ? 'Invalid limit. Limit must be between 50-300.' : 'Enter the number of points to play to'}
                        inputProps={{
                            minimum: 50,
                            maximum: 300,
                        }}
                        label='Points limit'
                        onChange={({ target: { value } }) => setLimit(Number(value))}
                        type='number'
                        value={limit}
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
