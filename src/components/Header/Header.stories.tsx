import React from 'react';

import { GAME_STAGE } from '../../types';
import { Header, HeaderProps } from '.';

export default {
    component: Header,
    title: 'Header',
};

export const Example = (props: HeaderProps) => (
    <Header
        {...props}
    />
);

export const SettingUp = (props: HeaderProps) => (
    <Header
        {...props}
        stage={GAME_STAGE.SETTING_UP}
    />
);

export const Playing = (props: HeaderProps) => (
    <Header
        {...props}
        roundNumber={0}
        stage={GAME_STAGE.PLAYING_CARDS}
    />
);
