import React from 'react';
import { Team } from '../../types';
import { TEAM_COLORS } from '../../constants';

type GameOverModalProps = {
    scores: { [key in Team]: number };
    onPlayAgain: () => void;
};

const GameOverModal: React.FC<GameOverModalProps> = ({ scores, onPlayAgain }) => {
    let winnerText, winnerColor;

    if (scores.red > scores.blue) {
        winnerText = '🎉 Red Team Wins! 🎉';
        winnerColor = TEAM_COLORS.red.text;
    } else if (scores.blue > scores.red) {
        winnerText = '🎉 Blue Team Wins! 🎉';
        winnerColor = TEAM_COLORS.blue.text;
    } else {
        winnerText = "It's a Tie! Great job!";
        winnerColor = 'text-gray-800';
    }

    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white">
                <h1 className="text-8xl font-bold mb-4 tracking-tight">Game Over!</h1>
                <h2 className={`text-6xl font-bold mb-10 ${winnerColor}`}>{winnerText}</h2>
                <button
                    onClick={onPlayAgain}
                    className="text-4xl font-bold py-5 px-12 rounded-2xl border-none cursor-pointer bg-blue-500 text-white transition hover:bg-blue-600 shadow-lg"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default GameOverModal;