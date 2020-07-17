import './index.scss';

import { IconButton } from '@material-ui/core';
import React, { ReactNode } from 'react';

import { GAME_STAGE, GameState } from '../../types';
import { ScoreBoardIcon } from '../icons';

export interface HeaderProps {
    onScoreBoardOpen: () => void;
    stage: GameState['stage'];
    roundNumber: GameState['roundNumber'];
    children?: ReactNode;
}

function Header(props: HeaderProps) {
    const {
        onScoreBoardOpen,
        roundNumber,
        stage,
        children,
    } = props;

    const isSetup = stage === GAME_STAGE.SETTING_UP;

    return (
        <header className='game-header'>
            <ul className='game-header__stats'>
                {!isSetup && (
                    <li>
                        round:
                        {' '}
                        {roundNumber !== null ? roundNumber + 1 : null}
                    </li>
                )}
            </ul>
            {children}
            <IconButton
                onClick={onScoreBoardOpen}
                size='small'
            >
                <ScoreBoardIcon
                    fontSize='large'
                />
            </IconButton>
        </header>
    );
}

export {
    Header,
};
