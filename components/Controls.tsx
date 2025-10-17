import React from 'react';
import { Team, PlayerStatuses, LightColor } from '../types';
import { TEAM_COLORS } from '../constants';

type ControlsProps = {
    onGo: (team: Team) => void;
    playerStatus: PlayerStatuses;
    isGameActive: boolean;
    currentLight: LightColor;
};

const ControlButton: React.FC<{
    team: Team;
    onClick: () => void;
    disabled: boolean;
    currentLight: LightColor;
}> = ({ team, onClick, disabled, currentLight }) => {
    const teamColor = TEAM_COLORS[team];
    // GO 버튼을 트랙 가로 너비 기준 가운데로 배치 (트랙이 w-2/3이므로)
    const leftPosition = team === 'red' ? 'left-[35%]' : 'left-[65%]';
    const pulseAnimation = !disabled && currentLight === 'green' ? 'animation-go-pulse button-green-glow' : '';

    const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!disabled) {
            onClick();
        }
    };

    // Vivid button colors
    const buttonStyle = team === 'red' 
        ? {
            background: 'radial-gradient(circle at 40% 40%, #0891b2 0%, #0e7490 100%)',
            boxShadow: disabled 
                ? 'inset 0 2px 4px rgba(255,255,255,.2), inset 0 -2px 4px rgba(0,0,0,.3), 0 2px 4px rgba(0,0,0,.2)'
                : 'inset 0 4px 8px rgba(255,255,255,.5), inset 0 -4px 8px rgba(0,0,0,.25), inset 0 -2px 0 rgba(255,255,255,.35), 0 8px 16px rgba(8,145,178,.4)',
            border: '4px solid rgba(255,255,255,.3)'
        }
        : {
            background: 'radial-gradient(circle at 40% 40%, #9333ea 0%, #7c3aed 100%)',
            boxShadow: disabled 
                ? 'inset 0 2px 4px rgba(255,255,255,.2), inset 0 -2px 4px rgba(0,0,0,.3), 0 2px 4px rgba(0,0,0,.2)'
                : 'inset 0 4px 8px rgba(255,255,255,.5), inset 0 -4px 8px rgba(0,0,0,.25), inset 0 -2px 0 rgba(255,255,255,.35), 0 8px 16px rgba(147,51,234,.4)',
            border: '4px solid rgba(255,255,255,.3)'
        };

    return (
        <div className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${leftPosition}`}>
            <button
                onClick={handlePress}
                onTouchStart={handlePress}
                disabled={disabled}
                className={`text-6xl font-bold py-4 px-14 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 disabled:cursor-not-allowed ${pulseAnimation}`}
                style={{
                    background: disabled ? 'linear-gradient(135deg, #AAAAAA 0%, #888888 100%)' : buttonStyle.background,
                    boxShadow: buttonStyle.boxShadow,
                    border: buttonStyle.border,
                    textShadow: '3px 3px 6px rgba(0,0,0,.4)'
                }}
            >
                GO
            </button>
        </div>
    );
};

const Controls: React.FC<ControlsProps> = ({ onGo, playerStatus, isGameActive, currentLight }) => {
    const someoneWon = playerStatus.red.isWinner || playerStatus.blue.isWinner;
    const isRedDisabled = !isGameActive || playerStatus.red.isFrozen || someoneWon;
    const isBlueDisabled = !isGameActive || playerStatus.blue.isFrozen || someoneWon;

    return (
        <div className="relative h-[120px]" style={{
            background: 'linear-gradient(180deg, #f8f8f8 0%, #ececec 100%)',
            borderTop: '3px solid #d5d5d5',
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,.08)'
        }}>
            <ControlButton team="red" onClick={() => onGo('red')} disabled={isRedDisabled} currentLight={currentLight} />
            <ControlButton team="blue" onClick={() => onGo('blue')} disabled={isBlueDisabled} currentLight={currentLight} />
        </div>
    );
};

export default Controls;