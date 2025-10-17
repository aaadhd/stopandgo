import React from 'react';

type PausedOverlayProps = {
    onResume: () => void;
};

const PausedOverlay: React.FC<PausedOverlayProps> = ({ onResume }) => {
    return (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center z-50">
            <h1 className="text-9xl font-bold text-white mb-12 tracking-wider">PAUSED</h1>
            <button
                onClick={onResume}
                className="text-4xl font-bold py-5 px-16 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110"
                style={{
                    background: '#49D86D',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                    border: '3px solid rgba(255,255,255,0.4)'
                }}
            >
                Resume
            </button>
        </div>
    );
};

export default PausedOverlay;
