import React from 'react';

type StartModalProps = {
    onStart: () => void;
};

const StartModal: React.FC<StartModalProps> = ({ onStart }) => {
    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white">
                <h1 className="text-8xl font-bold mb-4 tracking-tight">Stop & Go</h1>
                <p className="text-3xl mb-10">Press the GO button on GREEN to win!</p>
                <button
                    onClick={onStart}
                    className="text-4xl font-bold py-5 px-12 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110"
                    style={{
                        background: '#49D86D',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                        border: '3px solid rgba(255,255,255,0.4)'
                    }}
                >
                    Start Game!
                </button>
            </div>
        </div>
    );
};

export default StartModal;