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
    autoProceed?: boolean; // 자동 진행 여부
    autoProceedDelay?: number; // 자동 진행 지연 시간 (ms)
};

const RoundModal: React.FC<RoundModalProps> = ({ title, text, buttonText, onNext, isSuccess, isCountdown, winner, autoProceed = false, autoProceedDelay = 2000 }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(3);
    
    let titleColor = 'text-gray-800';
    if (isSuccess === true) titleColor = 'text-green-500';
    if (isSuccess === false) titleColor = 'text-red-500';

    // 텍스트에서 팀 이름에 색상 적용 및 줄바꿈 처리
    const renderColoredText = (text: string) => {
        // 줄바꿈 처리
        const lines = text.split('\n');
        
        if (!winner) {
            // 팀 이름이 없으면 줄바꿈만 처리
            return (
                <>
                    {lines.map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            {index < lines.length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </>
            );
        }
        
        const teamName = winner === 'cyan' ? 'Team A' : 'Team B';
        const teamColor = TEAM_COLORS[winner].primary;
        
        return (
            <>
                {lines.map((line, lineIndex) => {
                    // 각 줄에서 팀 이름 찾기
                    const parts = line.split(teamName);
                    if (parts.length === 1) {
                        // 팀 이름이 없으면 그대로 반환
                        return (
                            <React.Fragment key={lineIndex}>
                                {line}
                                {lineIndex < lines.length - 1 && <br />}
                            </React.Fragment>
                        );
                    }
                    
                    // 팀 이름이 있으면 색상 적용
                    return (
                        <React.Fragment key={lineIndex}>
                            {parts.map((part, partIndex) => (
                                <React.Fragment key={partIndex}>
                                    {part}
                                    {partIndex < parts.length - 1 && (
                                        <span style={{ color: teamColor, fontWeight: 'bold' }}>{teamName}</span>
                                    )}
                                </React.Fragment>
                            ))}
                            {lineIndex < lines.length - 1 && <br />}
                        </React.Fragment>
                    );
                })}
            </>
        );
    };

    // 자동 진행 효과
    useEffect(() => {
        if (autoProceed && !isCountdown && !showCountdown) {
            const timer = setTimeout(() => {
                onNext();
            }, autoProceedDelay);
            return () => clearTimeout(timer);
        }
    }, [autoProceed, autoProceedDelay, onNext, isCountdown, showCountdown]);

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
            <div className={`bg-white text-gray-800 rounded-[2.5rem] text-center shadow-2xl border-8 border-white max-w-4xl flex flex-col ${autoProceed ? 'pt-12 px-12 pb-8' : 'p-12'}`}>
                <h2 className={`text-7xl font-bold mb-6 tracking-tight ${titleColor}`}>{title}</h2>
                <p className="text-3xl mb-6">{renderColoredText(text)}</p>
                
                {/* 게임 규칙 안내 - 라운드 시작 시에만 표시 */}
                {isCountdown && (
                    <div className="mb-6 bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-5 border-3 border-gray-200">
                        <div className="text-3xl font-bold text-green-600">
                            🟢 GO on GREEN
                        </div>
                        <div className="text-3xl font-bold text-red-600 mt-2">
                            🔴 STOP on RED
                        </div>
                    </div>
                )}
                
                {!autoProceed && (
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
                )}
            </div>
        </div>
    );
};

export default RoundModal;