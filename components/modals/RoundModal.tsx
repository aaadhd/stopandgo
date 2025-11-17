import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Team } from '../../types';
import { TEAM_COLORS } from '../../constants';

type RoundModalProps = {
    title: string;
    text: string;
    buttonText: string;
    onNext: () => void;
    isSuccess?: boolean | null;
    isCountdown?: boolean;
    winner?: Team | null;
};

const RoundModal: React.FC<RoundModalProps> = ({ title, text, buttonText, onNext, isSuccess, isCountdown, winner }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(3);
    
    let titleColor = 'text-gray-800';
    if (isSuccess === true) titleColor = 'text-green-500';
    if (isSuccess === false) titleColor = 'text-red-500';

    // 텍스트에서 팀 이름에 색상 적용
    const renderColoredText = (text: string) => {
        if (!winner) return text;
        
        const teamName = winner === 'cyan' ? 'Team A' : 'Team B';
        const teamColor = TEAM_COLORS[winner].primary;
        
        // Team A 또는 Team B를 찾아서 색상 적용
        const parts = text.split(teamName);
        if (parts.length === 1) return text; // 팀 이름이 없으면 그대로 반환
        
        return (
            <>
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < parts.length - 1 && (
                            <span style={{ color: teamColor, fontWeight: 'bold' }}>{teamName}</span>
                        )}
                    </React.Fragment>
                ))}
            </>
        );
    };

    // 카운트다운 효과
    useEffect(() => {
        if (showCountdown && countdown > 0) {
            // 카운트다운 숫자마다 효과음 재생
            playSound('countdown');
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showCountdown && countdown === 0) {
            // GO! 효과음
            playSound('countdown-go');
            // 카운트다운이 끝나면 게임 시작
            setTimeout(() => {
                onNext();
            }, 500);
        }
    }, [showCountdown, countdown, onNext]);

    const handleNext = () => {
        if (isProcessing) return; // 이미 처리 중이면 무시
        
        setIsProcessing(true);
        
        // 카운트다운 모드인 경우
        if (isCountdown) {
            setShowCountdown(true);
            setCountdown(3);
            return;
        }
        
        // 일반 모드: 1초 지연 후 다음 액션 실행
        setTimeout(() => {
            onNext();
        }, 1000);
    };

    // 카운트다운 표시 중
    if (showCountdown) {
        return (
            <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
                <div className="text-white text-center">
                    <div 
                        className="text-[200px] font-bold animate-pulse"
                        style={{
                            textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.6)',
                            animation: countdown > 0 ? 'pulse 0.5s ease-in-out' : 'none'
                        }}
                    >
                        {countdown > 0 ? countdown : 'GO!'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white max-w-4xl">
                <h2 className={`text-7xl font-bold mb-4 tracking-tight ${titleColor}`}>{title}</h2>
                <p className="text-3xl mb-8">{renderColoredText(text)}</p>
                
                {/* 게임 규칙 안내 - 라운드 시작 시에만 표시 */}
                {isCountdown && (
                    <div className="mb-8 bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-5 border-3 border-gray-200">
                        <div className="text-3xl font-bold text-green-600">
                            🟢 GO on GREEN
                        </div>
                        <div className="text-3xl font-bold text-red-600 mt-2">
                            🔴 STOP on RED
                        </div>
                    </div>
                )}
                
                <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className={`text-4xl font-bold py-5 px-12 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{
                        background: '#49D86D',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                        border: '3px solid rgba(255,255,255,0.4)'
                    }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default RoundModal;