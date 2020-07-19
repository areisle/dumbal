import './index.scss';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
} from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import React, { useState } from 'react';

import { GameState } from '../../types';
import { Rules } from '../Rules';
import { ScoreBoard } from '../ScoreBoard';

interface MenuProps extends Pick<GameState, 'stage' | 'scores' | 'players' | 'roundNumber' | 'limit'> {
    open: boolean;
    onClose: () => void;
    onRefreshData: () => void;
}

enum TAB {
    SCORES,
    RULES,
}

function Menu(props: MenuProps) {
    const {
        open,
        onClose,
        stage,
        scores,
        players,
        roundNumber,
        onRefreshData,
        limit,
    } = props;

    const [activeTab, setActiveTab] = useState(TAB.SCORES);

    const handleTabChange = (_: any, nextTab: number) => {
        setActiveTab(nextTab);
    };

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRefreshData();
    };

    return (
        <Dialog
            className='game-menu'
            onClose={onClose}
            open={open}
        >
            <DialogTitle
                disableTypography={true}
            >

                <Tabs
                    indicatorColor='primary'
                    onChange={handleTabChange}
                    textColor='primary'
                    value={activeTab}
                >
                    <Tab label='Scores' value={TAB.SCORES} />
                    <Tab label='Rules' value={TAB.RULES} />
                </Tabs>
            </DialogTitle>
            <DialogContent>
                {(activeTab === TAB.SCORES) && (
                    <ScoreBoard
                        allowSelectRound={true}
                        limit={limit}
                        players={players}
                        roundNumber={roundNumber}
                        scores={scores}
                        stage={stage}
                    />
                )}
                {(activeTab === TAB.RULES) && (
                    <Rules />
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    endIcon={<Refresh />}
                    onClick={handleRefresh}
                >
                    refresh game state
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export {
    Menu,
};
