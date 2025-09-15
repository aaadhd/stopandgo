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
                    className="text-4xl font-bold py-5 px-12 rounded-2xl border-none cursor-pointer bg-green-500 text-white transition hover:bg-green-600 shadow-lg"
                >
                    Start Game!
                </button>
            </div>
        </div>
    );
};

export default StartModal;