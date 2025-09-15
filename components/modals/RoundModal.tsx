import React from 'react';

type RoundModalProps = {
    title: string;
    text: string;
    buttonText: string;
    onNext: () => void;
    isSuccess?: boolean | null;
};

const RoundModal: React.FC<RoundModalProps> = ({ title, text, buttonText, onNext, isSuccess }) => {
    let titleColor = 'text-gray-800';
    if (isSuccess === true) titleColor = 'text-green-500';
    if (isSuccess === false) titleColor = 'text-red-500';

    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white">
                <h2 className={`text-7xl font-bold mb-4 tracking-tight ${titleColor}`}>{title}</h2>
                <p className="text-3xl mb-10">{text}</p>
                <button
                    onClick={onNext}
                    className="text-4xl font-bold py-5 px-12 rounded-2xl border-none cursor-pointer bg-green-500 text-white transition hover:bg-green-600 shadow-lg"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default RoundModal;