import React from 'react';

import { DialogDecorator, dialogDecoratorArgs } from '../../decorators';
import { RoundCompleteDialog, RoundCompleteDialogProps } from '.';

export default {
    component: RoundCompleteDialog,
    decorators: [DialogDecorator],
    title: 'dialogs/RoundCompleteDialog',
};

export const Basic = (props: RoundCompleteDialogProps) => (
    <RoundCompleteDialog
        {...props}
        {...dialogDecoratorArgs}
    />
);

Basic.args = {
    open: true,
    winners: ['nreisle'],
    roundEndedBy: 'creisle',
    roundNumber: 0,
    scores: [
        {
            areisle: 15,
            creisle: 25,
            nreisle: 0,
        },
    ],
    players: ['areisle', 'creisle', 'nreisle'],
};
