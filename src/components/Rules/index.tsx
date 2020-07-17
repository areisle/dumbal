import {
    Card, CardContent, Typography,
} from '@material-ui/core';
import React from 'react';

function Rules() {
    return (
        <Card>
            <CardContent>
                <Typography variant='h4'>Game Rules</Typography>
                <Typography>
                    not finished writing yet. in the meantime, they can be found on this
                    {' '}
                    <a
                        href='http://boardgamethoughts.blogspot.com/2014/05/dumbal-nepalese-card-game.html'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        blog post
                    </a>
                </Typography>
            </CardContent>
        </Card>
    );
}

export {
    Rules,
};
