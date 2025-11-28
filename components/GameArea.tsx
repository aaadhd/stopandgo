import React, { useState, useEffect, useRef } from 'react';
import { Team, LightColor, PlayerStatuses, Item, Teams } from '../types';
import { ITEM_IMAGES, FINISH_POSITION } from '../constants';
import SpritePlayer from './SpritePlayer';

const CONFETTI_COLORS = ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00', '#FFA500'];

const Confetti: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-30 pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => {
                const angle = Math.random() * 360;
                const distance = 150 + Math.random() * 200;
                const velocity = 0.8 + Math.random() * 0.4;
                const size = 4 + Math.random() * 8;
                const gravity = 0.5 + Math.random() * 0.3;

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
                            '--burst-rotation': `${Math.random() * 720 - 360}deg`
                        } as React.CSSProperties}
                    />
                );
            })}
        </div>
    );
};

type TrafficLightProps = {
    activeLight: LightColor;
};

const TrafficLight: React.FC<TrafficLightProps> = ({ activeLight }) => {
    return (
        <div id="traffic-light" className="absolute bottom-[240px] left-1/2 -translate-x-1/2 rounded-xl flex flex-col z-20" style={{
            background: '#3a3a3a',
            boxShadow: '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
            border: '1.5px solid #555555',
            padding: '8.4px',
            gap: '7.2px'
        }}>
            <div className={`rounded-full transition-all duration-300`} style={{
                width: '33.6px',
                height: '33.6px',
                background: activeLight === 'red' ? '#FF5D5D' : '#4a4a4a',
                boxShadow: activeLight === 'red'
                    ? '0 0 0 3px rgba(255,93,93,.6), 0 0 20px rgba(255,93,93,.9), 0 0 35px rgba(255,93,93,.7)'
                    : 'none',
                border: '1px solid rgba(0,0,0,.2)',
                transform: activeLight === 'red' ? 'scale(1.15)' : 'scale(1)'
            }}></div>
            <div className={`rounded-full transition-all duration-300`} style={{
                width: '33.6px',
                height: '33.6px',
                background: activeLight === 'yellow' ? '#FFD84C' : '#4a4a4a',
                boxShadow: activeLight === 'yellow'
                    ? '0 0 0 3px rgba(255,216,76,.6), 0 0 20px rgba(255,216,76,.9), 0 0 35px rgba(255,216,76,.7)'
                    : 'none',
                border: '1px solid rgba(0,0,0,.2)',
                transform: activeLight === 'yellow' ? 'scale(1.15)' : 'scale(1)'
            }}></div>
            <div className={`rounded-full transition-all duration-300`} style={{
                width: '33.6px',
                height: '33.6px',
                background: activeLight === 'green' ? '#49D86D' : '#4a4a4a',
                boxShadow: activeLight === 'green'
                    ? '0 0 0 3px rgba(73,216,109,.6), 0 0 20px rgba(73,216,109,.9), 0 0 35px rgba(73,216,109,.7)'
                    : 'none',
                border: '1px solid rgba(0,0,0,.2)',
                transform: activeLight === 'green' ? 'scale(1.15)' : 'scale(1)'
            }}></div>
        </div>
    );
};

type PlayerProps = {
    team: Team;
    position: number;
    status: PlayerStatuses[Team];
    currentRound: number;
    opponentStatus: PlayerStatuses[Team];
};

const Player: React.FC<PlayerProps> = ({ team, position, status, currentRound, opponentStatus }) => {
    // 위로 올라갈수록 25도까지 기울임
    const startPosition = 5;
    const maxPosition = FINISH_POSITION;
    const normalizedPosition = Math.max(0, position - startPosition);
    const maxRange = maxPosition - startPosition;
    const tiltRatio = maxRange > 0 ? normalizedPosition / maxRange : 0;

    // 대각선 이동 경로
    const horizontalOffset = tiltRatio * 10;
    const baseLeft = team === 'cyan' ? 30 : 67;
    const tiltDirection = team === 'cyan' ? -1 : 1;
    const finalLeft = baseLeft + (horizontalOffset * tiltDirection * -1);

    // 라운드 테마 반복 (1,2,3 반복)
    const themeRound = ((currentRound - 1) % 3) + 1;

    // 플레이어 움직임 감지
    const [isMoving, setIsMoving] = useState(false);
    const lastPositionRef = useRef(position);
    const movementTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // position이 변경되면 움직이고 있다고 표시
        if (position !== lastPositionRef.current && position > 5) {
            setIsMoving(true);
            lastPositionRef.current = position;

            // 기존 타이머 클리어
            if (movementTimerRef.current) {
                clearTimeout(movementTimerRef.current);
            }

            // 연속적으로 이동할 때는 타이머를 리셋하여 애니메이션이 끊기지 않도록 함
            movementTimerRef.current = setTimeout(() => {
                // position이 여전히 변경되고 있으면 움직임 상태 유지
                // 실제로 멈췄을 때만 isMoving을 false로 설정
                if (position === lastPositionRef.current) {
                    setIsMoving(false);
                }
            }, 800); // 0.8초로 증가하여 더 부드럽게
        }

        // position이 5 이하면 출발선이므로 멈춤 상태
        if (position <= 5) {
            setIsMoving(false);
            lastPositionRef.current = position;
            if (movementTimerRef.current) {
                clearTimeout(movementTimerRef.current);
                movementTimerRef.current = null;
            }
        }

        return () => {
            if (movementTimerRef.current) {
                clearTimeout(movementTimerRef.current);
            }
        };
    }, [position]);

    // 상태에 따른 스프라이트 선택
    const getPlayerSpriteInfo = () => {
        const baseSprite = team === 'cyan' ? 'rabbit' : 'fox';

        // 게임이 끝났을 때 (누군가 승리)
        if (status.isWinner || opponentStatus.isWinner) {
            // 내가 이긴 경우
            if (status.isWinner) {
                return {
                    path: `/sprite/${baseSprite}_win.png`,
                    // rabbit_win: 1014x2304 (6x6=36프레임) → 프레임당 169x384 (비율 0.440), height 110 기준 width ≈ 48.4
                    // fox_win: 1452x1944 (6x6=36프레임) → 프레임당 242x324 (비율 0.747), height 80 기준 width ≈ 59.8 (20% 축소)
                    width: team === 'cyan' ? 48 : 60,
                    height: team === 'cyan' ? 110 : 80,
                    fps: 24,
                    totalFrames: 36,
                    columns: 6,
                    rows: 6
                };
            }
            // 상대가 이긴 경우 (내가 진 경우)
            return {
                path: `/sprite/${baseSprite}_clap.png`,
                // rabbit_clap: 984x1566 → 프레임당 164x261 (비율 0.628), height 100 기준 width ≈ 62.8
                // fox_clap: 1368x1578 → 프레임당 228x263 (비율 0.867), height 80 기준 width ≈ 69.4 (fox_breathing과 동일 높이)
                width: team === 'cyan' ? 63 : 69,
                height: team === 'cyan' ? 100 : 80,
                fps: 24,
                totalFrames: 36,
                columns: 6,
                rows: 6
            };
        }

        // 출발선에 있거나 멈춰있을 때
        // position <= 5이거나 isMoving이 false이면 breathing 스프라이트 사용
        if (position <= 5 || !isMoving) {
            return {
                path: `/sprite/${baseSprite}_breathing.png`,
                // rabbit_breathing: 864x1560 → 프레임당 144x260 (비율 0.554), height 96 기준 width ≈ 53.2
                // fox_breathing: 1152x1566 → 프레임당 192x261 (비율 0.736), height 80 기준 width ≈ 58.9
                width: team === 'cyan' ? 53 : 59,
                height: team === 'cyan' ? 96 : 80,
                fps: 24,
                totalFrames: 36,
                columns: 6,
                rows: 6
            };
        }

        // 이동 중 (position > 5 && isMoving === true)
        return {
            path: `/sprite/${baseSprite}_running.png`,
            // rabbit_running: 780x1662 → 프레임당 130x277 (비율 0.469), height 100 기준 width ≈ 46.9
            // fox_running: 1224x1650 → 프레임당 204x275 (비율 0.742), height 82 기준 width ≈ 60.8
            width: team === 'cyan' ? 47 : 61,
            height: team === 'cyan' ? 100 : 82,
            fps: 24,
            totalFrames: 36,
            columns: 6,
            rows: 6
        };
    };

    const spriteInfo = getPlayerSpriteInfo();

    let statusImage = null;
    let statusType: 'good' | 'bad' | null = null;
    if (!status.isWinner) {
        if (status.isFrozen) {
            statusImage = ITEM_IMAGES.ice;
            statusType = 'bad';
        } else if (status.isSlowed) {
            statusImage = ITEM_IMAGES.slow;
            statusType = 'bad';
        } else if (status.hasShield) {
            statusImage = ITEM_IMAGES.shield;
            statusType = 'good';
        } else if (status.isBoosted) {
            statusImage = ITEM_IMAGES.booster;
            statusType = 'good';
        }
    }

    // 디버깅: 상태 확인
    if (statusImage) {
        console.log(`[Player ${team}] Status image:`, statusImage, 'Status:', {
            isFrozen: status.isFrozen,
            isSlowed: status.isSlowed,
            hasShield: status.hasShield,
            isBoosted: status.isBoosted,
            isWinner: status.isWinner
        });
    }

    // 상태에 따른 색상 효과
    const getStatusFilter = () => {
        if (statusType === 'good') {
            // 좋은 아이템: 파란색/초록색 글로우
            return 'drop-shadow(0 0 8px rgba(73, 216, 109, 0.9)) drop-shadow(0 0 15px rgba(73, 216, 109, 0.7))';
        } else if (statusType === 'bad') {
            // 나쁜 아이템: 빨간색 글로우
            return 'drop-shadow(0 0 8px rgba(255, 93, 93, 0.9)) drop-shadow(0 0 15px rgba(255, 93, 93, 0.7))';
        }
        return 'drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 15px rgba(255,255,255,0.7))';
    };

    const playerContainerAnimation = status.penalty ? 'animation-shake' : '';
    const playerStyleAnimation = status.hasShield || status.isBoosted ? 'animation-shield-pulse' : (status.isSlowed || status.isFrozen) ? 'animation-slowed-pulse' : '';

    let playerMotionAnimation = '';
    if (status.isWinner) {
        playerMotionAnimation = 'animation-cheer-jump';
    } else if (!status.isFrozen && position > 5 && isMoving) {
        // 출발선이 아니고 움직이고 있을 때만 bob 애니메이션
        playerMotionAnimation = 'animation-runner-bob';
    }


    // 승리 시 스프라이트 높이 차이를 보정하여 발 위치를 동일하게
    const winHeightOffset = status.isWinner ? (team === 'cyan' ? 0 : 2.5) : 0; // fox는 2.5% 더 올림
    
    return (
        <div
            className="player-container-wrapper"
            style={{
                position: 'absolute',
                width: '3rem',
                textAlign: 'center',
                zIndex: status.isWinner ? 9999 : 30, // 승리 시 모든 UI 요소보다 위에 표시 (헤더보다 훨씬 높게)
                bottom: status.isWinner ? `${Math.min(position + 3 + winHeightOffset, 95)}%` : `${Math.min(position + 5, 95)}%`,
                left: `${finalLeft}%`,
                transform: `translateX(-50%)`,
                transformOrigin: 'center bottom',
                overflow: 'visible'
            }}
            data-position={position}
        >
            <div className={`player-container ${playerContainerAnimation}`} style={{ position: 'relative', overflow: 'visible' }}>
                {statusImage && (
                    <div className="status-icon absolute left-1/2 -translate-x-1/2 transition-opacity opacity-100" style={{ top: '-70px', zIndex: 50, pointerEvents: 'none', width: '60px', height: '60px' }}>
                        <img
                            src={statusImage}
                            alt="status effect"
                            style={{
                                width: '60px',
                                height: '60px',
                                display: 'block',
                                objectFit: 'contain',
                                filter: getStatusFilter(),
                                imageRendering: 'auto'
                            }}
                        />
                    </div>
                )}
                {/* VFX wrappers */}
                <div className="relative">
                    <div className={`player transition-transform ${playerStyleAnimation} ${playerMotionAnimation} ${status.isBoosted ? 'speedlines' : ''} ${(status.isSlowed || status.isFrozen) && !status.penalty ? 'aura-outline-red' : ''} ${(!status.isSlowed && !status.isFrozen && (status.hasShield || status.isBoosted)) ? 'aura-outline-blue' : ''}`}>
                        <SpritePlayer
                            spritePath={spriteInfo.path}
                            totalFrames={spriteInfo.totalFrames}
                            columns={spriteInfo.columns}
                            rows={spriteInfo.rows}
                            fps={spriteInfo.fps}
                            width={spriteInfo.width}
                            height={spriteInfo.height}
                            loopDelay={spriteInfo.loopDelay}
                            reversed={spriteInfo.reversed}
                            className="mx-auto"
                            style={{
                                transform: 'scale(1.2)'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

type ItemComponentProps = {
    item: Item;
};

const ItemComponent: React.FC<ItemComponentProps> = ({ item }) => {
    const startPosition = 5;
    const maxPosition = FINISH_POSITION;
    const normalizedPosition = Math.max(0, item.position - startPosition);
    const maxRange = maxPosition - startPosition;
    const tiltRatio = maxRange > 0 ? normalizedPosition / maxRange : 0;

    const horizontalOffset = tiltRatio * 10;
    const baseLeft = item.team === 'cyan' ? 30 : 67;
    const tiltDirection = item.team === 'cyan' ? -1 : 1;
    // Team A(cyan)는 왼쪽으로, Team B(purple)는 오른쪽으로 추가 오프셋
    const additionalOffset = item.team === 'cyan' ? -3 : 3;
    const finalLeft = baseLeft + (horizontalOffset * tiltDirection * -1) + additionalOffset;

    return (
        <div
            className={`absolute z-20 cursor-pointer ${item.disappearing ? 'animation-item-disappear' : 'animation-item-appear'}`}
            style={{
                bottom: `${item.position}%`,
                left: `${finalLeft}%`,
                transform: 'translateX(-50%)'
            }}
        >
            <img 
                src={ITEM_IMAGES[item.type]} 
                alt={item.type}
                className="w-24 h-24 object-contain"
                style={{
                    filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 3px white)',
                    WebkitFilter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 3px white)'
                }}
            />
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
    onAddCheerPoints: (team: Team, points: number) => void;
};

const GameArea: React.FC<GameAreaProps> = ({ positions, playerStatus, currentLight, items, scores, currentRound, teams, onAddCheerPoints }) => {
    const isCelebrating = playerStatus.cyan.isWinner || playerStatus.purple.isWinner;
    const [scoreAnimation, setScoreAnimation] = useState<{ cyan: boolean; purple: boolean }>({ cyan: false, purple: false });


    // 벌칙 시 화면 진동 효과 제거됨

    // 점수 변경 시 애니메이션 효과 (확성기 클릭 제외)
    const prevScoresRef = useRef(scores);
    useEffect(() => {
        // 점수가 변경되었을 때만 애니메이션 (확성기 클릭은 제외)
        const cyanChanged = prevScoresRef.current.cyan !== scores.cyan;
        const purpleChanged = prevScoresRef.current.purple !== scores.purple;
        
        if (cyanChanged || purpleChanged) {
            // 확성기 클릭이 아닌 경우에만 양쪽 모두 애니메이션
            // (확성기 클릭은 handleCheerClick에서 처리)
        }
        
        prevScoresRef.current = scores;
    }, [scores.cyan, scores.purple]);

    // 확성기 클릭 핸들러
    const handleCheerClick = (team: Team) => {
        // 해당 팀만 애니메이션
        setScoreAnimation(prev => ({ ...prev, [team]: true }));
        const timer = setTimeout(() => {
            setScoreAnimation(prev => ({ ...prev, [team]: false }));
        }, 300);
        onAddCheerPoints(team, 10);
    };


    const themeRound = ((currentRound - 1) % 3) + 1;

    const getImageSource = () => {
        switch (themeRound) {
            case 1: return '/images/forest.png';
            case 2: return '/images/undersea.png';
            case 3: return '/images/space.png';
            default: return null;
        }
    };

    const getBackgroundStyle = () => {
        switch (themeRound) {
            case 1:
                return {
                    background: 'linear-gradient(180deg, #8FD69A 0%, #6BC585 50%, #3BB85A 100%)',
                    boxShadow: 'inset 0 0 120px rgba(73, 216, 109, 0.25)'
                };
            case 2:
                return {
                    background: 'linear-gradient(180deg, #6BB8E8 0%, #4AA5D9 50%, #2A8FCC 100%)',
                    boxShadow: 'inset 0 0 120px rgba(66, 191, 255, 0.25)'
                };
            case 3:
                return {
                    background: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a3a 50%, #0a0a2a 100%)',
                    boxShadow: 'inset 0 0 120px rgba(0, 255, 255, 0.15)'
                };
            default:
                return {};
        }
    };

    const imageSource = getImageSource();

    return (
        <div className="flex-grow relative flex justify-center items-center overflow-hidden" style={getBackgroundStyle()}>
            {/* 배경 이미지 */}
            {imageSource && (
                <img
                    src={imageSource}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        zIndex: 0,
                        objectPosition: 'center center'
                    }}
                />
            )}

            <div className="absolute inset-0 z-[1] pointer-events-none">
                <div className="absolute left-6 pointer-events-auto" style={{ top: '100px' }}>
                    {/* 점수판 */}
                    <div className={`px-6 py-3 rounded-xl text-2xl font-bold transition-all ${scoreAnimation.cyan ? 'score-pop' : ''}`} style={{
                        background: 'rgba(8, 145, 178, 0.9)',
                        boxShadow: '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
                        border: '1.5px solid #0e7490',
                        marginBottom: '8px',
                        minWidth: '220px',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <span className="text-white">Team A</span>
                        <span className="text-white">: </span>
                        <span className="text-yellow-300 font-black drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{scores.cyan}</span>
                        {/* 응원 버튼 - 뱃지 스타일 */}
                        <button
                            onClick={() => handleCheerClick('cyan')}
                            className="w-8 h-8 rounded-full text-base bg-white hover:bg-yellow-100 active:scale-90 transition-all flex items-center justify-center"
                            style={{ 
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
                                border: '2px solid rgba(8, 145, 178, 0.9)'
                            }}
                        >
                            📣
                        </button>
                    </div>
                    <div className="px-4 py-3 rounded-xl" style={{
                        background: 'rgba(8, 145, 178, 0.9)',
                        boxShadow: '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
                        border: '1.5px solid #0e7490',
                        minWidth: '220px',
                        textAlign: 'center'
                    }}>
                        <div className="text-white space-y-1">
                            {(() => {
                                const rotatedPlayers = [...teams.cyan];
                                const rotationOffset = (currentRound - 1) % teams.cyan.length;
                                const rotated = [...rotatedPlayers.slice(rotationOffset), ...rotatedPlayers.slice(0, rotationOffset)];
                                
                                return rotated.slice(0, 3).map((player, index) => (
                                    <div 
                                        key={player.id}
                                        className={index === 0 ? "font-black text-yellow-300 drop-shadow-lg" : ""}
                                        style={index === 0 ? {
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                            fontSize: '17px'
                                        } : {
                                            fontSize: '17px'
                                        }}
                                    >
                                        {player.name}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                <div className="absolute right-6 pointer-events-auto" style={{ top: '100px' }}>
                    {/* 점수판 */}
                    <div className={`px-6 py-3 rounded-xl text-2xl font-bold transition-all ${scoreAnimation.purple ? 'score-pop' : ''}`} style={{
                        background: 'rgba(147, 51, 234, 0.9)',
                        boxShadow: '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
                        border: '1.5px solid #7c3aed',
                        marginBottom: '8px',
                        minWidth: '220px',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <span className="text-white">Team B</span>
                        <span className="text-white">: </span>
                        <span className="text-yellow-300 font-black drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{scores.purple}</span>
                        {/* 응원 버튼 - 뱃지 스타일 */}
                        <button
                            onClick={() => handleCheerClick('purple')}
                            className="w-8 h-8 rounded-full text-base bg-white hover:bg-yellow-100 active:scale-90 transition-all flex items-center justify-center"
                            style={{ 
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
                                border: '2px solid rgba(147, 51, 234, 0.9)'
                            }}
                        >
                            📣
                        </button>
                    </div>
                    <div className="px-4 py-3 rounded-xl" style={{
                        background: 'rgba(147, 51, 234, 0.9)',
                        boxShadow: '0 4px 8px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.3)',
                        border: '1.5px solid #7c3aed',
                        minWidth: '220px',
                        textAlign: 'center'
                    }}>
                        <div className="text-white space-y-1">
                            {(() => {
                                const rotatedPlayers = [...teams.purple];
                                const rotationOffset = (currentRound - 1) % teams.purple.length;
                                const rotated = [...rotatedPlayers.slice(rotationOffset), ...rotatedPlayers.slice(0, rotationOffset)];
                                
                                return rotated.slice(0, 3).map((player, index) => (
                                    <div 
                                        key={player.id}
                                        className={index === 0 ? "font-black text-yellow-300 drop-shadow-lg" : ""}
                                        style={index === 0 ? {
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                            fontSize: '17px'
                                        } : {
                                            fontSize: '17px'
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
                {/* 신호등을 trail 외부에 배치 */}
                <div className="absolute left-1/2 z-30" style={{ top: '105%', transform: 'translate(-50%, -50%)' }}>
                    <TrafficLight activeLight={currentLight} />
                </div>

                {/* Trail: 중앙 경기장 */}
                <div className="trail">
                    {/* 결승선 */}
                    <div id="finish-line" className="absolute top-[16%] left-1/2 -translate-x-1/2 w-1/2 z-[3] rounded-lg" style={{
                        height: '19.2px',
                        background: 'repeating-linear-gradient(90deg, #2a2a2a 0px, #2a2a2a 35px, #ffffff 35px, #ffffff 70px)',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        opacity: 0.95
                    }}></div>

                    <Player team="cyan" position={positions.cyan} status={playerStatus.cyan} currentRound={currentRound} opponentStatus={playerStatus.purple} />
                    <Player team="purple" position={positions.purple} status={playerStatus.purple} currentRound={currentRound} opponentStatus={playerStatus.cyan} />

                {items.map(item => <ItemComponent key={item.id} item={item} />)}
                </div>
            </div>
        </div>
    );
};

export default GameArea;