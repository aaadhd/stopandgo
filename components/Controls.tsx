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
    isVisuallyActive?: boolean;
}> = ({ team, onClick, disabled, currentLight, isVisuallyActive = false }) => {
    const teamColor = TEAM_COLORS[team];
    // GO 버튼을 양 사이드에 배치
    const leftPosition = team === 'cyan' ? 'left-8' : 'right-8';
    const pulseAnimation = !disabled && currentLight === 'green' ? 'animation-go-pulse button-green-glow' : '';

    const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!disabled) {
            onClick();
        }
    };

    // 신호등 스타일 참고 (10% 투명도 적용)
    // 게임이 활성화되어 있고 버튼이 사용 가능할 때만 활성화 색으로 표시
    const isActiveColor = isVisuallyActive;
    const buttonStyle = team === 'cyan'
        ? {
            background: isActiveColor ? 'rgba(8, 145, 178, 0.9)' : 'rgba(74, 74, 74, 0.9)',
            boxShadow: isActiveColor
                ? '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3), 0 0 12px rgba(8,145,178,.5)'
                : '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
            border: isActiveColor ? '1.5px solid #0e7490' : '1.5px solid #555555'
        }
        : {
            background: isActiveColor ? 'rgba(147, 51, 234, 0.9)' : 'rgba(74, 74, 74, 0.9)',
            boxShadow: isActiveColor
                ? '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3), 0 0 12px rgba(147,51,234,.5)'
                : '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
            border: isActiveColor ? '1.5px solid #7c3aed' : '1.5px solid #555555'
        };

    return (
        <div className={`absolute bottom-8 ${leftPosition} z-40 pointer-events-auto`}>
            <button
                onClick={handlePress}
                onTouchStart={handlePress}
                className={`text-6xl font-bold py-4 px-14 rounded-xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 ${pulseAnimation}`}
                style={{
                    background: buttonStyle.background,
                    boxShadow: buttonStyle.boxShadow,
                    border: buttonStyle.border,
                    textShadow: '3px 3px 6px rgba(0,0,0,.4)',
                    opacity: disabled ? 0.6 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                GO
            </button>
        </div>
    );
};

const Controls: React.FC<ControlsProps> = ({ onGo, playerStatus, isGameActive, currentLight }) => {
    const someoneWon = playerStatus.cyan.isWinner || playerStatus.purple.isWinner;
    // 클릭 가능 여부만 결정 (색상은 항상 활성화 색으로 표시)
    const isCyanDisabled = !isGameActive || playerStatus.cyan.isFrozen || someoneWon;
    const isPurpleDisabled = !isGameActive || playerStatus.purple.isFrozen || someoneWon;
    // 게임이 활성화되어 있으면 시각적으로는 활성화 색으로 표시
    const isCyanVisuallyActive = isGameActive && !playerStatus.cyan.isFrozen && !someoneWon;
    const isPurpleVisuallyActive = isGameActive && !playerStatus.purple.isFrozen && !someoneWon;

    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            <ControlButton
                team="cyan"
                onClick={() => onGo('cyan')}
                disabled={isCyanDisabled}
                currentLight={currentLight}
                isVisuallyActive={isCyanVisuallyActive}
            />
            <ControlButton
                team="purple"
                onClick={() => onGo('purple')}
                disabled={isPurpleDisabled}
                currentLight={currentLight}
                isVisuallyActive={isPurpleVisuallyActive}
            />
        </div>
    );
};

export default Controls;
