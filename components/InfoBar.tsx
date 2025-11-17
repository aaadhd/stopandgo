import React from 'react';
import { Team } from '../types';
import { TEAM_COLORS } from '../constants';

type InfoBarProps = {
    scores: { [key in Team]: number };
    currentRound: number;
    maxRounds: number;
    timeLeft: number;
};

const ScoreDisplay: React.FC<{ team: Team; score: number }> = ({ team, score }) => {
    const color = TEAM_COLORS[team];
    const teamName = team === 'cyan' ? 'Team A' : 'Team B';
    return (
        <div className={`text-4xl font-bold py-2 px-5 rounded-2xl ${color.bgLight}`} style={{ minWidth: '220px', textAlign: 'center' }}>
            <span className={color.text}>{teamName}</span>
            <span className="text-gray-800">: </span>
            <span className="text-yellow-600 font-black">{score}</span>
        </div>
    );
};

const InfoBar: React.FC<InfoBarProps> = ({ scores, currentRound, maxRounds, timeLeft }) => {
    return (
        <div className="flex justify-between items-center px-5 py-2.5 bg-white border-b-4 border-gray-200 z-10">
            <ScoreDisplay team="cyan" score={scores.cyan} />
            <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-gray-800">
                    Round {currentRound}/{maxRounds}
                </div>
                {/* 결승선 모양 */}
                <div className="mt-3" style={{
                    width: '200px',
                    height: '24px',
                    background: 'repeating-linear-gradient(90deg, #000000 0px, #000000 20px, #ffffff 20px, #ffffff 40px)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
                    border: '3px solid rgba(0,0,0,0.5)'
                }}></div>
            </div>
            <div className={`text-4xl font-bold text-gray-800 bg-gray-100 py-2 px-5 rounded-2xl transition-colors duration-300`}>
                ⏳ {timeLeft}
            </div>
            <ScoreDisplay team="purple" score={scores.purple} />
        </div>
    );
};

export default InfoBar;