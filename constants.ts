
import { PlayerStatus, PlayerStatuses } from './types';

export const MAX_ROUNDS = 5;
export const ROUND_TIME_LIMIT = 10;
export const FINISH_POSITION = 80;
export const MOVE_AMOUNT = 4;
export const BOOST_MULTIPLIER = 2.5;
export const SLOW_MULTIPLIER = 0.2;
export const ITEM_EFFECT_DURATION = 3000; // 3 seconds
export const MIN_ITEM_DISTANCE = 15; // Minimum distance between spawned items

export const TEAM_COLORS = {
    red: {
        primary: '#0891b2',
        bg: '#ecfeff',
        text: 'text-[#0891b2]',
        bgClass: 'bg-[#0891b2]',
        bgLight: 'bg-[#ecfeff]',
        border: 'border-[#0891b2]',
        hoverBgLight: 'hover:bg-[#ecfeff]',
        hoverBorder: 'hover:border-[#0891b2]',
    },
    blue: {
        primary: '#9333ea',
        bg: '#faf5ff',
        text: 'text-[#9333ea]',
        bgClass: 'bg-[#9333ea]',
        bgLight: 'bg-[#faf5ff]',
        border: 'border-[#9333ea]',
        hoverBgLight: 'hover:bg-[#faf5ff]',
        hoverBorder: 'hover:border-[#9333ea]',
    },
};

export const INITIAL_PLAYER_STATUS: PlayerStatus = {
    hasShield: false,
    isBoosted: false,
    isSlowed: false,
    isFrozen: false,
    isWinner: false,
    penalty: false,
};

export const INITIAL_PLAYER_STATUSES: PlayerStatuses = {
    red: { ...INITIAL_PLAYER_STATUS },
    blue: { ...INITIAL_PLAYER_STATUS },
};

export const ITEM_IMAGES: { [key: string]: string } = {
    shield: '/items/shield.png',
    booster: '/items/rocket.png',
    slow: '/items/snail.png',
    ice: '/items/ice.png',
};