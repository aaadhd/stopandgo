import React, { useEffect } from 'react';
import { Team } from '../../types';
import { TEAM_COLORS } from '../../constants';
import { playSound } from '../../utils/audio';

type GameOverModalProps = {
    scores: { [key in Team]: number };
    onPlayAgain: () => void;
};

const GameOverModal: React.FC<GameOverModalProps> = ({ scores, onPlayAgain }) => {
    let winnerText, winnerColor, winnerEmoji;

    if (scores.cyan > scores.purple) {
        winnerText = '🎉 Team A Wins! 🎉';
        winnerEmoji = '';
        winnerColor = TEAM_COLORS.cyan.text;
    } else if (scores.purple > scores.cyan) {
        winnerText = '🎉 Team B Wins! 🎉';
        winnerEmoji = '';
        winnerColor = TEAM_COLORS.purple.text;
    } else {
        winnerText = "It's a Tie! Great job!";
        winnerEmoji = '';
        winnerColor = 'text-gray-800';
    }

    // 게임 오버 시 축하 효과음
    useEffect(() => {
        // result.mp3 파일 재생
        const resultAudio = new Audio('/audios/result.mp3');
        resultAudio.volume = 0.7; // 볼륨 설정
        resultAudio.preload = 'auto';
        
        // 재생 시도
        const playPromise = resultAudio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Result audio playing');
                })
                .catch(err => {
                    console.warn('Result audio play failed:', err);
                    // 재생 실패 시 재시도
                    setTimeout(() => {
                        resultAudio.play().catch(e => console.warn('Retry failed:', e));
                    }, 100);
                });
        }
        
        // 컴포넌트 언마운트 시 정리
        return () => {
            resultAudio.pause();
            resultAudio.currentTime = 0;
        };
    }, []);

    return (
        <div className="absolute inset-0 flex justify-center items-center z-50">
            {/* 배경 이미지 with blur */}
            <img
                src="/background.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
                style={{ filter: 'blur(8px)' }}
            />
            {/* 화이트 오버레이 */}
            <div className="absolute inset-0 bg-white/20 z-[1] pointer-events-none"></div>

            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white relative z-10">
                <h2 className={`text-6xl font-bold mb-6 ${winnerColor}`}>{winnerText}</h2>
                <h1 className="text-4xl font-bold mb-10 tracking-tight text-gray-600">Game Over!</h1>
                <button
                    onClick={onPlayAgain}
                    className="text-4xl font-bold py-5 px-12 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110"
                    style={{
                        background: '#49D86D',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                        border: '3px solid rgba(255,255,255,0.4)'
                    }}
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default GameOverModal;