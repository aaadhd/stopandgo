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
    // Corrected the horizontal alignment to be perfectly centered under the player characters.
    const leftPosition = team === 'red' ? 'left-[27%]' : 'left-[73%]';
    const pulseAnimation = !disabled && currentLight === 'green' ? 'animation-go-pulse' : '';

    const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!disabled) {
            onClick();
        }
    };

    return (
        <div className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${leftPosition}`}>
            <button
                onClick={handlePress}
                onTouchStart={handlePress}
                disabled={disabled}
                className={`text-6xl font-bold py-5 px-14 rounded-3xl border-none text-white cursor-pointer transition-transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg ${teamColor.bgClass} ${pulseAnimation}`}
            >
                GO
            </button>
        </div>
    );
};

const Controls: React.FC<ControlsProps> = ({ onGo, playerStatus, isGameActive, currentLight }) => {
    const isRedDisabled = !isGameActive || playerStatus.red.isFrozen;
    const isBlueDisabled = !isGameActive || playerStatus.blue.isFrozen;

    return (
        <div className="relative bg-gray-100 border-t-2 border-gray-200 h-[120px]">
            <ControlButton team="red" onClick={() => onGo('red')} disabled={isRedDisabled} currentLight={currentLight} />
            <ControlButton team="blue" onClick={() => onGo('blue')} disabled={isBlueDisabled} currentLight={currentLight} />
        </div>
    );
};

export default Controls;