
import { PlayerStatus, PlayerStatuses } from './types';

export const MAX_ROUNDS = 5;
export const ROUND_TIME_LIMIT = 15; // 7세 아동에게 여유있는 시간 (10 → 15초)
export const FINISH_POSITION = 80;
export const MOVE_AMOUNT = 5; // 더 빠른 이동감 (4 → 5)
export const BOOST_MULTIPLIER = 1.5;
export const SLOW_MULTIPLIER = 0.5; // 밸런스 조정 (0.25 → 0.5)
export const ITEM_EFFECT_DURATION = 2000; // 밸런스 조정 (4초 → 2초)
export const MIN_ITEM_DISTANCE = 15; // Minimum distance between spawned items

export const TEAM_COLORS = {
    cyan: {
        primary: '#0891b2',
        bg: '#ecfeff',
        text: 'text-[#0891b2]',
        bgClass: 'bg-[#0891b2]',
        bgLight: 'bg-[#ecfeff]',
        border: 'border-[#0891b2]',
        hoverBgLight: 'hover:bg-[#ecfeff]',
        hoverBorder: 'hover:border-[#0891b2]',
    },
    purple: {
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
    cyan: { ...INITIAL_PLAYER_STATUS },
    purple: { ...INITIAL_PLAYER_STATUS },
};

export const ITEM_IMAGES: { [key: string]: string } = {
    shield: '/items/shield.png',
    booster: '/items/rocket.png',
    slow: '/items/snail.png',
    ice: '/items/ice.png',
};