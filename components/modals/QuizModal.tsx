import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, Team } from '../../types';

// ===== Constants =====
const TEAM_COLORS = {
  cyan: {
    name: 'text-[#0891b2]',
    line: 'bg-[#0891b2]',
  },
  purple: {
    name: 'text-[#9333ea]',
    line: 'bg-[#9333ea]',
  },
};

// ===== Sound Service =====
const soundCache: Record<string, HTMLAudioElement> = {};

const loadSound = (name: string, url: string) => {
  if (!soundCache[name]) {
    soundCache[name] = new Audio(url);
    soundCache[name].preload = 'auto';
  }
};

const playSound = (name: string) => {
  if (soundCache[name]) {
    soundCache[name].currentTime = 0;
    soundCache[name].play().catch(err => console.warn('Sound play failed:', err));
  }
};

// Preload sounds
loadSound('correct', '/sound-effect/correct.mp3');
loadSound('incorrect', '/sound-effect/incorrect.mp3');

type QuizModalProps = {
    quiz: Quiz;
    isLoading: boolean;
    winnerTeam: Team | null;
    onAnswer: (isCorrect: boolean, team: Team) => void;
};

const QuizModal: React.FC<QuizModalProps> = ({ quiz, isLoading, winnerTeam, onAnswer }) => {
    // winnerTeam이 null이면 퀴즈를 표시하지 않음
    if (!winnerTeam) {
        return null;
    }

    const teamColor = TEAM_COLORS[winnerTeam];
    const [timeLeft, setTimeLeft] = useState(10);
    const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);

    const showFeedbackToast = (status: 'correct' | 'incorrect' | 'timeout') => {
        let text: string, color: string;
        if (status === 'correct') {
            text = 'Correct!';
            color = '#3B82F6'; // Blue-500
            playSound('correct');
        } else if (status === 'incorrect') {
            text = 'Incorrect!';
            color = '#EF4444'; // Red
            playSound('incorrect');
        } else {
            text = "Time's up!";
            color = '#F59E0B'; // Amber
            playSound('incorrect');
        }
        setFeedback({ text, color });
    };

    const triggerExit = useCallback((isCorrect: boolean) => {
        setIsExiting(true);
        setTimeout(() => onAnswer(isCorrect, winnerTeam), 500);
    }, [onAnswer, winnerTeam]);

    const handleTimeout = useCallback(() => {
        setIsLocked(true);
        showFeedbackToast('timeout');
        setTimeout(() => triggerExit(false), 1500); // correct/incorrect와 동일한 타이밍
    }, [triggerExit]);

    useEffect(() => {
        if (!isLoading && quiz) {
            setTimeLeft(10);
            setFeedback(null);
            setIsLocked(false);
            setIsExiting(false);
            setUserAnswer(null);
        }

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isLoading, quiz?.question]);

    useEffect(() => {
        if (isLocked || isLoading || isExiting || !quiz) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return;
        }

        timerIntervalRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isLocked, isLoading, isExiting, quiz, handleTimeout]);
    
    const handleAnswerClick = (isCorrect: boolean, selectedAnswer: string) => {
        if(isLocked) return;
        setUserAnswer(selectedAnswer);
        setIsLocked(true);
        showFeedbackToast(isCorrect ? 'correct' : 'incorrect');
        setTimeout(() => triggerExit(isCorrect), 1500);
    };

    return (
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`w-[90%] max-w-6xl min-h-[80%] bg-white rounded-2xl shadow-2xl flex flex-col p-10 relative transition-transform duration-500 ${isExiting ? 'scale-90' : 'scale-100'} animate-pop-in ${isLocked ? 'quiz-locked' : ''}`}>

                {/* 상단 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <div className={`text-2xl font-bold ${teamColor.name}`}>
                        {winnerTeam === 'cyan' ? 'Team A' : 'Team B'}'s Chance!
                    </div>
                    <div className="flex items-center gap-2 text-2xl font-bold text-cyan-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="w-8 text-left">{timeLeft}</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-3xl text-center">Generating a fun question...</div>
                ) : (
                    <>
                        {/* 문제 영역 - 넓게 잡아서 공간 효율적으로 사용 */}
                        <div className="flex-1 flex flex-col justify-center mb-8">
                            <h2 className="text-5xl font-bold text-center text-gray-800 leading-tight">
                                {quiz.question}
                            </h2>
                        </div>
                        
                        {/* 보기 영역 - 하단에 고정 */}
                        <div className="mt-auto">
                            <div className="grid grid-cols-2 gap-6">
                                {quiz.answers.map((answer, index) => (
                                    <button 
                                        key={index} 
                                        className={`px-6 py-4 text-xl font-semibold rounded-xl border-2 transition-all duration-200 ${
                                            isLocked 
                                                ? (answer === quiz.correctAnswer 
                                                    ? 'bg-green-100 border-green-500 text-green-700' 
                                                    : (userAnswer === answer 
                                                        ? 'bg-red-100 border-red-500 text-red-700' 
                                                        : 'bg-gray-50 border-gray-300 text-gray-600'))
                                                : (userAnswer === answer
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'bg-white border-gray-300 text-gray-800 hover:border-gray-400 hover:bg-gray-50')
                                        }`}
                                        onClick={() => handleAnswerClick(answer === quiz.correctAnswer, answer)}
                                        disabled={isLocked}
                                    >
                                        {answer}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                
                {feedback && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div
                            style={{ backgroundColor: feedback.color }}
                            className="px-12 py-6 rounded-full text-7xl font-black text-white animate-pop-in-large"
                        >
                            {feedback.text}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizModal;