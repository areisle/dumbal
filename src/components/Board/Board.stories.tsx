import React from 'react';

import { FullSize } from '../../decorators';
import { Board, BoardProps } from '.';

export default {
    component: Board,
    title: 'Board',
    decorators: [FullSize],
};

export const WithEmpty = (props: BoardProps) => (
    <Board {...props} />
);

WithEmpty.args = {
    showEmpty: true,
    players: ['areisle', 'creisle'],
    disabled: [],
    cardCounts: {},
};

export const TwoPlayers = (props: BoardProps) => (
    <Board
        {...props}
        cardCounts={{}}
        disabled={[]}
        players={['areisle', 'creisle']}
    />
);

export const ThreePlayers = (props: BoardProps) => (
    <Board
        {...props}
        cardCounts={{}}
        disabled={[]}
        players={['areisle', 'creisle', 'nreisle']}
    />
);

export const FourPlayers = (props: BoardProps) => (
    <Board
        {...props}
        cardCounts={{}}
        disabled={[]}
        players={['areisle', 'creisle', 'nreisle', 'mreisle']}
    />
);

export const FivePlayers = (props: BoardProps) => (
    <Board
        {...props}
        cardCounts={{}}
        disabled={[]}
        players={['areisle', 'creisle', 'nreisle', 'mreisle', 'kreisle']}
    />
);

export const SixPlayers = (props: BoardProps) => (
    <Board
        {...props}
        cardCounts={{}}
        disabled={[]}
        players={['areisle', 'creisle', 'nreisle', 'mreisle', 'kreisle', 'freisle']}
    />
);
