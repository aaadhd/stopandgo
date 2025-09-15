import React from 'react';
import { Team } from '../types';
import { TEAM_COLORS } from '../constants';

type InfoBarProps = {
    scores: { [key in Team]: number };
    currentRound: number;
    timeLeft: number;
};

const ScoreDisplay: React.FC<{ team: Team; score: number }> = ({ team, score }) => {
    const color = TEAM_COLORS[team];
    return (
        <div className={`text-4xl font-bold py-2 px-5 rounded-2xl ${color.text} ${color.bgLight}`}>
            {team.charAt(0).toUpperCase() + team.slice(1)}: {score}
        </div>
    );
};

const InfoBar: React.FC<InfoBarProps> = ({ scores, currentRound, timeLeft }) => {
    return (
        <div className="flex justify-between items-center px-5 py-2.5 bg-white border-b-4 border-gray-200 z-10">
            <ScoreDisplay team="red" score={scores.red} />
            <div className="text-5xl font-bold text-gray-800">
                Round {currentRound}
            </div>
            <div className={`text-4xl font-bold text-gray-800 bg-gray-100 py-2 px-5 rounded-2xl transition-colors duration-300`}>
                ⏳ {timeLeft}
            </div>
            <ScoreDisplay team="blue" score={scores.blue} />
        </div>
    );
};

export default InfoBar;