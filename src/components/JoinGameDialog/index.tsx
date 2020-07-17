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
import React, { useState } from 'react';

export interface JoinGameDialogProps extends DialogProps {
    onJoin: (username: string) => void;
}

function JoinGameDialog(props: JoinGameDialogProps) {
    const {
        onJoin,
        ...rest
    } = props;
    const [username, setUsername] = useState<string | null>(null);

    const handleChange: TextFieldProps['onChange'] = (e) => {
        const { value } = e.target;
        setUsername(value || null);
    };

    const handleBetPlaced = () => {
        onJoin(username as string);
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.keyCode === 13) {
            handleBetPlaced();
        }
    };

    return (
        <Dialog {...rest}>
            <DialogTitle>
                Welcome to Dumbal!
            </DialogTitle>
            <DialogContent>
                <TextField
                    aria-label='username'
                    autoFocus={true}
                    fullWidth={true}
                    id='username'
                    label='Enter a username for your player'
                    onChange={handleChange}
                    onKeyDown={handleEnter}
                    style={{
                        minWidth: 250,
                    }}
                    value={username || ''}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color='primary'
                    disabled={!username}
                    onClick={handleBetPlaced}
                    variant='contained'
                >
                    Join game
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    JoinGameDialog,
};
