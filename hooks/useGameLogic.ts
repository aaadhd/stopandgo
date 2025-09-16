import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GamePhase, Team, Item, PlayerStatus, ItemType, LightColor } from '../types';
import {
    MAX_ROUNDS, ROUND_TIME_LIMIT, FINISH_POSITION, MOVE_AMOUNT, BOOST_MULTIPLIER,
    SLOW_MULTIPLIER, ITEM_EFFECT_DURATION, INITIAL_PLAYER_STATUSES, INITIAL_PLAYER_STATUS, MIN_ITEM_DISTANCE
} from '../constants';
import { generateQuizQuestion } from '../services/geminiService';
import { playSound } from '../utils/audio';

const initialGameState: GameState = {
    gamePhase: GamePhase.START,
    scores: { red: 0, blue: 0 },
    currentRound: 1,
    timeLeft: ROUND_TIME_LIMIT,
    positions: { red: 0, blue: 0 },
    playerStatus: INITIAL_PLAYER_STATUSES,
    currentLight: 'red',
    items: [],
    roundEndState: null,
    quiz: null,
    isQuizLoading: false,
    currentWinner: null,
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lightRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemSpawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quizTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const penaltyTimeoutRef = useRef<{ [key in Team]?: ReturnType<typeof setTimeout> }>({});
    const playerTimeoutRef = useRef<{ [key in Team]: { [key in keyof Omit<PlayerStatus, 'isWinner'|'penalty'>]?: ReturnType<typeof setTimeout> } }>({ red: {}, blue: {} });
    const isShowingQuizRef = useRef<boolean>(false);

    const clearAllTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (lightRef.current) {
            clearTimeout(lightRef.current);
            lightRef.current = null;
        }
        if (lightTimerRef.current) {
            clearTimeout(lightTimerRef.current);
            lightTimerRef.current = null;
        }
        if (itemSpawnRef.current) {
            clearTimeout(itemSpawnRef.current);
            itemSpawnRef.current = null;
        }
        if (quizTimeoutRef.current) {
            clearTimeout(quizTimeoutRef.current);
            quizTimeoutRef.current = null;
        }
        
        // 벌칙 타이머들 정리
        Object.values(penaltyTimeoutRef.current).forEach(timeout => {
            if (timeout) clearTimeout(timeout as NodeJS.Timeout);
        });
        penaltyTimeoutRef.current = {};
        
        // 플레이어 효과 타이머들 정리
        ['red', 'blue'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(timeout => {
                if (timeout) clearTimeout(timeout as NodeJS.Timeout);
            });
        });
        playerTimeoutRef.current = { red: {}, blue: {} };
    }, []);

    const setPlayerStatus = useCallback((team: Team, status: Partial<PlayerStatus>) => {
        setGameState(prev => ({
            ...prev,
            playerStatus: {
                ...prev.playerStatus,
                [team]: { ...prev.playerStatus[team], ...status }
            }
        }));
    }, []);
    
    const resetPlayerStatus = useCallback((team: Team, effect?: keyof Omit<PlayerStatus, 'isWinner'|'penalty'>) => {
        // 타이머가 실행될 때 게임 상태 확인 - 게임이 진행 중이 아니면 상태 변경하지 않음
        setGameState(prev => {
            if (prev.gamePhase !== GamePhase.PLAYING) {
                return prev;
            }
            
            // 타이머 정리
            if (effect && playerTimeoutRef.current[team][effect]) {
                clearTimeout(playerTimeoutRef.current[team][effect]);
                delete playerTimeoutRef.current[team][effect];
            }
            
            const statusToReset: Partial<PlayerStatus> = {};
            if (effect) {
                statusToReset[effect] = false;
            } else {
                // Reset all effects if no specific effect is provided
                statusToReset.isBoosted = false;
                statusToReset.isSlowed = false;
                statusToReset.isFrozen = false;
                statusToReset.hasShield = false;
            }

            return {
                ...prev,
                playerStatus: {
                    ...prev.playerStatus,
                    [team]: {
                        ...prev.playerStatus[team],
                        ...statusToReset
                    }
                }
            };
        });
    }, []);
    
    const resetAllPlayerStatus = useCallback(() => {
        setGameState(prev => ({ ...prev, playerStatus: INITIAL_PLAYER_STATUSES }));
        clearAllTimers();
    }, [clearAllTimers]);

    const endGame = useCallback(() => {
        clearAllTimers();
        playSound('game-over-win');
        setGameState(prev => ({ ...prev, gamePhase: GamePhase.GAME_OVER }));
    }, [clearAllTimers]);

    const handleQuizAnswer = useCallback((isCorrect: boolean, team: Team) => {
        // 퀴즈 타임아웃 타이머 클리어
        if (quizTimeoutRef.current) {
            clearTimeout(quizTimeoutRef.current);
            quizTimeoutRef.current = null;
        }

        // 퀴즈 플래그 리셋
        isShowingQuizRef.current = false;

        playSound(isCorrect ? 'quiz-correct' : 'quiz-incorrect');
        setGameState(prev => {
            const newScores = { ...prev.scores };
            // 퀴즈 맞추면 2점, 틀리면 1점
            newScores[team] += isCorrect ? 2 : 1;
            
            return {
                ...prev,
                scores: newScores,
                gamePhase: GamePhase.ROUND_END,
                roundEndState: {
                    title: isCorrect ? "Quiz Success!" : "Quiz Failed!",
                    text: isCorrect ? `${team.toUpperCase()} team gets 2 points! (+2 points)` : `${team.toUpperCase()} team gets 1 point! (+1 point)`,
                    winner: team,
                    isSuccess: isCorrect,
                    nextAction: () => {
                        if (prev.currentRound >= MAX_ROUNDS) {
                            endGame();
                        } else {
                            setGameState(p => ({
                                ...p,
                                currentRound: p.currentRound + 1,
                                gamePhase: GamePhase.ROUND_START,
                                currentWinner: null,
                                positions: { red: 0, blue: 0 },
                                items: [],
                                playerStatus: INITIAL_PLAYER_STATUSES,
                                currentLight: 'red',
                            }));
                        }
                    }
                }
            };
        });
    }, [endGame]);

    const handleQuizTimeout = useCallback((team: Team) => {
        setGameState(prev => {
            // 이미 퀴즈가 끝났다면 무시
            if (prev.gamePhase !== GamePhase.QUIZ) {
                return prev;
            }

            // 퀴즈 플래그 리셋
            isShowingQuizRef.current = false;

            playSound('time-up');
            const newScores = { ...prev.scores };
            // 타임아웃이면 1점
            newScores[team] += 1;
            
            return {
                ...prev,
                scores: newScores,
                gamePhase: GamePhase.ROUND_END,
                roundEndState: {
                    title: "Time's Up!",
                    text: `${team.toUpperCase()} team gets 1 point! (+1 point)`,
                    winner: team,
                    isSuccess: false,
                    nextAction: () => {
                        if (prev.currentRound >= MAX_ROUNDS) {
                            endGame();
                        } else {
                            setGameState(p => ({
                                ...p,
                                currentRound: p.currentRound + 1,
                                gamePhase: GamePhase.ROUND_START,
                                currentWinner: null,
                                positions: { red: 0, blue: 0 },
                                items: [],
                                playerStatus: INITIAL_PLAYER_STATUSES,
                                currentLight: 'red',
                            }));
                        }
                    }
                }
            };
        });
    }, [endGame]);

    const showQuiz = useCallback(async (winnerTeam: Team) => {
        // 이미 퀴즈를 보여주고 있으면 무시
        if (isShowingQuizRef.current) {
            return;
        }

        // 퀴즈 시작 플래그 설정
        isShowingQuizRef.current = true;

        // 중복 호출 방지
        setGameState(prev => {
            if (prev.gamePhase === GamePhase.QUIZ) {
                return prev; // 이미 퀴즈 모드면 무시
            }
            return { ...prev, gamePhase: GamePhase.QUIZ, isQuizLoading: true, quiz: null };
        });

        // 기존 퀴즈 타임아웃 정리
        if (quizTimeoutRef.current) {
            clearTimeout(quizTimeoutRef.current);
            quizTimeoutRef.current = null;
        }

        // 퀴즈 타임아웃 설정 (8초)
        quizTimeoutRef.current = setTimeout(() => {
            handleQuizTimeout(winnerTeam);
        }, 8000);
        
        try {
            const quizData = await generateQuizQuestion();
            setGameState(prev => {
                // 게임 상태가 바뀐 경우 퀴즈 설정하지 않음
                if (prev.gamePhase !== GamePhase.QUIZ) {
                    return prev;
                }
                return { ...prev, quiz: quizData, isQuizLoading: false };
            });
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            // Fallback quiz
            const fallbackQuiz = {
                question: "What is 2 + 2?",
                answers: ["3", "4", "5", "6"],
                correctAnswer: "4",
            };
            setGameState(prev => {
                // 게임 상태가 바뀐 경우 퀴즈 설정하지 않음
                if (prev.gamePhase !== GamePhase.QUIZ) {
                    return prev;
                }
                return { ...prev, quiz: fallbackQuiz, isQuizLoading: false };
            });
        }
    }, [handleQuizTimeout]);

    const handleRoundWin = useCallback((winnerTeam: Team) => {
        clearAllTimers();
        playSound('round-win');

        // 모든 팀의 아이템 효과 해제
        ['red', 'blue'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(clearTimeout);
            playerTimeoutRef.current[team as Team] = {};
        });

        setGameState(prev => {
            const newPlayerStatuses = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATUSES));
            newPlayerStatuses[winnerTeam].isWinner = true;
            return {
                ...prev,
                playerStatus: newPlayerStatuses,
                currentWinner: winnerTeam
            };
        });

        setTimeout(() => {
            showQuiz(winnerTeam);
        }, 1000);

    }, [clearAllTimers, showQuiz]);

    const handleTimeUp = useCallback(() => {
        clearAllTimers();
        playSound('time-up');
        setGameState(prev => {
            const { positions, currentRound } = prev;
            let winner: Team | null = null;

            if (positions.red > positions.blue) {
                winner = 'red';
            } else if (positions.blue > positions.red) {
                winner = 'blue';
            }

            if (winner) {
                // A player was closer, give them a quiz
                return {
                    ...prev,
                    gamePhase: GamePhase.ROUND_END,
                    roundEndState: {
                        title: "Time's Up!",
                        text: `${winner.charAt(0).toUpperCase() + winner.slice(1)} team was closer! Get ready for a quiz.`,
                        winner: winner,
                        isSuccess: null,
                        nextAction: () => showQuiz(winner as Team),
                    }
                };
            } else {
                // It's a tie, no quiz
                return {
                    ...prev,
                    gamePhase: GamePhase.ROUND_END,
                    roundEndState: {
                        title: "Time's Up!",
                        text: "It's a tie! No quiz this round.",
                        winner: null,
                        isSuccess: null,
                        nextAction: () => {
                            if (currentRound >= MAX_ROUNDS) {
                                endGame();
                            } else {
                                setGameState(p => ({
                                    ...p,
                                    currentRound: p.currentRound + 1,
                                    gamePhase: GamePhase.ROUND_START,
                                    positions: { red: 0, blue: 0 },
                                    items: [],
                                    playerStatus: INITIAL_PLAYER_STATUSES,
                                    currentLight: 'red',
                                }));
                            }
                        }
                    }
                };
            }
        });
    }, [clearAllTimers, endGame, showQuiz]);

    const handleGo = useCallback((team: Team) => {
        if (gameState.gamePhase !== GamePhase.PLAYING || gameState.playerStatus[team].isFrozen) return;

        if (gameState.currentLight === 'green' || gameState.currentLight === 'yellow') {
            playSound('move');

            setGameState(prev => {
                const status = prev.playerStatus[team];
                const speedMultiplier = status.isSlowed ? SLOW_MULTIPLIER : 1;
                const boostMultiplier = status.isBoosted ? BOOST_MULTIPLIER : 1;
                const move = MOVE_AMOUNT * boostMultiplier * speedMultiplier;
                let newPosition = prev.positions[team] + move;

                // 결승선 도달
                if (newPosition >= FINISH_POSITION) {
                    newPosition = FINISH_POSITION;
                    // 아직 승자가 없을 때만 승리 처리
                    if (!prev.playerStatus.red.isWinner && !prev.playerStatus.blue.isWinner) {
                        // 결승선 도달 시 모든 아이템 효과 해제
                        Object.values(playerTimeoutRef.current[team]).forEach(clearTimeout);
                        playerTimeoutRef.current[team] = {};

                        handleRoundWin(team);
                    }
                }

                // 출발선 도달 (뒤로 이동해서 0 이하가 된 경우)
                let shouldClearEffects = false;
                if (newPosition <= 0) {
                    newPosition = 0;
                    shouldClearEffects = true;
                    // 출발선 도달 시 모든 아이템 효과 해제
                    Object.values(playerTimeoutRef.current[team]).forEach(clearTimeout);
                    playerTimeoutRef.current[team] = {};
                }
                
                const newItems = [...prev.items];
                const collectedItems: Item[] = [];
                const remainingItems = newItems.filter(item => {
                    if (item.team === team && Math.abs(newPosition - item.position) < 5) {
                        collectedItems.push(item);
                        return false;
                    }
                    return true;
                });

                let newPlayerStatus = { ...prev.playerStatus };
                collectedItems.forEach(item => {
                    const opponent = team === 'red' ? 'blue' : 'red';
                    
                    if (item.type === 'shield' || item.type === 'booster') {
                        playSound('collect-good');
                    } else {
                        playSound('collect-bad');
                    }

                    switch(item.type) {
                        case 'shield':
                            newPlayerStatus[team].hasShield = true;
                            if (playerTimeoutRef.current[team].hasShield) clearTimeout(playerTimeoutRef.current[team].hasShield);
                            playerTimeoutRef.current[team].hasShield = setTimeout(() => resetPlayerStatus(team, 'hasShield'), ITEM_EFFECT_DURATION);
                            break;
                        case 'booster':
                            newPlayerStatus[team].isBoosted = true;
                            if (playerTimeoutRef.current[team].isBoosted) clearTimeout(playerTimeoutRef.current[team].isBoosted);
                            playerTimeoutRef.current[team].isBoosted = setTimeout(() => resetPlayerStatus(team, 'isBoosted'), ITEM_EFFECT_DURATION);
                            break;
                        case 'slow':
                            if (!newPlayerStatus[opponent].hasShield) {
                                newPlayerStatus[opponent].isSlowed = true;
                                if (playerTimeoutRef.current[opponent].isSlowed) clearTimeout(playerTimeoutRef.current[opponent].isSlowed);
                                playerTimeoutRef.current[opponent].isSlowed = setTimeout(() => resetPlayerStatus(opponent, 'isSlowed'), ITEM_EFFECT_DURATION);
                            } else { // Shield is consumed
                                playSound('shield-break');
                                if (playerTimeoutRef.current[opponent].hasShield) {
                                    clearTimeout(playerTimeoutRef.current[opponent].hasShield);
                                    delete playerTimeoutRef.current[opponent].hasShield;
                                }
                                newPlayerStatus[opponent].hasShield = false;
                            }
                            break;
                        case 'ice':
                             if (!newPlayerStatus[opponent].hasShield) {
                                newPlayerStatus[opponent].isFrozen = true;
                                if (playerTimeoutRef.current[opponent].isFrozen) clearTimeout(playerTimeoutRef.current[opponent].isFrozen);
                                playerTimeoutRef.current[opponent].isFrozen = setTimeout(() => resetPlayerStatus(opponent, 'isFrozen'), ITEM_EFFECT_DURATION);
                            } else { // Shield is consumed
                                playSound('shield-break');
                                if (playerTimeoutRef.current[opponent].hasShield) {
                                    clearTimeout(playerTimeoutRef.current[opponent].hasShield);
                                    delete playerTimeoutRef.current[opponent].hasShield;
                                }
                                newPlayerStatus[opponent].hasShield = false;
                            }
                            break;
                    }
                });

                // 출발선 도달 시 플레이어 상태 초기화
                if (shouldClearEffects) {
                    newPlayerStatus[team] = {
                        ...INITIAL_PLAYER_STATUS
                    };
                }

                return {
                    ...prev,
                    positions: { ...prev.positions, [team]: newPosition },
                    items: remainingItems,
                    playerStatus: newPlayerStatus
                };
            });

        } else { // Red light
            playSound('penalty');
            if (gameState.playerStatus[team].hasShield) {
                resetPlayerStatus(team, 'hasShield');
                return;
            }
            
            // 벌칙 시 모든 활성화된 아이템 효과 제거
            Object.values(playerTimeoutRef.current[team]).forEach(clearTimeout);
            playerTimeoutRef.current[team] = {};
            
            setGameState(prev => ({
                ...prev,
                positions: { ...prev.positions, [team]: 0 },
                playerStatus: {
                    ...prev.playerStatus,
                    [team]: {
                        hasShield: false,
                        isBoosted: false,
                        isSlowed: false,
                        isFrozen: false,
                        isWinner: false,
                        penalty: true
                    }
                }
            }));
            
            // 기존 벌칙 타이머 정리
            if (penaltyTimeoutRef.current[team]) {
                clearTimeout(penaltyTimeoutRef.current[team]);
            }
            
            penaltyTimeoutRef.current[team] = setTimeout(() => {
                setPlayerStatus(team, { penalty: false });
                delete penaltyTimeoutRef.current[team];
            }, 500);
        }
    }, [gameState.gamePhase, gameState.currentLight, gameState.playerStatus, gameState.positions, gameState.items, handleRoundWin, resetPlayerStatus, setPlayerStatus]);
    
    const spawnItem = useCallback(() => {
        setGameState(prev => {
            if (prev.items.length >= 6) return prev; // Limit items on screen
            
            const itemTypes: ItemType[] = ['shield', 'booster', 'slow', 'ice'];
            const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const team: Team = Math.random() > 0.5 ? 'red' : 'blue';

            // If the player for whom the item would spawn already has an active effect, skip.
            const teamStatus = prev.playerStatus[team];
            if (teamStatus.hasShield || teamStatus.isBoosted || teamStatus.isSlowed || teamStatus.isFrozen) {
                return prev;
            }
            
            const playerPos = prev.positions[team];
            const minSpawnY = Math.max(playerPos + 20, 15); // 출발선(0%) 근처 15% 제외
            const maxSpawnY = Math.min(playerPos + 40, FINISH_POSITION - 15); // 결승선(88%) 근처 15% 제외
            
            if (maxSpawnY <= minSpawnY) return prev;
            
            const position = Math.random() * (maxSpawnY - minSpawnY) + minSpawnY;

            // Check for overlapping items
            const isOverlapping = prev.items.some(
                item => Math.abs(item.position - position) < MIN_ITEM_DISTANCE
            );

            if (isOverlapping) {
                return prev; // Skip spawning this time to avoid overlap
            }
            
            const newItem: Item = { id: Date.now(), team, type, position, disappearing: false };

            setTimeout(() => {
                setGameState(p => ({ ...p, items: p.items.map(i => i.id === newItem.id ? { ...i, disappearing: true } : i)}));
                setTimeout(() => {
                    setGameState(p => ({ ...p, items: p.items.filter(i => i.id !== newItem.id) }));
                }, 500);
            }, 3000);

            return { ...prev, items: [...prev.items, newItem] };
        });
    }, []);
    
    const itemSpawner = useCallback(() => {
        const nextSpawnTime = Math.random() * 1500 + 1500; // 1.5-3 seconds
        itemSpawnRef.current = setTimeout(() => {
            if (gameState.gamePhase === GamePhase.PLAYING) {
                spawnItem();
                itemSpawner();
            }
        }, nextSpawnTime);
    }, [spawnItem, gameState.gamePhase]);



    useEffect(() => {
        if (gameState.gamePhase === GamePhase.PLAYING) {
            timerRef.current = setInterval(() => {
                setGameState(prev => {
                    if (prev.timeLeft > 1) {
                        return { ...prev, timeLeft: prev.timeLeft - 1 };
                    }
                    handleTimeUp();
                    return { ...prev, timeLeft: 0 };
                });
            }, 1000);
            
            itemSpawner();

        } else {
            clearAllTimers();
        }
        return clearAllTimers;
    }, [gameState.gamePhase, handleTimeUp, itemSpawner, clearAllTimers]);

    // 신호등 상태를 게임 상태와 통합 관리 (dual state 제거)

    // 신호등 관리를 완전히 분리된 상태로 처리
    const lightSequenceRef = useRef<{ isRunning: boolean; currentState: LightColor }>({ 
        isRunning: false, 
        currentState: 'red' 
    });

    // 게임 상태와 독립적으로 신호등 관리
    const isPlayingRef = useRef(false);

    useEffect(() => {
        const wasPlaying = isPlayingRef.current;
        const isNowPlaying = gameState.gamePhase === GamePhase.PLAYING;
        isPlayingRef.current = isNowPlaying;

        // 게임 상태가 PLAYING으로 변경될 때만 신호등 시작
        if (!wasPlaying && isNowPlaying) {
            // 기존 실행 중인 시퀀스 중단
            if (lightTimerRef.current) {
                clearTimeout(lightTimerRef.current);
                lightTimerRef.current = null;
            }
            lightSequenceRef.current.isRunning = false;

            // 게임 시작 시 빨간불로 초기화
            setGameState(prev => ({ ...prev, currentLight: 'red' }));
            lightSequenceRef.current = { isRunning: true, currentState: 'red' };
            
            const runLightSequence = () => {
                if (!lightSequenceRef.current.isRunning || !isPlayingRef.current) return;
                
                let delay = 2000;
                let nextState: LightColor = 'red';
                
                switch(lightSequenceRef.current.currentState) {
                    case 'red': 
                        nextState = 'green';
                        delay = Math.random() * 1000 + 1500; // 1.5-2.5초
                        break;
                    case 'green':
                        nextState = 'yellow';
                        delay = 800; // 0.8초
                        break;
                    case 'yellow':
                        nextState = 'red';
                        delay = Math.random() * 1500 + 1500; // 1.5-3초
                        break;
                }
                
                lightTimerRef.current = setTimeout(() => {
                    if (!lightSequenceRef.current.isRunning || !isPlayingRef.current) return;
                    
                    lightSequenceRef.current.currentState = nextState;
                    setGameState(prev => {
                        if (prev.gamePhase === GamePhase.PLAYING) {
                            return { ...prev, currentLight: nextState };
                        }
                        return prev;
                    });
                    
                    // 다음 신호 예약
                    runLightSequence();
                }, delay);
            };
            
            // 0.5초 후 첫 번째 신호 변경 시작 (더 빠른 게임 시작)
            lightTimerRef.current = setTimeout(() => {
                if (!lightSequenceRef.current.isRunning || !isPlayingRef.current) return;
                
                lightSequenceRef.current.currentState = 'green';
                setGameState(prev => {
                    if (prev.gamePhase === GamePhase.PLAYING) {
                        return { ...prev, currentLight: 'green' };
                    }
                    return prev;
                });
                
                runLightSequence();
            }, 500);
        }

        // 게임이 끝나면 시퀀스 중단(현재 신호 유지)
        if (wasPlaying && !isNowPlaying) {
            lightSequenceRef.current.isRunning = false;
            if (lightTimerRef.current) {
                clearTimeout(lightTimerRef.current);
                lightTimerRef.current = null;
            }
        }

    }, [gameState.gamePhase]); // gamePhase만 dependency로 사용

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            lightSequenceRef.current.isRunning = false;
            if (lightTimerRef.current) {
                clearTimeout(lightTimerRef.current);
                lightTimerRef.current = null;
            }
        };
    }, []);
    
    // Game Actions
    const startGame = useCallback(() => {
        playSound('start');
        setGameState(prev => ({
            ...prev,
            gamePhase: GamePhase.ROUND_START,
            positions: { red: 0, blue: 0 },
            items: [],
            playerStatus: INITIAL_PLAYER_STATUSES,
            currentLight: 'red',
            currentWinner: null,
        }));
    }, []);

    const playRound = useCallback(() => {
        playSound('click');
        
        // 이전 라운드의 모든 플레이어 효과 타이머 정리
        ['red', 'blue'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(clearTimeout);
        });
        playerTimeoutRef.current = { red: {}, blue: {} };
        
        setGameState(prev => ({
            ...prev,
            gamePhase: GamePhase.PLAYING,
            positions: { red: 0, blue: 0 },
            playerStatus: {
                red: {
                    hasShield: false,
                    isBoosted: false,
                    isSlowed: false,
                    isFrozen: false,
                    isWinner: false,
                    penalty: false
                },
                blue: {
                    hasShield: false,
                    isBoosted: false,
                    isSlowed: false,
                    isFrozen: false,
                    isWinner: false,
                    penalty: false
                }
            },
            timeLeft: ROUND_TIME_LIMIT,
            items: [],
            currentLight: 'red',
        }));
    }, []);

    const resetGame = useCallback(() => {
        playSound('click');

        // 모든 플레이어 효과 타이머 정리
        ['red', 'blue'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(clearTimeout);
        });
        playerTimeoutRef.current = { red: {}, blue: {} };

        // 퀴즈 플래그 리셋
        isShowingQuizRef.current = false;

        setGameState(initialGameState);
    }, []);

    return {
        gameState,
        gameActions: { startGame, playRound, handleGo, handleQuizAnswer, resetGame }
    };
};