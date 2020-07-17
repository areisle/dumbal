import React from 'react';

import { GAME_STAGE } from '../../types';
import { ScoreBoard, ScoreBoardProps } from '.';

export default {
    component: ScoreBoard,
    title: 'ScoreBoard',
    args: {
        players: ['areisle', 'creisle', 'nreisle'],
        scores: [],
        stage: GAME_STAGE.SETTING_UP,
        roundNumber: null,
    },
};

export const SettingUp = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
    />
);

export const AfterFirstRound = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        roundNumber={1}
        scores={[
            {
                areisle: 12,
                creisle: 15,
                nreisle: 0,
            },
        ]}
        stage={GAME_STAGE.PLAYING_CARDS}
    />
);

export const EndOfFirstRound = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        roundNumber={0}
        scores={[
            {
                areisle: 12,
                creisle: 15,
                nreisle: 0,
            },
        ]}
        stage={GAME_STAGE.BETWEEN_ROUNDS}
    />
);

export const EndOfThirdRound = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        roundNumber={2}
        scores={[
            {
                areisle: 12,
                creisle: 15,
                nreisle: 0,
            },
            {
                areisle: 2,
                creisle: 0,
                nreisle: 23,
            },
            {
                areisle: 25,
                creisle: 12,
                nreisle: 4,
            },
        ]}
        stage={GAME_STAGE.BETWEEN_ROUNDS}
    />
);

export const MaxPlayers = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        players={[
            'areisle',
            'creisle',
            'nreisle',
            'mreisle',
            'kreisle',
            'freisle',
        ]}
    />
);

export const LongNames = (props: ScoreBoardProps) => (
    <ScoreBoard
        {...props}
        players={[
            'blargh monkeys the second',
            'hello my name is????',
            'reallylongnamewithoutbreak',
        ]}
    />
);
