import React, { useState, useEffect } from 'react';
import { Team, LightColor, PlayerStatuses, Item, Teams } from '../types';
import { ITEM_EMOJIS } from '../constants';

const CONFETTI_COLORS = ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00', '#FFA500'];

const Confetti: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-30 pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => {
                // 더 자연스러운 폭발 효과를 위한 랜덤 각도와 거리
                const angle = Math.random() * 360; // 완전 랜덤 각도
                const distance = 150 + Math.random() * 200; // 150px~350px 거리
                const velocity = 0.8 + Math.random() * 0.4; // 0.8~1.2 속도 변수
                const size = 4 + Math.random() * 8; // 4px~12px 크기 변수
                const gravity = 0.5 + Math.random() * 0.3; // 중력 효과
                
                const x = Math.cos(angle * Math.PI / 180) * distance * velocity;
                const y = Math.sin(angle * Math.PI / 180) * distance * velocity;
                
                return (
                    <div
                        key={i}
                        className="confetti-natural"
                        style={{
                            left: '50%',
                            top: '50%',
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                            animationDelay: `${Math.random() * 0.3}s`,
                            animationDuration: `${1.5 + Math.random() * 1}s`,
                            '--burst-x': `${x}px`,
                            '--burst-y': `${y}px`,
                            '--burst-gravity': gravity,
                            '--burst-rotation': `${Math.random() * 720 - 360}deg`, // -360도 ~ 360도 회전
                        } as React.CSSProperties}
                    />
                );
            })}
        </div>
    );
};

// Clouds removed

type TrafficLightProps = {
    activeLight: LightColor;
};

const TrafficLight: React.FC<TrafficLightProps> = ({ activeLight }) => {
    return (
        <div id="traffic-light" className="absolute bottom-[120px] left-1/2 -translate-x-1/2 p-3.5 rounded-3xl flex flex-col gap-3 z-20" style={{
            background: '#3a3a3a',
            boxShadow: '0 8px 16px rgba(0,0,0,.4), 0 4px 8px rgba(0,0,0,.3)',
            border: '3px solid #2a2a2a'
        }}>
            <div className={`w-14 h-14 rounded-full transition-all duration-300`} style={{
                background: activeLight === 'red' ? '#FF5D5D' : '#4a4a4a',
                boxShadow: activeLight === 'red'
                    ? '0 0 0 3px rgba(255,93,93,.4), 0 0 16px rgba(255,93,93,.6)'
                    : 'none',
                border: '2px solid rgba(0,0,0,.2)'
            }}></div>
            <div className={`w-14 h-14 rounded-full transition-all duration-300`} style={{
                background: activeLight === 'yellow' ? '#FFD84C' : '#4a4a4a',
                boxShadow: activeLight === 'yellow'
                    ? '0 0 0 3px rgba(255,216,76,.4), 0 0 16px rgba(255,216,76,.6)'
                    : 'none',
                border: '2px solid rgba(0,0,0,.2)'
            }}></div>
            <div className={`w-14 h-14 rounded-full transition-all duration-300`} style={{
                background: activeLight === 'green' ? '#49D86D' : '#4a4a4a',
                boxShadow: activeLight === 'green'
                    ? '0 0 0 3px rgba(73,216,109,.4), 0 0 16px rgba(73,216,109,.6)'
                    : 'none',
                border: '2px solid rgba(0,0,0,.2)'
            }}></div>
        </div>
    );
};

type PlayerProps = {
    team: Team;
    position: number;
    status: PlayerStatuses[Team];
    currentRound: number;
};

const Player: React.FC<PlayerProps> = ({ team, position, status, currentRound }) => {
    // 전체 너비에서 좌우로 배치
    const leftPosition = team === 'red' ? 'left-[25%]' : 'left-[72%]';

    // 라운드 테마 반복 (1,2,3 반복)
    const themeRound = ((currentRound - 1) % 3) + 1;

    // 라운드별 플레이어 이미지/이모지
    const getPlayerImage = () => {
        if (status.isWinner && themeRound === 1) return '/rabbit-jumping.gif'; // 토끼 승리 GIF
        if (status.isWinner) return '🥳'; // 다른 라운드 승리 이모지
        
        switch (themeRound) {
            case 1: return '/A-rabbit-running-in-a-sports-day-event-viewed-from-64px-16.gif'; // 토끼 (숲)
            case 2: return '🐠'; // 물고기 (바다)
            case 3: return '🤖'; // 로봇 (우주정거장)
            default: return '🏃'; // 기본
        }
    };

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
            style={{ bottom: `${Math.min(position + 5, 95)}%` }}
        >
            <div className={`status-icon absolute top-[-35px] left-1/2 -translate-x-1/2 text-3xl transition-opacity ${statusEmoji ? 'opacity-100' : 'opacity-0'}`}>
                {statusEmoji}
            </div>
            {/* VFX wrappers */}
            <div className="relative">
                {status.isFrozen && <div className="frost-ring" />}
                {status.isSlowed && <div className="mud-splash" />}
                {!status.isFrozen && !status.isWinner && <div className="dust-trail" />}
                <div className={`player text-6xl transition-transform ${playerStyleAnimation} ${playerMotionAnimation} ${status.isBoosted ? 'speedlines' : ''} ${(status.isSlowed || status.isFrozen) && !status.penalty ? 'aura-outline-red' : ''} ${(!status.isSlowed && !status.isFrozen && (status.hasShield || status.isBoosted)) ? 'aura-outline-blue' : ''}`}>
                    {themeRound === 1 ? (
                        <img 
                            src={getPlayerImage()} 
                            alt={status.isWinner ? "Jumping Rabbit" : "Running Rabbit"} 
                            className="w-16 h-16 object-contain mx-auto scale-[1.69]"
                        />
                    ) : (
                        getPlayerImage()
                    )}
                </div>
            </div>
        </div>
    );
};

type ItemComponentProps = {
    item: Item;
};

const ItemComponent: React.FC<ItemComponentProps> = ({ item }) => {
    // 전체 너비에서 플레이어와 같은 위치에 배치 (GO 버튼 위치에 맞춤)
    const leftPosition = item.team === 'red' ? 'left-[25%]' : 'left-[72%]';
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
    scores: { [key in Team]: number };
    currentRound: number;
    teams: Teams;
};

const GameArea: React.FC<GameAreaProps> = ({ positions, playerStatus, currentLight, items, scores, currentRound, teams }) => {
    const isCelebrating = playerStatus.red.isWinner || playerStatus.blue.isWinner;
    const [scoreAnimation, setScoreAnimation] = useState<{ red: boolean; blue: boolean }>({ red: false, blue: false });


    // 벌칙 시 화면 진동 효과 제거됨

    // 점수 변경 시 애니메이션 효과
    useEffect(() => {
        setScoreAnimation({ red: true, blue: true });
        const timer = setTimeout(() => setScoreAnimation({ red: false, blue: false }), 300);
        return () => clearTimeout(timer);
    }, [scores.red, scores.blue]);


    const getBackgroundClass = () => {
        // 비디오 배경 사용 시에는 배경색만 지정 (폴백용)
        return ''; // 배경색은 inline style로 처리
    };

    // 라운드 테마 반복 (1,2,3 반복)
    const themeRound = ((currentRound - 1) % 3) + 1;

    // 라운드별 비디오 파일 경로 (모든 테마 이미지 사용)
    const getVideoSource = () => {
        switch (themeRound) {
            case 1:
                return null; // 숲 - 이미지 사용
            case 2:
                return null; // 바다 - 이미지 사용
            case 3:
                return null; // 우주정거장 - 이미지 사용
            default:
                return null;
        }
    };

    // 라운드별 이미지 파일 경로
    const getImageSource = () => {
        switch (themeRound) {
            case 1:
                return '/forest.png'; // 숲
            case 2:
                return '/sea.png'; // 바다
            case 3:
                return '/space.png'; // 우주정거장
            default:
                return null;
        }
    };

    const videoSource = getVideoSource();
    const imageSource = getImageSource();

    // 라운드별 배경색 (Vivid)
    const getBackgroundStyle = () => {
        switch (themeRound) {
            case 1: // 숲
                return {
                    background: 'linear-gradient(180deg, #8FD69A 0%, #6BC585 50%, #3BB85A 100%)',
                    boxShadow: 'inset 0 0 120px rgba(73, 216, 109, 0.25)'
                };
            case 2: // 바다
                return {
                    background: 'linear-gradient(180deg, #6BB8E8 0%, #4AA5D9 50%, #2A8FCC 100%)',
                    boxShadow: 'inset 0 0 120px rgba(66, 191, 255, 0.25)'
                };
            case 3: // 우주정거장
            return {
                    background: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a3a 50%, #0a0a2a 100%)',
                    boxShadow: 'inset 0 0 120px rgba(0, 255, 255, 0.15)'
            };
            default:
                return {};
        }
    };

    return (
        <div className={`flex-grow relative ${getBackgroundClass()} flex justify-center items-center overflow-hidden`} style={getBackgroundStyle()}>
            {/* 배경 이미지 (숲 테마) */}
            {imageSource && (
                <img
                    src={imageSource}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                />
            )}

            {/* 비디오 배경 (바다, 우주 테마) */}
            {videoSource && (
                <video
                    key={videoSource} // 라운드 변경 시 비디오 재시작
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                >
                    <source src={videoSource} type="video/mp4" />
                </video>
            )}
            
            {/* UI 요소들 (점수 및 플레이어 리스트) */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                {/* Team A Score and Players */}
                <div className="absolute left-6" style={{ top: '100px' }}>
                    {/* Team A Score */}
                    <div className={`px-6 py-3 rounded-full text-2xl font-bold transition-all ${scoreAnimation.red ? 'score-pop' : ''}`} style={{
                        background: 'rgba(8, 145, 178, 0.7)', // 모든 컨셉 동일한 투명도
                        boxShadow: themeRound === 3
                            ? '0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(8, 145, 178, 0.4)' // 우주에서는 네온 효과
                            : '0 4px 12px rgba(0,0,0,0.15)', // 숲, 바다는 기존 그림자
                        border: themeRound === 3
                            ? '3px solid rgba(0, 255, 255, 0.6)' // 우주에서는 시안색 테두리
                            : '3px solid rgba(255,255,255,0.3)', // 숲, 바다는 흰색 테두리
                        backdropFilter: 'blur(8px)',
                        marginBottom: '8px',
                        minWidth: '180px',
                        textAlign: 'center'
                    }}>
                        <span className="text-white">Team A</span>
                        <span className="text-white">: </span>
                        <span className="text-yellow-300 font-black drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{scores.red}</span>
                    </div>
                    {/* Team A Players */}
                    <div className="px-4 py-3 rounded-lg" style={{
                        background: 'rgba(8, 145, 178, 0.6)', // 모든 컨셉 동일한 투명도
                        boxShadow: themeRound === 3
                            ? '0 2px 8px rgba(0,0,0,0.2), 0 0 15px rgba(8, 145, 178, 0.3)' // 우주에서는 네온 효과
                            : '0 2px 8px rgba(0,0,0,0.1)', // 숲, 바다는 기존 그림자
                        border: themeRound === 3
                            ? '2px solid rgba(0, 255, 255, 0.5)' // 우주에서는 시안색 테두리
                            : '2px solid rgba(255,255,255,0.2)', // 숲, 바다는 흰색 테두리
                        backdropFilter: 'blur(6px)',
                        minWidth: '120px',
                        textAlign: 'center'
                    }}>
                        <div className="text-white space-y-1">
                            {(() => {
                                const rotatedPlayers = [...teams.blue];
                                const rotationOffset = (currentRound - 1) % teams.blue.length;
                                const rotated = [...rotatedPlayers.slice(rotationOffset), ...rotatedPlayers.slice(0, rotationOffset)];
                                
                                return rotated.slice(0, 3).map((player, index) => (
                                    <div 
                                        key={player.id}
                                        className={index === 0 ? "font-black text-yellow-300 drop-shadow-lg" : ""}
                                        style={index === 0 ? { 
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                            fontSize: '17px' // text-base (16px) + 1px
                                        } : {
                                            fontSize: '17px' // text-sm (14px) + 3px
                                        }}
                                    >
                                        {player.name}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Team B Score and Players */}
                <div className="absolute right-6" style={{ top: '100px' }}>
                    {/* Team B Score */}
                    <div className={`px-6 py-3 rounded-full text-2xl font-bold transition-all ${scoreAnimation.blue ? 'score-pop' : ''}`} style={{
                        background: 'rgba(147, 51, 234, 0.7)', // 모든 컨셉 동일한 투명도
                        boxShadow: themeRound === 3
                            ? '0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(147, 51, 234, 0.4)' // 우주에서는 네온 효과
                            : '0 4px 12px rgba(0,0,0,0.15)', // 숲, 바다는 기존 그림자
                        border: themeRound === 3
                            ? '3px solid rgba(255, 0, 255, 0.6)' // 우주에서는 마젠타색 테두리
                            : '3px solid rgba(255,255,255,0.3)', // 숲, 바다는 흰색 테두리
                        backdropFilter: 'blur(8px)',
                        marginBottom: '8px',
                        minWidth: '180px',
                        textAlign: 'center'
                    }}>
                        <span className="text-white">Team B</span>
                        <span className="text-white">: </span>
                        <span className="text-yellow-300 font-black drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{scores.blue}</span>
                    </div>
                    {/* Team B Players */}
                    <div className="px-4 py-3 rounded-lg" style={{
                        background: 'rgba(147, 51, 234, 0.6)', // 모든 컨셉 동일한 투명도
                        boxShadow: themeRound === 3
                            ? '0 2px 8px rgba(0,0,0,0.2), 0 0 15px rgba(147, 51, 234, 0.3)' // 우주에서는 네온 효과
                            : '0 2px 8px rgba(0,0,0,0.1)', // 숲, 바다는 기존 그림자
                        border: themeRound === 3
                            ? '2px solid rgba(255, 0, 255, 0.5)' // 우주에서는 마젠타색 테두리
                            : '2px solid rgba(255,255,255,0.2)', // 숲, 바다는 흰색 테두리
                        backdropFilter: 'blur(6px)',
                        minWidth: '120px',
                        textAlign: 'center'
                    }}>
                        <div className="text-white space-y-1">
                            {(() => {
                                const rotatedPlayers = [...teams.red];
                                const rotationOffset = (currentRound - 1) % teams.red.length;
                                const rotated = [...rotatedPlayers.slice(rotationOffset), ...rotatedPlayers.slice(0, rotationOffset)];
                                
                                return rotated.slice(0, 3).map((player, index) => (
                                    <div 
                                        key={player.id}
                                        className={index === 0 ? "font-black text-yellow-300 drop-shadow-lg" : ""}
                                        style={index === 0 ? { 
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                            fontSize: '17px' // text-base (16px) + 1px
                                        } : {
                                            fontSize: '17px' // text-sm (14px) + 3px
                                        }}
                                    >
                                        {player.name}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>
            
            {isCelebrating && <Confetti />}

            {/* Scene: 854px × 650px 컨테이너 */}
            <div className={`relative z-10 mx-auto ${themeRound === 2 ? 'fishway glass' : themeRound === 3 ? 'space' : ''}`} style={{ width: '800px', height: '650px' }}>
                {/* Flags - Flat Vivid Style */}
                <div className="absolute bottom-[20px] left-[15%] w-12 h-12 pointer-events-none">
                    <div className="absolute bottom-0 left-1 w-2.5 h-12 rounded-full" style={{
                        background: '#806040',
                        boxShadow: '2px 0 4px rgba(0,0,0,0.25)'
                    }}></div>
                    <div className="absolute top-0 left-3.5 w-10 h-6 rounded-md flag-wave" style={{
                        background: '#FF5D5D',
                        boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
                        border: '2px solid rgba(255,255,255,0.4)'
                    }}></div>
                </div>
                <div className="absolute bottom-[20px] right-[15%] w-12 h-12 pointer-events-none">
                    <div className="absolute bottom-0 right-1 w-2.5 h-12 rounded-full" style={{
                        background: '#806040',
                        boxShadow: '2px 0 4px rgba(0,0,0,0.25)'
                    }}></div>
                    <div className="absolute top-0 right-3.5 w-10 h-6 rounded-md flag-wave" style={{
                        background: '#42BFFF',
                        boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
                        border: '2px solid rgba(255,255,255,0.4)'
                    }}></div>
                </div>

                {/* 신호등을 trail 외부에 배치 */}
                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-30">
                    <TrafficLight activeLight={currentLight} />
                </div>

                {/* Trail: 중앙 흙길 */}
                <div className="trail">
                    {/* 중앙 분리선 - 테마별 스타일 */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[5px] z-[1] rounded-full" style={{
                        background: themeRound === 3 
                            ? 'repeating-linear-gradient(180deg, rgba(0,255,255,0.8) 0px, rgba(0,255,255,0.8) 22px, transparent 22px, transparent 44px)'
                            : 'repeating-linear-gradient(180deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 22px, transparent 22px, transparent 44px)',
                        boxShadow: themeRound === 3
                            ? '0 0 8px rgba(0,255,255,0.6), inset 0 0 3px rgba(0,255,255,0.3), 0 0 12px rgba(0,255,255,0.4)'
                            : '0 0 6px rgba(255,255,255,0.4), inset 0 0 2px rgba(0,0,0,0.2)'
                    }}></div>

                    {/* 결승선 - Vivid Checkered */}
                     <div id="finish-line" className="absolute top-[16%] left-0 w-full h-6 z-[3] rounded-lg" style={{
                        background: 'repeating-linear-gradient(90deg, #2a2a2a 0px, #2a2a2a 35px, #ffffff 35px, #ffffff 70px)',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        opacity: 0.95
                }}></div>
                
                <Player team="red" position={positions.red} status={playerStatus.red} currentRound={currentRound} />
                <Player team="blue" position={positions.blue} status={playerStatus.blue} currentRound={currentRound} />

                {items.map(item => <ItemComponent key={item.id} item={item} />)}
                </div>
            </div>
        </div>
    );
};

export default GameArea;