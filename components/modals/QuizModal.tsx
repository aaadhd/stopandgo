import React, { useState, useEffect } from 'react';
import { Quiz, Team } from '../../types';
import { TEAM_COLORS } from '../../constants';

type QuizModalProps = {
    quiz: Quiz;
    isLoading: boolean;
    winnerTeam: Team;
    onAnswer: (isCorrect: boolean, team: Team) => void;
};

const QuizModal: React.FC<QuizModalProps> = ({ quiz, isLoading, winnerTeam, onAnswer }) => {
    const teamColor = TEAM_COLORS[winnerTeam];
    const [timeLeft, setTimeLeft] = useState(8);

    useEffect(() => {
        if (!isLoading && quiz) {
            setTimeLeft(8);
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLoading, quiz?.question]); // quiz 객체 대신 quiz.question만 감시

    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl w-3/4 max-w-4xl border-8 border-white">
                <div className="flex justify-between items-center mb-8">
                    <div className="w-24"></div>
                    <p className={`text-6xl font-bold ${teamColor.text} tracking-tight`}>
                        {winnerTeam.charAt(0).toUpperCase() + winnerTeam.slice(1)} Team's Turn
                    </p>
                    {!isLoading && quiz && (
                        <div className={`w-24 h-24 rounded-full border-8 ${timeLeft <= 3 ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'} flex items-center justify-center`}>
                            <span className="text-3xl font-bold">{timeLeft}</span>
                        </div>
                    )}
                    {(isLoading || !quiz) && <div className="w-24"></div>}
                </div>
                {isLoading ? (
                    <div className="text-3xl">Generating a fun question...</div>
                ) : (
                    <>
                        <p className="text-5xl font-bold mb-10 text-gray-900 leading-tight">{quiz.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quiz.answers.map((answer, index) => (
                                <button
                                    key={index}
                                    onClick={() => onAnswer(answer === quiz.correctAnswer, winnerTeam)}
                                    className="w-full text-3xl font-bold p-8 rounded-2xl border-4 border-gray-200 bg-gray-50 text-gray-800 transition-all duration-200 hover:scale-105 hover:bg-yellow-200 hover:border-yellow-300"
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuizModal;