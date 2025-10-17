import React from 'react';

interface GameMenuModalProps {
  onResume: () => void;
  onEndGame: () => void;
  onExit: () => void;
}

const GameMenuModal: React.FC<GameMenuModalProps> = ({
  onResume,
  onEndGame,
  onExit,
}) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h2 
            className="text-4xl font-bold text-yellow-800 mb-2"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Game Menu
          </h2>
          <p className="text-gray-600 text-lg">What would you like to do?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onResume}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Resume Game
          </button>

          <button
            onClick={onEndGame}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            End Game
          </button>

          <button
            onClick={onExit}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameMenuModal;

