import React, { useState } from 'react';
import { GameSettings } from '../../types';

interface GameSettingsModalProps {
  onStart: (settings: GameSettings) => void;
  onBack: () => void;
}

const GameSettingsModal: React.FC<GameSettingsModalProps> = ({ onStart, onBack }) => {
  const [settings, setSettings] = useState<GameSettings>({
    selectedLessons: [1],
    learningFocus: ['Vocabulary'],
    gameMode: 'teams',
    questionOrder: 'same',
    rounds: 6,
    totalTime: 0
  });

  const lessons = [1, 2, 3, 4, 5, 6, 7, 8];
  const learningFocusOptions = ['Vocabulary', 'Reading', 'Speaking', 'Grammar', 'Writing', 'Action Learning'];

  const toggleLesson = (lesson: number) => {
    if (lesson === 8) return; // Lesson 8 is disabled
    
    setSettings(prev => ({
      ...prev,
      selectedLessons: prev.selectedLessons.includes(lesson)
        ? prev.selectedLessons.filter(l => l !== lesson)
        : [...prev.selectedLessons, lesson]
    }));
  };

  const toggleLearningFocus = (focus: string) => {
    setSettings(prev => ({
      ...prev,
      learningFocus: prev.learningFocus.includes(focus)
        ? prev.learningFocus.filter(f => f !== focus)
        : [...prev.learningFocus, focus]
    }));
  };

  const updateRounds = (delta: number) => {
    setSettings(prev => ({
      ...prev,
      rounds: Math.max(1, Math.min(10, prev.rounds + delta))
    }));
  };

  const updateTotalTime = (delta: number) => {
    setSettings(prev => ({
      ...prev,
      totalTime: Math.max(0, Math.min(60, prev.totalTime + delta))
    }));
  };

  return (
    <div className="absolute inset-0 bg-purple-100 flex items-center justify-center z-50">
      <div className="w-full h-full flex">
        {/* Left Panel */}
        <div className="w-1/3 bg-white p-8 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <div className="w-80 h-48 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/stopandgo.png" 
                  alt="Stop & Go Race" 
                  className="w-full h-full object-cover"
                />
            </div>
            <button className="bg-purple-200 text-purple-800 px-6 py-3 rounded-full font-semibold">
              Game Guide
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-2/3 bg-purple-50 p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4 pt-8">
            
            {/* Choose Range */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Choose Range</h3>
              <p className="text-xs text-gray-600 mb-2">Multiple selection allowed</p>
              <div className="grid grid-cols-4 gap-2">
                {lessons.map(lesson => (
                  <button
                    key={lesson}
                    onClick={() => toggleLesson(lesson)}
                    disabled={lesson === 8}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                      lesson === 8
                        ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                        : settings.selectedLessons.includes(lesson)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Lesson {lesson}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Learning Focus */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Choose Learning Focus</h3>
              <p className="text-xs text-gray-600 mb-2">Multiple selection allowed</p>
              <div className="grid grid-cols-3 gap-2">
                {learningFocusOptions.map(focus => (
                  <button
                    key={focus}
                    onClick={() => toggleLearningFocus(focus)}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                      settings.learningFocus.includes(focus)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {focus}
                  </button>
                ))}
              </div>
              <button className="mt-2 bg-white text-purple-600 border border-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50">
                🔍 Preview
              </button>
            </div>

            {/* Game Mode and Question Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Game Mode</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, gameMode: 'teams' }))}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                      settings.gameMode === 'teams'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Teams (Smartboard)
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, gameMode: 'solo' }))}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                      settings.gameMode === 'solo'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Solo (Tablet)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Question Order</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, questionOrder: 'same' }))}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                      settings.questionOrder === 'same'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Same for All
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, questionOrder: 'randomized' }))}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                      settings.questionOrder === 'randomized'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Randomized
                  </button>
                </div>
              </div>
            </div>

            {/* Rounds and Total Game Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Rounds</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateRounds(-1)}
                    className="w-10 h-10 bg-white border border-purple-600 text-purple-600 rounded-lg font-bold hover:bg-purple-50"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-white border border-purple-600 rounded-lg px-4 py-2 text-center font-semibold">
                    {settings.rounds}
                  </div>
                  <button
                    onClick={() => updateRounds(1)}
                    className="w-10 h-10 bg-white border border-purple-600 text-purple-600 rounded-lg font-bold hover:bg-purple-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Total Game Time <span className="text-gray-600 text-sm font-normal">(minutes)</span></h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateTotalTime(-1)}
                    className="w-10 h-10 bg-white border border-purple-600 text-purple-600 rounded-lg font-bold hover:bg-purple-50"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-white border border-purple-600 rounded-lg px-4 py-2 text-center font-semibold">
                    {settings.totalTime || '-'}
                  </div>
                  <button
                    onClick={() => updateTotalTime(1)}
                    className="w-10 h-10 bg-white border border-purple-600 text-purple-600 rounded-lg font-bold hover:bg-purple-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-8">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
              >
                ← Back
              </button>
              <button
                onClick={() => onStart(settings)}
                className="px-8 py-3 bg-teal-500 text-white rounded-lg font-bold text-lg hover:bg-teal-600"
              >
                Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSettingsModal;
