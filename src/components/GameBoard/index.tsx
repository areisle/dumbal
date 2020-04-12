import './index.scss';

import React, { useContext, ReactNode } from 'react';
import { PlayerAvatar } from '../Avatar';
import { GameContext } from '../../Context';
import isNil from 'lodash.isnil';
import { Done } from '@material-ui/icons';
import { PlayingCard } from '../PlayingCard';

const MAX_NUMBER_OF_PLAYERS = 6;

function Fillers(props: { players: number, show: boolean; }) {
    const { players, show } = props;
    if (!show) {
        return null;
    }

    const shells = new Array(MAX_NUMBER_OF_PLAYERS - players).fill(null).map((_, index) => (
        <PlayerAvatar
            key={index + players}
            player={index + players + 1}
            empty={true}
        />
    ))
    return (
        <>{shells}</>
    )
}

function GameBoard() {
    const { 
        activePlayer,
        playerNumber,
        players,
        roundNumber,
        scores,
        stage,
        trickCards,
        trickLeader,
    } = useContext(GameContext);
    
    const isSetup = stage === 'awaiting-players';
    const isPlaying = stage === 'playing';
    const isBetting = stage === 'betting';

    const avatars = players.map((username, index) => {
        const { bet } = scores[roundNumber]?.[index] ?? {};

        let content: ReactNode = null;
        const isActive = activePlayer === index;
        const isCurrent = playerNumber === index;
        
        if (isSetup) {
            content = username
        } else if (isBetting && isNil(bet)) {
            content = 'placing bet...';
        } else if (isBetting) {
            content = (
                <Done 
                    fontSize='large' 
                    style={{
                        fontSize: '3rem',
                        fill: 'limegreen',
                        filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0))'
                    }}
                />
            )
        } else if (isPlaying && trickCards[index]) {
            content = (
                <PlayingCard
                    {...trickCards[index]}
                    size='flexible'
                />
            )
        } else if (isPlaying && isActive && isCurrent) {
            content = 'it\'s your turn to pick a card...';
        } else if (isPlaying && isActive) {
            content = 'picking a card...';

        }
        return (
            <PlayerAvatar
                key={index}
                active={index === activePlayer}
                leader={trickLeader === index}
                player={index + 1}
            >
                {content}
            </PlayerAvatar>
        )
    });

    return (
        <div 
            className={`
                game-board
                game-board--${isSetup ? MAX_NUMBER_OF_PLAYERS : players.length}-players
            `}
        >
            {avatars}
            <Fillers
                players={players.length}
                show={stage === 'awaiting-players'}
            />
        </div>
    )
}

export {
    GameBoard,
}