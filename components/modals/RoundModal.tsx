import React, { useState } from 'react';

type RoundModalProps = {
    title: string;
    text: string;
    buttonText: string;
    onNext: () => void;
    isSuccess?: boolean | null;
};

const RoundModal: React.FC<RoundModalProps> = ({ title, text, buttonText, onNext, isSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    let titleColor = 'text-gray-800';
    if (isSuccess === true) titleColor = 'text-green-500';
    if (isSuccess === false) titleColor = 'text-red-500';

    const handleNext = () => {
        if (isProcessing) return; // 이미 처리 중이면 무시
        
        setIsProcessing(true);
        
        // 1초 지연 후 다음 액션 실행
        setTimeout(() => {
            onNext();
        }, 1000);
    };

    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white">
                <h2 className={`text-7xl font-bold mb-4 tracking-tight ${titleColor}`}>{title}</h2>
                <p className="text-3xl mb-10">{text}</p>
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