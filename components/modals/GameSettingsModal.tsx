import React, { useState } from 'react';
import { GameSettings } from '../../types';
import TutorialModal from './TutorialModal';
import SettingsGuideModal from './SettingsGuideModal';
import { preloadImages } from '../../utils/preloadImages';

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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
      rounds: Math.max(1, Math.min(12, prev.rounds + delta))
    }));
  };

  const handlePlay = async () => {
    try {
      // 게임에서 사용되는 모든 이미지 URL
      const imageUrls = [
        '/background.png',
        '/stopandgo.png',
        '/images/forest.png',
        '/images/undersea.png',
        '/images/space.png',
      ];

      // 이미지 프리로드 완료를 기다림
      await preloadImages(imageUrls);
      
      // 프리로드 완료 후 게임 시작
      onStart(settings);
    } catch (error) {
      console.error('Failed to preload game assets:', error);
      // 에러가 발생해도 게임은 시작
      onStart(settings);
    }
  };

  const canDecreaseRounds = settings.rounds > 1;
  const canIncreaseRounds = settings.rounds < 12;

  return (
    <>
    <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col z-50">
       {/* Header with Navigation Buttons - Fixed */}
       <div className="flex justify-between items-center p-4 pl-6 pr-6 z-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-10 h-10 bg-purple-300 text-white rounded-full flex items-center justify-center hover:bg-purple-400 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Right Side Buttons */}
        <div className="flex gap-3">
          {/* Info Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="w-10 h-10 bg-purple-300 text-white rounded-full flex items-center justify-center hover:bg-purple-400 transition-all shadow-sm"
          >
            <span className="text-sm font-bold">i</span>
          </button>
          
          {/* Close Button */}
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm border border-purple-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Content Area - Scrollable */}
      <div className="flex flex-1 overflow-hidden">
         {/* Left Panel */}
         <div className="w-1/3 bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col items-center justify-start">
           <div className="text-center mb-8 p-2 pl-6 pr-6">
             <div className="w-96 h-64 mb-6 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/stopandgo.png" 
                  alt="Stop & Go Race" 
                  className="w-full h-full object-cover"
                />
            </div>
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="bg-purple-200 text-purple-800 px-6 py-3 rounded-full font-semibold"
            >
              Game Guide
            </button>
          </div>
        </div>

        {/* Right Panel - Scrollable */}
        <div className="w-2/3 bg-gradient-to-b from-purple-50 to-purple-100 overflow-hidden flex flex-col">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2 pr-6">
            <div className="max-w-4xl mx-auto space-y-3">
            
            {/* Select Range */}
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Select Range</h3>
                <p className="text-xs text-purple-600">(Multiple selection allowed)</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {lessons.map(lesson => (
                  <button
                    key={lesson}
                    onClick={() => toggleLesson(lesson)}
                    disabled={lesson === 8}
                    className={`px-2 py-1 rounded-lg font-semibold text-base transition-all h-[54px] flex items-center justify-center ${
                      lesson === 8
                        ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                        : settings.selectedLessons.includes(lesson)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    Lesson {lesson}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Learning Focus */}
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Select Learning Focus</h3>
                <p className="text-xs text-purple-600">(Multiple selection allowed)</p>
              </div>
              <div className="flex gap-3">
                {/* Learning Focus Options Grid - 2x3 */}
                <div className="grid grid-cols-3 grid-rows-2 gap-3 flex-1">
                  {learningFocusOptions.map(focus => (
                    <button
                      key={focus}
                      onClick={() => toggleLearningFocus(focus)}
                      className={`px-2 py-1 rounded-lg font-semibold text-base transition-all h-[54px] flex items-center justify-center ${
                      settings.learningFocus.includes(focus)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
                
                {/* Vertical Divider */}
                <div className="flex items-center justify-center">
                  <div className="w-px h-[112px] bg-purple-200"></div>
                </div>
                
                {/* Preview Button - Full Height */}
                <button className="bg-white text-purple-700 border border-purple-300 px-3 py-1 rounded-lg font-semibold text-base hover:bg-purple-50 h-[112px] flex flex-col items-center justify-center gap-2">
                  <div className="text-lg">🔍</div>
                  <div>Preview</div>
                </button>
              </div>
            </div>

            {/* Game Settings Grid - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Game Mode */}
              <div className="bg-white rounded-2xl p-3 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Game Mode</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, gameMode: 'teams' }))}
                    className={`flex-1 px-3 py-1 rounded-xl font-semibold text-base transition-all h-[54px] ${
                      settings.gameMode === 'teams'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-center flex flex-col justify-center h-full">
                      <div className="font-bold text-base leading-tight">Teams</div>
                      <div className="text-xs opacity-75 leading-tight">(Smartboard)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, gameMode: 'solo' }))}
                    className={`flex-1 px-3 py-1 rounded-xl font-semibold text-base transition-all h-[54px] ${
                      settings.gameMode === 'solo'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-center flex flex-col justify-center h-full">
                      <div className="font-bold text-base leading-tight">Solo</div>
                      <div className="text-xs opacity-75 leading-tight">(Tablet)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rounds */}
              <div className="bg-white rounded-2xl p-3 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Rounds</h3>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => updateRounds(-1)}
                    disabled={!canDecreaseRounds}
                    className={`w-10 h-10 rounded-full font-bold text-lg transition-all border-0 ${
                      canDecreaseRounds
                        ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                        : 'bg-gray-200 text-white cursor-not-allowed'
                    }`}
                  >
                    -
                  </button>
                  <div className="bg-white border border-purple-300 rounded-xl px-6 py-1 text-center font-bold text-lg text-purple-800 min-w-[80px]">
                    {settings.rounds}
                  </div>
                  <button
                    onClick={() => updateRounds(1)}
                    disabled={!canIncreaseRounds}
                    className={`w-10 h-10 rounded-full font-bold text-lg transition-all border-0 ${
                      canIncreaseRounds
                        ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                        : 'bg-gray-200 text-white cursor-not-allowed'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
            </div>
          </div>
          
           {/* Fixed Play Button Area */}
           <div className="flex justify-center items-center p-2 pb-6">
             <div className="max-w-4xl w-full flex justify-end pr-6">
               <button
                 onClick={handlePlay}
                 className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-bold text-lg hover:bg-cyan-600 shadow-lg"
               >
                 Play
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
    <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    <SettingsGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};

export default GameSettingsModal;
