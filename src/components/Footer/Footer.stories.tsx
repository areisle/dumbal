import React from 'react';

import { Footer, FooterProps } from '.';

export default {
    component: Footer,
    title: 'Footer',
    args: {
        gameId: '12vK25aQx',
        disabled: false,
        showAllInButton: false,
        showReadyButton: false,
    },
};

export const SettingUp = (props: FooterProps) => (
    <Footer
        {...props}
    />
);

SettingUp.args = {
    showAllInButton: true,
};

export const NotEnoughPlayers = (props: FooterProps) => (
    <Footer
        {...props}
        disabled={true}
        showAllInButton={true}
    />
);

export const NogameId = (props: FooterProps) => (
    <Footer
        {...props}
        gameId={null}
    />
);

export const SettingUpOtherPlayer = (props: FooterProps) => (
    <Footer
        {...props}
        showAllInButton={false}
    />
);

export const WaitingForPlayer = (props: FooterProps) => (
    <Footer
        {...props}
        showReadyButton={true}
    />
);
