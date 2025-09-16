
import { PlayerStatus, PlayerStatuses } from './types';

export const MAX_ROUNDS = 5;
export const ROUND_TIME_LIMIT = 15;
export const FINISH_POSITION = 88;
export const MOVE_AMOUNT = 4;
export const BOOST_MULTIPLIER = 2.5;
export const SLOW_MULTIPLIER = 0.2;
export const ITEM_EFFECT_DURATION = 3000; // 3 seconds
export const MIN_ITEM_DISTANCE = 15; // Minimum distance between spawned items

export const TEAM_COLORS = {
    red: {
        primary: '#FF5E5E',
        bg: '#FFEBEB',
        text: 'text-[#FF5E5E]',
        bgClass: 'bg-[#FF5E5E]',
        bgLight: 'bg-[#FFEBEB]',
        border: 'border-[#FF5E5E]',
        hoverBgLight: 'hover:bg-[#FFEBEB]',
        hoverBorder: 'hover:border-[#FF5E5E]',
    },
    blue: {
        primary: '#5B9DFF',
        bg: '#EBF5FF',
        text: 'text-[#5B9DFF]',
        bgClass: 'bg-[#5B9DFF]',
        bgLight: 'bg-[#EBF5FF]',
        border: 'border-[#5B9DFF]',
        hoverBgLight: 'hover:bg-[#EBF5FF]',
        hoverBorder: 'hover:border-[#5B9DFF]',
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

export const ITEM_EMOJIS: { [key: string]: string } = {
    shield: '🛡️',
    booster: '🚀',
    slow: '🐌',
    ice: '🧊',
};