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

const Cloud: React.FC<{ top: string; left: string; scale: number; opacity: number }> = ({ top, left, scale, opacity }) => {
    return (
        <div className="absolute z-0" style={{ top, left, transform: `scale(${scale})`, opacity }}>
            <div className="bg-white/90 rounded-full w-24 h-24 relative">
                <div className="bg-white/90 rounded-full w-16 h-16 absolute -top-8 -right-8"></div>
                <div className="bg-white/90 rounded-full w-20 h-20 absolute -bottom-4 -right-4"></div>
                <div className="bg-white/90 rounded-full w-16 h-16 absolute -bottom-2 -left-8"></div>
            </div>
        </div>
    );
};

type TrafficLightProps = {
    activeLight: LightColor;
};

const TrafficLight: React.FC<TrafficLightProps> = ({ activeLight }) => {
    return (
        <div id="traffic-light" className="absolute bottom-[120px] left-1/2 -translate-x-1/2 bg-[#2c3e50] p-2.5 rounded-2xl flex flex-col gap-2 z-20 border-4 border-[#4a4a4a]">
            <div className={`w-12 h-12 rounded-full transition-colors ${activeLight === 'red' ? 'bg-[#e74c3c] shadow-[0_0_20px_#e74c3c]' : 'bg-gray-500'}`}></div>
            <div className={`w-12 h-12 rounded-full transition-colors ${activeLight === 'yellow' ? 'bg-[#f1c40f] shadow-[0_0_20px_#f1c40f]' : 'bg-gray-500'}`}></div>
            <div className={`w-12 h-12 rounded-full transition-colors ${activeLight === 'green' ? 'bg-[#2ecc71] shadow-[0_0_20px_#2ecc71]' : 'bg-gray-500'}`}></div>
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
            style={{ bottom: `${Math.min(position, 85)}%` }}
        >
            <div className={`status-icon absolute top-[-35px] left-1/2 -translate-x-1/2 text-3xl transition-opacity ${statusEmoji ? 'opacity-100' : 'opacity-0'}`}>
                {statusEmoji}
            </div>
            <div className={`player text-6xl transition-transform text-shadow-white ${playerStyleAnimation} ${playerMotionAnimation}`}>
                 {status.isWinner ? '🥳' : '🏃'}
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
        <div className="flex-grow relative bg-green-400 flex justify-center items-center overflow-hidden">
            {/* Background Decorations */}
            <Cloud top="5%" left="15%" scale={0.8} opacity={0.7} />
            <Cloud top="15%" left="80%" scale={1.2} opacity={0.8} />
            <Cloud top="20%" left="40%" scale={1.0} opacity={0.6} />
            
            {isCelebrating && <Confetti />}

            <div id="track" className="w-4/5 h-full bg-[#D2B48C] relative border-l-[10px] border-r-[10px] border-[#A0522D]">
                <div id="center-divider" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[12%] h-[88%] bg-green-600 border-l-4 border-r-4 border-dashed border-white/70 z-[2]">
                    <TrafficLight activeLight={currentLight} />
                </div>
                <div id="finish-line" className="absolute top-[12%] left-0 w-full h-6 z-[1]" style={{ 
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