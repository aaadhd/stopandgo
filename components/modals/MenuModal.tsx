import React from 'react';

type MenuModalProps = {
    onResume: () => void;
    onEndGame: () => void;
    onExit: () => void;
};

const MenuModal: React.FC<MenuModalProps> = ({ onResume, onEndGame, onExit }) => {
    return (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white text-gray-800 p-12 rounded-[2.5rem] text-center shadow-2xl border-8 border-white">
                <h1 className="text-6xl font-bold mb-8 tracking-tight">Game Menu</h1>
                <div className="flex flex-col gap-6">
                    <button
                        onClick={onResume}
                        className="text-4xl font-bold py-5 px-12 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110"
                        style={{
                            background: '#49D86D',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                            border: '3px solid rgba(255,255,255,0.4)'
                        }}
                    >
                        Resume Game
                    </button>
                    <button
                        onClick={onEndGame}
                        className="text-4xl font-bold py-5 px-12 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110"
                        style={{
                            background: '#FF5D5D',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                            border: '3px solid rgba(255,255,255,0.4)'
                        }}
                    >
                        End Game
                    </button>
                    <button
                        onClick={onExit}
                        className="text-4xl font-bold py-5 px-12 rounded-3xl text-white cursor-pointer transition-all active:scale-95 active:translate-y-1 hover:brightness-110"
                        style={{
                            background: '#6B7280',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                            border: '3px solid rgba(255,255,255,0.4)'
                        }}
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuModal;
