import React from 'react';
import { Team, LightColor, PlayerStatuses, Item } from '../types';
import { ITEM_EMOJIS } from '../constants';

const CONFETTI_COLORS = ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00', '#FFA500'];

const Confetti: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-30 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                        animationDelay: `${Math.random() * 3}s`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}
        </div>
    );
};

// Clouds removed

type TrafficLightProps = {
    activeLight: LightColor;
};

const TrafficLight: React.FC<TrafficLightProps> = ({ activeLight }) => {
    return (
        <div id="traffic-light" className="absolute bottom-[120px] left-1/2 -translate-x-1/2 bg-[#2c3e50] p-2.5 rounded-2xl flex flex-col gap-2 z-20 border-4 border-[#4a4a4a] shadow-[0_8px_0_#1f2a35]">
            <div className={`w-12 h-12 rounded-full transition-colors ${activeLight === 'red' ? 'bg-[#e74c3c] glow-red' : 'bg-gray-500'}`}></div>
            <div className={`w-12 h-12 rounded-full transition-colors ${activeLight === 'yellow' ? 'bg-[#f1c40f] glow-yellow' : 'bg-gray-500'}`}></div>
            <div className={`w-12 h-12 rounded-full transition-colors ${activeLight === 'green' ? 'bg-[#2ecc71] glow-green' : 'bg-gray-500'}`}></div>
        </div>
    );
};

type PlayerProps = {
    team: Team;
    position: number;
    status: PlayerStatuses[Team];
};

const Player: React.FC<PlayerProps> = ({ team, position, status }) => {
    // Precisely centered the players over their GO buttons without moving the buttons.
    const leftPosition = team === 'red' ? 'left-[21.25%]' : 'left-[78.75%]';

    let statusEmoji = '';
    if (!status.isWinner) {
        if (status.isFrozen) statusEmoji = '🧊';
        else if (status.isSlowed) statusEmoji = '🐌';
        else if (status.hasShield) statusEmoji = '🛡️';
        else if (status.isBoosted) statusEmoji = '🚀';
    }

    const playerContainerAnimation = status.penalty ? 'animation-shake' : '';
    const playerStyleAnimation = status.hasShield || status.isBoosted ? 'animation-shield-pulse' : (status.isSlowed || status.isFrozen) ? 'animation-slowed-pulse' : '';
    
    let playerMotionAnimation = '';
    if (status.isWinner) {
        playerMotionAnimation = 'animation-cheer-jump';
    } else if (!status.isFrozen) {
        playerMotionAnimation = 'animation-runner-bob';
    }


    return (
        <div 
            className={`player-container absolute -translate-x-1/2 w-12 text-center z-20 transition-all duration-200 ease-out ${leftPosition} ${playerContainerAnimation}`} 
            style={{ bottom: `${Math.min(position, 83)}%` }}
        >
            <div className={`status-icon absolute top-[-35px] left-1/2 -translate-x-1/2 text-3xl transition-opacity ${statusEmoji ? 'opacity-100' : 'opacity-0'}`}>
                {statusEmoji}
            </div>
            {/* VFX wrappers */}
            <div className="relative">
                {status.isFrozen && <div className="frost-ring" />}
                {status.isSlowed && <div className="mud-splash" />}
                <div className={`player text-6xl transition-transform ${playerStyleAnimation} ${playerMotionAnimation} ${status.isBoosted ? 'speedlines' : ''} ${(status.isSlowed || status.isFrozen) ? 'aura-outline-red' : ''} ${(!status.isSlowed && !status.isFrozen && (status.hasShield || status.isBoosted)) ? 'aura-outline-blue' : ''}`}>
                    {status.isWinner ? '🥳' : '🏃'}
                </div>
            </div>
        </div>
    );
};

type ItemComponentProps = {
    item: Item;
};

const ItemComponent: React.FC<ItemComponentProps> = ({ item }) => {
    // Aligned items to the player track center.
    const leftPosition = item.team === 'red' ? 'left-[21.25%]' : 'left-[78.75%]';
    return (
        <div 
            // Increased item size by ~10% for better visibility.
            className={`absolute text-[3rem] z-20 cursor-pointer ${leftPosition} ${item.disappearing ? 'animation-item-disappear' : 'animation-item-appear'}`} 
            style={{ bottom: `${item.position}%` }}
        >
            {ITEM_EMOJIS[item.type]}
        </div>
    );
};


type GameAreaProps = {
    positions: { [key in Team]: number };
    playerStatus: PlayerStatuses;
    currentLight: LightColor;
    items: Item[];
};

const GameArea: React.FC<GameAreaProps> = ({ positions, playerStatus, currentLight, items }) => {
    const isCelebrating = playerStatus.red.isWinner || playerStatus.blue.isWinner;
    return (
        <div className="flex-grow relative bg-gradient-to-b from-sky-300 to-green-500 flex justify-center items-center overflow-hidden">
            {/* Background: sun, hills, crowd, flags, banner */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                {/* Sun */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-300 rounded-full sun-pulse opacity-90"></div>
                {/* Distant hills */}
                <div className="absolute bottom-[110px] left-[-10%] w-[60%] h-40 bg-green-600/70 rounded-[50%] blur-sm hill-sway"></div>
                <div className="absolute bottom-[110px] right-[-10%] w-[60%] h-44 bg-green-700/70 rounded-[50%] blur-sm hill-sway" style={{ animationDelay: '1.5s' }}></div>
                {/* Crowd stands */}
                <div className="absolute bottom-[110px] left-0 w-full h-14 bg-gradient-to-t from-gray-700 to-gray-500 opacity-80"></div>
                <div className="absolute bottom-[110px] left-0 w-full h-14 flex gap-2 justify-center items-end opacity-90">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-yellow-200' : i % 3 === 1 ? 'bg-pink-300' : 'bg-blue-300'}`}></div>
                    ))}
                </div>
                {/* Flags */}
                <div className="absolute bottom-[124px] left-[20%] w-10 h-10">
                    <div className="absolute bottom-0 left-1 w-1 h-10 bg-[#A0522D]"></div>
                    <div className="absolute top-0 left-2 w-8 h-4 bg-red-500 flag-wave"></div>
                </div>
                <div className="absolute bottom-[124px] right-[20%] w-10 h-10">
                    <div className="absolute bottom-0 right-1 w-1 h-10 bg-[#A0522D]"></div>
                    <div className="absolute top-0 right-2 w-8 h-4 bg-blue-500 flag-wave"></div>
                </div>
                {/* Banner */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white/80 text-gray-800 text-xl font-bold shadow banner-bounce">Stop & Go Race</div>
            </div>
            
            {isCelebrating && <Confetti />}

            <div id="track" className="w-4/5 h-full bg-[#D2B48C] relative border-l-[10px] border-r-[10px] border-[#A0522D] shadow-inner">
                {/* Track texture overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(0,0,0,0.08) 0 1px, transparent 2px)', backgroundSize: '18px 18px' }}></div>
                <div id="center-divider" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[12%] h-[88%] bg-green-600 border-l-4 border-r-4 border-dashed border-white/70 z-[2]">
                    <TrafficLight activeLight={currentLight} />
                </div>
                <div id="finish-line" className="absolute top-[12%] left-0 w-full h-6 z-[1] shadow-[0_2px_0_rgba(0,0,0,0.15)]" style={{ 
                    backgroundImage: 'repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), repeating-linear-gradient(-45deg, #333 25%, #fff 25%, #fff 75%, #333 75%, #333)',
                    backgroundSize: '20px 20px'
                }}></div>
                
                <Player team="red" position={positions.red} status={playerStatus.red} />
                <Player team="blue" position={positions.blue} status={playerStatus.blue} />

                {items.map(item => <ItemComponent key={item.id} item={item} />)}
            </div>
        </div>
    );
};

export default GameArea;