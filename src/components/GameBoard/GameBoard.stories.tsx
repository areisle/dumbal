import React from 'react';

import { FullSize } from '../../decorators';
import { GAME_STAGE, SUIT } from '../../types';
import { GameBoard, GameBoardProps } from '.';

export default {
    component: GameBoard,
    decorators: [FullSize],
    title: 'GameBoard',
};

export const SettingUp = (props: GameBoardProps) => (
    <GameBoard {...props} />
);

SettingUp.args = {
    players: [],
    stage: GAME_STAGE.SETTING_UP,
};

export const PlayingCards = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='creisle'
        discard={{}}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PLAYING_CARDS}
    />
);

export const PlayingCardsAsCurrentPlayer = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='areisle'
        discard={{}}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PLAYING_CARDS}
    />
);

export const PickingCard = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='creisle'
        discard={{
            areisle: [
                { suit: SUIT.HEARTS, number: 7 },
                { suit: SUIT.HEARTS, number: 8 },
                { suit: SUIT.CLUBS, number: 9 },
            ],
        }}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PICKING_CARD}
    />
);

export const PickingCardCurrentPlayer = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='areisle'
        discard={{
            nreisle: [
                { suit: SUIT.HEARTS, number: 13 },
                { suit: SUIT.DIAMONDS, number: 13 },
            ],
        }}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PICKING_CARD}
    />
);

export const PickingCardDiscard5 = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='areisle'
        discard={{
            nreisle: [
                { suit: SUIT.HEARTS, number: 13 },
                { suit: SUIT.DIAMONDS, number: 12 },
                { suit: SUIT.CLUBS, number: 11 },
                { suit: SUIT.SPADES, number: 10 },
                { suit: SUIT.DIAMONDS, number: 19 },
            ],
        }}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PICKING_CARD}
    />
);

export const PickingCardDiscard3 = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='areisle'
        discard={{
            nreisle: [
                { suit: SUIT.HEARTS, number: 13 },
                { suit: SUIT.DIAMONDS, number: 12 },
                { suit: SUIT.CLUBS, number: 11 },
            ],
        }}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PICKING_CARD}
    />
);

export const PickingCardDiscard4 = (props: GameBoardProps) => (
    <GameBoard
        {...props}
        activePlayer='areisle'
        discard={{
            nreisle: [
                { suit: SUIT.HEARTS, number: 13 },
                { suit: SUIT.DIAMONDS, number: 12 },
                { suit: SUIT.CLUBS, number: 11 },
                { suit: SUIT.CLUBS, number: 10 },
            ],
        }}
        playerId='areisle'
        players={['areisle', 'creisle', 'nreisle']}
        stage={GAME_STAGE.PICKING_CARD}
    />
);
