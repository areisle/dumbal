import './index.scss';

import { Star } from '@material-ui/icons';
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
     * whether the avatar represents the leader of the trick
     * @default false
     */
    leader?: boolean;
    /**
     * avatar that does not yet contain a player
     * @default false
     */
    empty?: boolean;
    style?: HTMLProps<HTMLDivElement>['style'];
    className?: string;
    disabled?: boolean;
}

function PlayerAvatar(props: PlayerAvatarProps) {
    const {
        player,
        children,
        active,
        leader,
        empty,
        disabled,
        className,
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
                    'avatar--leader': leader,
                    'avatar--empty': empty,
                    'avatar--disabled': disabled,
                },
            )}
        >
            {children}
            {leader && (
                <Star
                    className='avatar--leader__icon'
                    fontSize='large'
                />
            )}
        </div>
    );
}

export {
    PlayerAvatar,
};
