import './index.scss';

import clsx from 'clsx';
import React, { HTMLProps, ReactNode } from 'react';

export interface PlayerAvatarProps {
    /** the number of the player */
    player: number | null;
    /**
     * any content to place inside the avatar (icon, text etc.)
     */
    children?: ReactNode;
    /**
     * whether the avatar represents the active player
     * (the player whose turn it currently is)
     * @default false
     */
    active?: boolean;
    /**
     * avatar that does not yet contain a player
     * @default false
     */
    empty?: boolean;
    style?: HTMLProps<HTMLDivElement>['style'];
    className?: string;
    disabled?: boolean;
    count?: number;
}

function PlayerAvatar(props: PlayerAvatarProps) {
    const {
        player,
        children,
        active,
        empty,
        disabled,
        className,
        count,
        ...rest
    } = props;

    return (
        <div
            {...rest}
            className={clsx(
                'avatar',
                'avatar--square',
                className,
                {
                    [`avatar--player-${player}`]: player,
                    'avatar--active': active,
                    'avatar--empty': empty,
                    'avatar--disabled': disabled,
                    'avatar--count': count,
                },
            )}
        >
            {children}
            {Boolean(count) && (
                <div
                    className='avatar--count__icon'
                >
                    {count}
                </div>
            )}
        </div>
    );
}

export {
    PlayerAvatar,
};
