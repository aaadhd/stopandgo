import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, Team } from '../../types';

// ===== Constants =====
const TEAM_COLORS = {
  red: {
    name: 'text-[#0891b2]',
    line: 'bg-[#0891b2]',
  },
  blue: {
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
        triggerExit(false);
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
                <div className="absolute top-6 right-10 flex items-center gap-2 text-3xl font-bold text-amber-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                     <span className="w-12 text-left">{timeLeft}</span>
                </div>

                <div className={`text-3xl font-bold text-center mb-4 ${teamColor.name}`} style={{ fontFamily: "'Fredoka One', cursive" }}>
                    {winnerTeam === 'red' ? 'Team A' : 'Team B'}'s Quiz!
                </div>

                {isLoading ? (
                    <div className="text-3xl text-center">Generating a fun question...</div>
                ) : (
                    <>
                        <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">{quiz.question}</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {quiz.answers.map((answer, index) => (
                                <button 
                                    key={index} 
                                    className={`quiz-btn ${isLocked ? (answer === quiz.correctAnswer ? 'correct-answer' : (userAnswer === answer ? 'incorrect-answer' : '')) : ''}`} 
                                    onClick={() => handleAnswerClick(answer === quiz.correctAnswer, answer)}
                                    disabled={isLocked}
                                >
                                    {answer}
                                </button>
                            ))}
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