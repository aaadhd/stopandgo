import React from 'react';

interface PauseOverlayProps {
  onResume: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="mb-8">
          <h2 
            className="text-6xl font-bold text-orange-600 mb-4"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            PAUSED
          </h2>
          <p className="text-gray-600 text-xl">Game is paused</p>
        </div>

        <button
          onClick={onResume}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-lg"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Resume
        </button>
      </div>
    </div>
  );
};

export default PauseOverlay;

