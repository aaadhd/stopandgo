import React from 'react';

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  onEndGame: () => void;
  onExit: () => void;
  buttonLabels?: {
    menuTitle?: string;
    guide?: string;
    endGame?: string;
    exit?: string;
  };
}

const GameMenuModal: React.FC<GameMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenGuide,
  onEndGame,
  onExit,
  buttonLabels = {},
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[500]">
      <div className="bg-white rounded-2xl p-8 text-center relative w-[560px] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute focus:outline-none"
          style={{ top: '20px', right: '40px', width: '48px', height: '48px' }}
          aria-label="Close menu"
        >
          <img src="/button/close.png" alt="Close" className="w-full h-full" />
        </button>

        <h2 className="text-4xl font-display text-slate-800 mb-8">
          {buttonLabels.menuTitle ?? 'Game Menu'}
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={onOpenGuide}
            className="px-8 py-4 text-2xl font-display text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            {buttonLabels.guide ?? 'Game Guide'}
          </button>
          <button
            onClick={onEndGame}
            className="px-8 py-4 text-2xl font-display text-white bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            {buttonLabels.endGame ?? 'End Game'}
          </button>
          <button
            onClick={onExit}
            className="px-8 py-4 text-2xl font-display text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            {buttonLabels.exit ?? 'Exit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameMenuModal;

