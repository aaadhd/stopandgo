import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GamePhase, Team, Item, PlayerStatus, ItemType, LightColor, GameSettings, Teams } from '../types';
import {
    MAX_ROUNDS, ROUND_TIME_LIMIT, FINISH_POSITION, MOVE_AMOUNT, BOOST_MULTIPLIER,
    SLOW_MULTIPLIER, ITEM_EFFECT_DURATION, INITIAL_PLAYER_STATUSES, INITIAL_PLAYER_STATUS, MIN_ITEM_DISTANCE
} from '../constants';
import { generateQuizQuestion } from '../services/geminiService';
import { playSound } from '../utils/audio';
import { initializeTeams, shuffleTeams, MOCK_PLAYERS } from '../constants/teamSetup';
import { preloadImages } from '../utils/preloadImages';

const initialGameState: GameState = {
    gamePhase: GamePhase.START,
    scores: { cyan: 0, purple: 0 },
    currentRound: 1,
    maxRounds: MAX_ROUNDS,
    timeLeft: ROUND_TIME_LIMIT,
    positions: { cyan: 5, purple: 5 },
    playerStatus: INITIAL_PLAYER_STATUSES,
    currentLight: 'red',
    items: [],
    roundEndState: null,
    quiz: null,
    isQuizLoading: false,
    currentWinner: null,
    isPaused: false,
    showMenu: false,
    showSettings: true,
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [teams, setTeams] = useState<Teams>(() => initializeTeams(MOCK_PLAYERS));
    
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lightRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemSpawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quizTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const penaltyTimeoutRef = useRef<{ [key in Team]?: ReturnType<typeof setTimeout> }>({});
    const playerTimeoutRef = useRef<{ [key in Team]: { [key in keyof Omit<PlayerStatus, 'isWinner'|'penalty'>]?: ReturnType<typeof setTimeout> } }>({ cyan: {}, purple: {} });
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
        ['cyan', 'purple'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(timeout => {
                if (timeout) clearTimeout(timeout as NodeJS.Timeout);
            });
        });
        playerTimeoutRef.current = { cyan: {}, purple: {} };
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
            // 퀴즈 맞추면 30점, 틀리면 0점
            newScores[team] += isCorrect ? 30 : 0;
            
            return {
                ...prev,
                scores: newScores,
                gamePhase: GamePhase.ROUND_END,
                roundEndState: {
                    title: isCorrect ? "Quiz Success!" : "Quiz Failed!",
                    text: isCorrect ? `${team === 'cyan' ? 'Team A' : 'Team B'} gets 30 points!` : `${team === 'cyan' ? 'Team A' : 'Team B'} gets no points!`,
                    winner: team,
                    isSuccess: isCorrect,
                    nextAction: () => {
                        if (prev.currentRound >= prev.maxRounds) {
                            endGame();
                        } else {
                            setGameState(p => ({
                                ...p,
                                currentRound: p.currentRound + 1,
                                gamePhase: GamePhase.ROUND_START,
                                currentWinner: null,
                                positions: { cyan: 5, purple: 5 },
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
            // 타임아웃이면 10점
            newScores[team] += 10;
            
            return {
                ...prev,
                scores: newScores,
                gamePhase: GamePhase.ROUND_END,
                roundEndState: {
                    title: "Time's Up!",
                    text: `${team === 'cyan' ? 'Team A' : 'Team B'} gets 10 points! (+10 points)`,
                    winner: team,
                    isSuccess: false,
                    nextAction: () => {
                        if (prev.currentRound >= prev.maxRounds) {
                            endGame();
                        } else {
                            setGameState(p => ({
                                ...p,
                                currentRound: p.currentRound + 1,
                                gamePhase: GamePhase.ROUND_START,
                                currentWinner: null,
                                positions: { cyan: 5, purple: 5 },
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
        console.log('[showQuiz] Called, isShowingQuizRef:', isShowingQuizRef.current);
        if (isShowingQuizRef.current) {
            console.log('[showQuiz] Already showing quiz, returning');
            return;
        }

        // 퀴즈 시작 플래그 설정
        isShowingQuizRef.current = true;

        // 중복 호출 방지
        setGameState(prev => {
            console.log('[showQuiz] Current phase:', prev.gamePhase);
            if (prev.gamePhase === GamePhase.QUIZ) {
                console.log('[showQuiz] Already in QUIZ phase, returning');
                return prev; // 이미 퀴즈 모드면 무시
            }
            console.log('[showQuiz] Transitioning to QUIZ phase');
            return { ...prev, gamePhase: GamePhase.QUIZ, isQuizLoading: true, quiz: null, currentWinner: winnerTeam };
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
        console.log('[handleRoundWin] Called with winner:', winnerTeam);
        clearAllTimers();
        playSound('round-win');

        // 모든 팀의 아이템 효과 해제
        ['cyan', 'purple'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(clearTimeout);
            playerTimeoutRef.current[team as Team] = {};
        });

        setGameState(prev => {
            const newPlayerStatuses = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATUSES));
            newPlayerStatuses[winnerTeam].isWinner = true;
            console.log('[handleRoundWin] Setting winner status, prev phase:', prev.gamePhase);
            return {
                ...prev,
                playerStatus: newPlayerStatuses,
                currentWinner: winnerTeam
            };
        });

        setTimeout(() => {
            console.log('[handleRoundWin] About to call showQuiz');
            showQuiz(winnerTeam);
        }, 1000);

    }, [clearAllTimers, showQuiz]);

    const handleTimeUp = useCallback(() => {
        clearAllTimers();
        playSound('time-up');
        setGameState(prev => {
            const { positions, currentRound, maxRounds } = prev;
            let winner: Team | null = null;

            if (positions.cyan > positions.purple) {
                winner = 'cyan';
            } else if (positions.purple > positions.cyan) {
                winner = 'purple';
            }

            if (winner) {
                // A player was closer, give them a quiz
                return {
                    ...prev,
                    gamePhase: GamePhase.ROUND_END,
                    roundEndState: {
                        title: "Time's Up!",
                        text: `${winner === 'cyan' ? 'Team A' : 'Team B'} was closer! Get ready for a quiz.`,
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
                        text: "No quiz for this round.",
                        winner: null,
                        isSuccess: null,
                        nextAction: () => {
                            if (currentRound >= maxRounds) {
                                endGame();
                            } else {
                                setGameState(p => ({
                                    ...p,
                                    currentRound: p.currentRound + 1,
                                    gamePhase: GamePhase.ROUND_START,
                                    positions: { cyan: 5, purple: 5 },
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
        console.log('[handleGo] Called for team:', team, 'phase:', gameState.gamePhase, 'isFrozen:', gameState.playerStatus[team].isFrozen);

        if (gameState.gamePhase !== GamePhase.PLAYING || gameState.playerStatus[team].isFrozen) return;

        if (gameState.currentLight === 'green' || gameState.currentLight === 'yellow') {
            // 상태에 따른 움직임 사운드
            const status = gameState.playerStatus[team];
            if (status.isBoosted) {
                playSound('move-boost');
            } else if (status.isSlowed) {
                playSound('move-slow');
            } else {
            playSound('move');
            }

            let shouldTriggerWin = false;
            let winnerTeam: Team | null = null;

            setGameState(prev => {
                const status = prev.playerStatus[team];
                const speedMultiplier = status.isSlowed ? SLOW_MULTIPLIER : 1;
                const boostMultiplier = status.isBoosted ? BOOST_MULTIPLIER : 1;
                const move = MOVE_AMOUNT * boostMultiplier * speedMultiplier;
                let newPosition = prev.positions[team] + move;

                console.log('[handleGo] Current position:', prev.positions[team], 'New position:', newPosition, 'Finish:', FINISH_POSITION);

                // 결승선 도달
                let isFinishLineReached = false;
                if (newPosition >= FINISH_POSITION) {
                    console.log('[handleGo] Reached finish line!');
                    newPosition = FINISH_POSITION;
                    isFinishLineReached = true;
                    // 아직 승자가 없을 때만 승리 처리 플래그 설정
                    if (!prev.playerStatus.cyan.isWinner && !prev.playerStatus.purple.isWinner) {
                        console.log('[handleGo] No winner yet, setting flag');
                        shouldTriggerWin = true;
                        winnerTeam = team;
                        // 결승선 도달 시 모든 아이템 효과 해제
                        Object.values(playerTimeoutRef.current[team]).forEach(clearTimeout);
                        playerTimeoutRef.current[team] = {};
                    } else {
                        console.log('[handleGo] Winner already exists:', prev.playerStatus.cyan.isWinner, prev.playerStatus.purple.isWinner);
                    }
                }

                // 출발선 도달 (뒤로 이동해서 5 이하가 된 경우)
                let shouldClearEffects = false;
                if (newPosition <= 5) {
                    newPosition = 5;
                    shouldClearEffects = true;
                }

                // 결승선 또는 출발선 도달 시에는 아이템 수집하지 않음
                const newItems = [...prev.items];
                const collectedItems: Item[] = [];
                const remainingItems = (isFinishLineReached || shouldClearEffects) ? newItems : newItems.filter(item => {
                    if (item.team === team && Math.abs(newPosition - item.position) < 5) {
                        collectedItems.push(item);
                        return false;
                    }
                    return true;
                });

                let newPlayerStatus = { ...prev.playerStatus };
                // 결승선 또는 출발선 도달 시에는 아이템 수집하지 않음
                if (!shouldClearEffects && !isFinishLineReached) {
                    collectedItems.forEach(item => {
                    const opponent = team === 'cyan' ? 'purple' : 'cyan';
                    
                    if (item.type === 'shield' || item.type === 'booster') {
                        playSound('collect-good');
                    } else {
                        playSound('collect-bad');
                    }

                    switch(item.type) {
                        case 'shield':
                            // 벌칙 효과 제거 (있다면)
                            if (newPlayerStatus[team].isSlowed) {
                                newPlayerStatus[team].isSlowed = false;
                                if (playerTimeoutRef.current[team].isSlowed) {
                                    clearTimeout(playerTimeoutRef.current[team].isSlowed);
                                    delete playerTimeoutRef.current[team].isSlowed;
                                }
                            }
                            if (newPlayerStatus[team].isFrozen) {
                                newPlayerStatus[team].isFrozen = false;
                                if (playerTimeoutRef.current[team].isFrozen) {
                                    clearTimeout(playerTimeoutRef.current[team].isFrozen);
                                    delete playerTimeoutRef.current[team].isFrozen;
                                }
                            }
                            // 방패 효과 적용
                            newPlayerStatus[team].hasShield = true;
                            if (playerTimeoutRef.current[team].hasShield) clearTimeout(playerTimeoutRef.current[team].hasShield);
                            playerTimeoutRef.current[team].hasShield = setTimeout(() => resetPlayerStatus(team, 'hasShield'), ITEM_EFFECT_DURATION);
                            break;
                        case 'booster':
                            // 벌칙 효과 제거 (있다면)
                            if (newPlayerStatus[team].isSlowed) {
                                newPlayerStatus[team].isSlowed = false;
                                if (playerTimeoutRef.current[team].isSlowed) {
                                    clearTimeout(playerTimeoutRef.current[team].isSlowed);
                                    delete playerTimeoutRef.current[team].isSlowed;
                                }
                            }
                            if (newPlayerStatus[team].isFrozen) {
                                newPlayerStatus[team].isFrozen = false;
                                if (playerTimeoutRef.current[team].isFrozen) {
                                    clearTimeout(playerTimeoutRef.current[team].isFrozen);
                                    delete playerTimeoutRef.current[team].isFrozen;
                                }
                            }
                            // 부스터 효과 적용
                            newPlayerStatus[team].isBoosted = true;
                            if (playerTimeoutRef.current[team].isBoosted) clearTimeout(playerTimeoutRef.current[team].isBoosted);
                            playerTimeoutRef.current[team].isBoosted = setTimeout(() => resetPlayerStatus(team, 'isBoosted'), ITEM_EFFECT_DURATION);
                            break;
                        case 'slow':
                            if (!newPlayerStatus[opponent].hasShield) {
                                playSound('slowed');
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
                                playSound('frozen');
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
                }

                // 출발선 도달 시 플레이어 상태 초기화
                if (shouldClearEffects) {
                    // 모든 아이템 효과 타이머 제거
                    Object.values(playerTimeoutRef.current[team]).forEach(timeout => {
                        if (timeout) clearTimeout(timeout);
                    });
                    playerTimeoutRef.current[team] = {};

                    // 상태 완전 초기화 (깊은 복사)
                    newPlayerStatus[team] = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATUS));
                }

                // 결승선 도달 시 플레이어 상태 초기화 (아이템 효과 제거)
                if (isFinishLineReached) {
                    // 모든 아이템 효과 타이머 제거
                    Object.values(playerTimeoutRef.current[team]).forEach(timeout => {
                        if (timeout) clearTimeout(timeout);
                    });
                    playerTimeoutRef.current[team] = {};

                    newPlayerStatus[team] = {
                        ...newPlayerStatus[team],
                        hasShield: false,
                        isBoosted: false,
                        isSlowed: false,
                        isFrozen: false
                    };
                }

                return {
                    ...prev,
                    positions: { ...prev.positions, [team]: newPosition },
                    items: remainingItems,
                    playerStatus: newPlayerStatus
                };
            });

            // setGameState 완료 후 승리 처리
            if (shouldTriggerWin && winnerTeam) {
                console.log('[handleGo] Triggering win for', winnerTeam);
                // 즉시 호출하지 않고 약간의 지연을 줌 (상태 업데이트 완료 보장)
                setTimeout(() => {
                    handleRoundWin(winnerTeam);
                }, 0);
            }

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
                positions: { ...prev.positions, [team]: 5 },
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
            // 화면에 아이템이 너무 많으면 스킵 (최대 3개로 제한)
            if (prev.items.length >= 3) return prev;

            const itemTypes: ItemType[] = ['shield', 'booster', 'slow', 'ice'];
            const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const team: Team = Math.random() > 0.5 ? 'cyan' : 'purple';

            // 해당 팀에 이미 아이템이 있으면 스킵 (팀당 최대 1개)
            const teamHasItem = prev.items.some(item => item.team === team);
            if (teamHasItem) {
                return prev;
            }

            // 플레이어가 이미 상 효과(방패/부스터)를 받고 있으면 스킵
            const teamStatus = prev.playerStatus[team];
            if (teamStatus.hasShield || teamStatus.isBoosted) {
                return prev;
            }
            // 벌칙 효과 받고 있을 때는 아이템 생성 허용 (역전 기회)

            // 상대팀이 벌칙 효과(느려짐/얼음)를 받고 있으면 스킵 (밸런스 조정)
            const opponentTeam: Team = team === 'cyan' ? 'purple' : 'cyan';
            const opponentStatus = prev.playerStatus[opponentTeam];
            if (opponentStatus.isSlowed || opponentStatus.isFrozen) {
                return prev;
            }

            const playerPos = prev.positions[team];
            const minSpawnY = Math.max(playerPos + 15, 25); // 출발선(5)에서 최소 20 이상 떨어진 곳
            const maxSpawnY = Math.min(playerPos + 35, FINISH_POSITION - 20); // 결승선에서 최소 20 이하 떨어진 곳

            if (maxSpawnY <= minSpawnY) return prev;

            const position = Math.random() * (maxSpawnY - minSpawnY) + minSpawnY;

            // 다른 아이템과 너무 가까우면 스킵
            const isOverlapping = prev.items.some(
                item => Math.abs(item.position - position) < MIN_ITEM_DISTANCE
            );

            if (isOverlapping) {
                return prev;
            }

            const newItem: Item = { id: Date.now(), team, type, position, disappearing: false };

            // 아이템 나타남 사운드
            playSound('item-appear');

            // 5초 후 아이템 사라짐 (충분한 반응 시간)
            setTimeout(() => {
                playSound('item-disappear');
                setGameState(p => ({ ...p, items: p.items.map(i => i.id === newItem.id ? { ...i, disappearing: true } : i)}));
                setTimeout(() => {
                    setGameState(p => ({ ...p, items: p.items.filter(i => i.id !== newItem.id) }));
                }, 500);
            }, 5000);

            return { ...prev, items: [...prev.items, newItem] };
        });
    }, []);
    
    const itemSpawner = useCallback((isFirstSpawn = false) => {
        // 첫 번째 아이템은 1-2초, 이후는 3-7초
        const nextSpawnTime = isFirstSpawn 
            ? Math.random() * 1000 + 1000  // 1-2초 (빠른 시작)
            : Math.random() * 4000 + 3000; // 3-7초 (전략적인 타이밍)
        itemSpawnRef.current = setTimeout(() => {
            if (gameState.gamePhase === GamePhase.PLAYING) {
                spawnItem();
                itemSpawner(); // 이후는 일반 타이밍
            }
        }, nextSpawnTime);
    }, [spawnItem, gameState.gamePhase]);



    useEffect(() => {
        if (gameState.gamePhase === GamePhase.PLAYING && !gameState.isPaused) {
            timerRef.current = setInterval(() => {
                setGameState(prev => {
                    if (prev.timeLeft > 1) {
                        return { ...prev, timeLeft: prev.timeLeft - 1 };
                    }
                    handleTimeUp();
                    return { ...prev, timeLeft: 0 };
                });
            }, 1000);
            
            itemSpawner(true); // 첫 아이템은 빠르게

        } else {
            clearAllTimers();
        }
        return clearAllTimers;
    }, [gameState.gamePhase, gameState.isPaused, handleTimeUp, itemSpawner, clearAllTimers]);

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
        const isNowPlaying = gameState.gamePhase === GamePhase.PLAYING && !gameState.isPaused;
        isPlayingRef.current = isNowPlaying;

        // 게임 상태가 PLAYING이고 일시정지되지 않았을 때만 신호등 시작
        if (!wasPlaying && isNowPlaying) {
            // 기존 실행 중인 시퀀스 중단
            if (lightTimerRef.current) {
                clearTimeout(lightTimerRef.current);
                lightTimerRef.current = null;
            }
            lightSequenceRef.current.isRunning = false;

            // 게임 시작 시 현재 신호등 상태 확인 (playRound에서 초록불로 설정됨)
            setGameState(prev => {
                const currentLight = prev.currentLight || 'green';
                // 초록불에서 시작하도록 보장
                if (currentLight !== 'green') {
                    return { ...prev, currentLight: 'green' };
                }
                return prev;
            });
            lightSequenceRef.current = { isRunning: true, currentState: 'green' };
            
            const runLightSequence = () => {
                if (!lightSequenceRef.current.isRunning || !isPlayingRef.current) return;
                
                let delay = 2000;
                let nextState: LightColor = 'red';
                
                switch(lightSequenceRef.current.currentState) {
                    case 'red': 
                        nextState = 'green';
                        delay = Math.random() * 1000 + 1500; // 1.5-2.5초 (기다림)
                        break;
                    case 'green':
                        nextState = 'yellow';
                        delay = Math.random() * 200 + 1000; // 1-1.2초 (짧게!)
                        break;
                    case 'yellow':
                        nextState = 'red';
                        delay = Math.random() * 200 + 800; // 0.8-1초 (경고)
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
            
            // 초록불에서 시작하므로 바로 노란불로 가는 시퀀스 시작
            runLightSequence();
        }

        // 게임이 끝나면 시퀀스 중단(현재 신호 유지)
        if (wasPlaying && !isNowPlaying) {
            lightSequenceRef.current.isRunning = false;
            if (lightTimerRef.current) {
                clearTimeout(lightTimerRef.current);
                lightTimerRef.current = null;
            }
        }

    }, [gameState.gamePhase, gameState.isPaused]); // gamePhase와 isPaused를 dependency로 사용


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

        // 모든 타이머 정리 (플레이어 효과 타이머 포함)
        clearAllTimers();

        // 플레이어 효과 타이머 명시적으로 재정리
        ['cyan', 'purple'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
            playerTimeoutRef.current[team as Team] = {};
        });

        setGameState(prev => ({
            ...prev,
            gamePhase: GamePhase.ROUND_START,
            positions: { cyan: 5, purple: 5 },
            items: [],
            playerStatus: JSON.parse(JSON.stringify(INITIAL_PLAYER_STATUSES)),
            currentLight: 'red',
            currentWinner: null,
        }));
    }, [clearAllTimers]);

    const playRound = useCallback(() => {
        playSound('click');

        // 모든 타이머 정리
        clearAllTimers();

        // 플레이어 효과 타이머 명시적으로 재정리
        ['cyan', 'purple'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
            playerTimeoutRef.current[team as Team] = {};
        });

        setGameState(prev => ({
            ...prev,
            gamePhase: GamePhase.PLAYING,
            positions: { cyan: 5, purple: 5 },
            playerStatus: JSON.parse(JSON.stringify(INITIAL_PLAYER_STATUSES)),
            timeLeft: ROUND_TIME_LIMIT,
            items: [],
            currentLight: 'green', // 카운트다운 후 게임 시작 시 초록색으로 시작
        }));
    }, [clearAllTimers]);

    const resetGame = useCallback(() => {
        playSound('click');

        // 모든 플레이어 효과 타이머 정리
        ['cyan', 'purple'].forEach(team => {
            Object.values(playerTimeoutRef.current[team as Team]).forEach(clearTimeout);
        });
        playerTimeoutRef.current = { cyan: {}, purple: {} };

        // 퀴즈 플래그 리셋
        isShowingQuizRef.current = false;

        setGameState(initialGameState);
    }, []);

    // 일시정지 기능
    const pauseGame = useCallback(() => {
        if (gameState.gamePhase === GamePhase.PLAYING) {
            clearAllTimers();
            setGameState(prev => ({ ...prev, isPaused: true }));
        }
    }, [gameState.gamePhase, clearAllTimers]);

    const resumeGame = useCallback(() => {
        if (gameState.isPaused && gameState.gamePhase === GamePhase.PLAYING) {
            setGameState(prev => ({ ...prev, isPaused: false }));
            // 게임 재시작 로직은 useEffect에서 처리됨
        }
    }, [gameState.isPaused, gameState.gamePhase]);

    // 메뉴 기능
    const openMenu = useCallback(() => {
        if (gameState.gamePhase === GamePhase.PLAYING) {
            clearAllTimers();
            setGameState(prev => ({ ...prev, showMenu: true, isPaused: true }));
        }
    }, [gameState.gamePhase, clearAllTimers]);

    const closeMenu = useCallback(() => {
        setGameState(prev => ({ ...prev, showMenu: false, isPaused: false }));
    }, []);

    const endGameFromMenu = useCallback(() => {
        clearAllTimers();
        playSound('game-over-win');
        setGameState(prev => ({ 
            ...prev, 
            gamePhase: GamePhase.GAME_OVER, 
            showMenu: false, 
            isPaused: false 
        }));
    }, [clearAllTimers]);

    const exitGame = useCallback(() => {
        clearAllTimers();
        setGameState(initialGameState);
    }, [clearAllTimers]);

    // 설정 관련 함수들
    const startGameWithSettings = useCallback((settings: GameSettings) => {
        playSound('start');
        clearAllTimers();
        
        setGameState(prev => ({
            ...prev,
            gamePhase: GamePhase.START,
            showSettings: false,
            maxRounds: settings.rounds, // 설정된 라운드 수 반영
            positions: { cyan: 5, purple: 5 },
            items: [],
            playerStatus: INITIAL_PLAYER_STATUSES,
            currentLight: 'red',
            currentWinner: null,
        }));
    }, [clearAllTimers]);

    const showSettingsScreen = useCallback(() => {
        setGameState(prev => ({ ...prev, showSettings: true }));
    }, []);

    const hideSettingsScreen = useCallback(() => {
        setGameState(prev => ({ ...prev, showSettings: false }));
    }, []);

    // 팀 관련 액션들
    const shuffleTeamsAction = useCallback(() => {
        const shuffledTeams = shuffleTeams(teams);
        setTeams(shuffledTeams);
    }, [teams]);

    const handleTeamsChange = useCallback((newTeams: Teams) => {
        setTeams(newTeams);
    }, []);

    const startTeamSetup = useCallback(() => {
        setGameState(prev => ({ ...prev, gamePhase: GamePhase.TEAM_SETUP }));
    }, []);

    const startGameFromTeamSetup = useCallback(async () => {
        clearAllTimers();
        
        // 이미지 프리로드
        const imageUrls = [
            '/background.png',
            '/stopandgo.png',
            '/images/forest.png',
            '/images/undersea.png',
            '/images/space.png',
            '/sprite/rabbit_breathing.png',
            '/sprite/rabbit_running.png',
            '/sprite/rabbit_clap.png',
            '/sprite/rabbit_win.png',
            '/sprite/fox_breathing.png',
            '/sprite/fox_running.png',
            '/sprite/fox_clap.png',
            '/sprite/fox_win.png',
            '/items/rocket.png',
            '/items/rocket(2).png',
            '/items/shield.png',
            '/items/shield(2).png',
            '/items/snail.png',
            '/items/snail(2).png',
            '/items/ice.png',
            '/items/ice(2).png',
        ];
        
        try {
            // 이미지 프리로드 (백그라운드에서 진행)
            console.log('이미지 프리로드 시작...');
            await preloadImages(imageUrls);
            console.log('이미지 프리로드 완료');
        } catch (error) {
            console.warn('이미지 프리로드 실패, 게임 계속 진행:', error);
        }
        
        // 프리로드 완료 후 바로 라운드 시작
        playSound('start');
        setGameState(prev => ({
            ...prev,
            gamePhase: GamePhase.ROUND_START,
            positions: { cyan: 5, purple: 5 },
            items: [],
            playerStatus: INITIAL_PLAYER_STATUSES,
            currentLight: 'red',
            currentWinner: null,
        }));
    }, [clearAllTimers]);

    const addCheerPoints = useCallback((team: Team, points: number) => {
        playSound('click');
        setGameState(prev => ({
            ...prev,
            scores: {
                ...prev.scores,
                [team]: prev.scores[team] + points
            }
        }));
    }, []);

    return {
        gameState,
        teams,
        gameActions: { 
            startGame, 
            playRound, 
            handleGo, 
            handleQuizAnswer, 
            resetGame,
            pauseGame,
            resumeGame,
            openMenu,
            closeMenu,
            endGameFromMenu,
            exitGame,
            startGameWithSettings,
            showSettingsScreen,
            hideSettingsScreen,
            shuffleTeamsAction,
            handleTeamsChange,
            startTeamSetup,
            startGameFromTeamSetup,
            addCheerPoints
        }
    };
};