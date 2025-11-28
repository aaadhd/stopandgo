import React, { useState, useEffect, useRef } from 'react';
import { GamePhase } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import GameHeader from './components/GameHeader';
import GameArea from './components/GameArea';
import Controls from './components/Controls';
import RoundModal from './components/modals/RoundModal';
import QuizModal from './components/modals/QuizModal';
import GameOverModal from './components/modals/GameOverModal';
import GameMenuModal from './components/modals/GameMenuModal';
import GameSettingsModal from './components/modals/GameSettingsModal';
import PausedOverlay from './components/modals/PausedOverlay';
import TeamSetupScreen from './components/modals/TeamSetupScreen';
import TutorialModal from './components/modals/TutorialModal';

export default function App(): React.ReactNode {
    const { gameState, teams, gameActions } = useGameLogic();
    const [showSplash, setShowSplash] = useState(false);
    const [isSplashFadingOut, setIsSplashFadingOut] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);
    const [isMenuTutorialOpen, setIsMenuTutorialOpen] = useState(false);
    const splashTimerRef = useRef<NodeJS.Timeout | null>(null);
    const bgmRef = useRef<HTMLAudioElement | null>(null);

    const {
        gamePhase, scores, currentRound, maxRounds, timeLeft, positions,
        playerStatus, currentLight, items, roundEndState, quiz, isQuizLoading, currentWinner,
        showSettings
    } = gameState;

    // 배경 음악 초기화
    useEffect(() => {
        if (!bgmRef.current) {
            const audio = new Audio('/audios/bgm.mp3');
            audio.loop = true;
            audio.volume = 0.15;
            bgmRef.current = audio;
        }

        return () => {
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current = null;
            }
        };
    }, []);

    // 스플래시 또는 본 게임 단계에서 배경 음악 재생
    useEffect(() => {
        const audio = bgmRef.current;
        if (!audio) {
            return;
        }

        const shouldPlay = !showSettings && (showSplash || gamePhase !== GamePhase.START);

        if (shouldPlay) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn('Background music playback was prevented:', error);
                });
            }
        } else {
            audio.pause();
            if (showSettings || (!showSplash && gamePhase === GamePhase.START)) {
                audio.currentTime = 0;
            }
        }
    }, [showSplash, showSettings, gamePhase]);

    // 설정에서 Play를 누르면 스플래시 화면 표시
    useEffect(() => {
        if (gamePhase === GamePhase.START && !showSettings) {
            setShowSplash(true);
            setIsSplashFadingOut(false);
            splashTimerRef.current = setTimeout(() => {
                // 먼저 페이드아웃 시작
                setIsSplashFadingOut(true);
                // 페이드아웃 애니메이션 완료 후 팀 배정 화면으로 전환
                setTimeout(() => {
                    setShowSplash(false);
                    gameActions.startTeamSetup();
                }, 500); // 페이드아웃 애니메이션 시간
            }, 2000);
        }

        return () => {
            if (splashTimerRef.current) {
                clearTimeout(splashTimerRef.current);
                splashTimerRef.current = null;
            }
        };
    }, [gamePhase, showSettings, gameActions]);

    // 화면 전환 시 애니메이션 트리거 (스플래시 페이드아웃 중에는 트리거하지 않음)
    useEffect(() => {
        if (!isSplashFadingOut) {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsAnimating(true), 50);
            return () => clearTimeout(timer);
        }
    }, [gamePhase, showSettings, showSplash, isSplashFadingOut]);

    const showGameUI = gamePhase !== GamePhase.GAME_OVER;
    const isPlayingPhase = gamePhase === GamePhase.PLAYING;
    const isNonPlayingPhase = [GamePhase.START, GamePhase.ROUND_START, GamePhase.ROUND_END, GamePhase.QUIZ, GamePhase.GAME_OVER].includes(gamePhase);
    const buttonsDisabled = gameState.isPaused || gameState.showMenu || isMenuTutorialOpen;

    const handleOpenMenu = () => {
        setIsMenuTutorialOpen(false);
        gameActions.openMenu();
    };

    const handleCloseMenu = () => {
        setIsMenuTutorialOpen(false);
        gameActions.closeMenu();
    };

    const handleOpenMenuGuide = () => {
        setIsMenuTutorialOpen(true);
        gameActions.closeMenu();
    };

    const handleCloseMenuTutorial = () => {
        setIsMenuTutorialOpen(false);
    };

    const handleMenuEndGame = () => {
        setIsMenuTutorialOpen(false);
        gameActions.endGameFromMenu();
    };

    const handleMenuExit = () => {
        setIsMenuTutorialOpen(false);
        gameActions.exitGame();
    };

    // 설정 화면 표시
    if (showSettings) {
        return (
            <div
                className={`w-full h-full bg-white shadow-lg relative overflow-hidden screen-transition-enter ${isAnimating ? 'screen-transition-enter-active' : ''}`}
            >
                <GameSettingsModal
                    onStart={gameActions.startGameWithSettings}
                    onBack={gameActions.hideSettingsScreen}
                />
            </div>
        );
    }

    if (showSplash) {
        return (
            <div
                className={`w-full h-full bg-white shadow-lg relative overflow-hidden flex items-center justify-center ${
                    isSplashFadingOut
                        ? 'fade-transition-exit fade-transition-exit-active'
                        : ''
                }`}
            >
                <img
                    src="/stopandgo.png"
                    alt="Stop & Go Race"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // 팀 배정 화면 표시
    if (gamePhase === GamePhase.TEAM_SETUP && !showSplash) {
        return (
            <div
                className={`w-full h-full bg-white shadow-lg relative overflow-hidden fade-transition-enter ${isAnimating ? 'fade-transition-enter-active' : ''}`}
            >
                <TeamSetupScreen
                    teams={teams}
                    onShuffle={gameActions.shuffleTeamsAction}
                    onStart={gameActions.startGameFromTeamSetup}
                    onTeamsChange={gameActions.handleTeamsChange}
                />
            </div>
        );
    }

    // GamePhase.START일 때는 스플래시 화면만 표시하고 게임 UI는 렌더링하지 않음
    if (gamePhase === GamePhase.START) {
        return null;
    }

    return (
        <div
            className="w-full h-full bg-white shadow-lg relative overflow-hidden flex flex-col"
        >
            {showGameUI && (
                <GameHeader
                    title="Stop & Go"
                    currentRound={currentRound}
                    maxRounds={maxRounds}
                    showTimer={isPlayingPhase && !gameState.isPaused}
                    timerValue={timeLeft}
                    showPause={isPlayingPhase}
                    isPaused={gameState.isPaused}
                    onPause={gameState.isPaused ? gameActions.resumeGame : gameActions.pauseGame}
                    showMenuButton={isPlayingPhase}
                    onOpenMenu={handleOpenMenu}
                    showExitButton={isNonPlayingPhase && gamePhase !== GamePhase.GAME_OVER}
                    onExit={gameActions.exitGame}
                    buttonsDisabled={buttonsDisabled}
                />
            )}

                        {showGameUI && (
                            <GameArea
                                positions={positions}
                                playerStatus={playerStatus}
                                currentLight={currentLight}
                                items={items}
                                scores={scores}
                                currentRound={currentRound}
                                teams={teams}
                                onAddCheerPoints={gameActions.addCheerPoints}
                            />
                        )}

            {showGameUI && (
                <Controls
                    onGo={gameActions.handleGo}
                    playerStatus={playerStatus}
                    isGameActive={gamePhase === GamePhase.PLAYING}
                    currentLight={currentLight}
                />
            )}

            {gamePhase === GamePhase.ROUND_START && (
                <RoundModal
                    title={`Round ${currentRound}`}
                    text="Watch the traffic light carefully and go!"
                    buttonText="Ready, Set, Go!"
                    onNext={gameActions.playRound}
                    isCountdown={true}
                />
            )}

            {gamePhase === GamePhase.ROUND_END && roundEndState && (
                <RoundModal
                    title={roundEndState.title}
                    text={roundEndState.text}
                    buttonText={currentRound >= maxRounds ? 'See Final Results' : 'Next Round'}
                    onNext={roundEndState.nextAction}
                    isSuccess={roundEndState.isSuccess}
                    winner={roundEndState.winner}
                    autoProceed={roundEndState.autoProceed ?? false}
                    autoProceedDelay={roundEndState.autoProceedDelay ?? 2000}
                />
            )}

            {gamePhase === GamePhase.QUIZ && quiz && (
                <QuizModal
                    quiz={quiz}
                    isLoading={isQuizLoading}
                    winnerTeam={currentWinner}
                    onAnswer={gameActions.handleQuizAnswer}
                />
            )}

            {gamePhase === GamePhase.GAME_OVER && (
                <GameOverModal scores={scores} onPlayAgain={gameActions.resetGame} />
            )}

            {gameState.isPaused && !gameState.showMenu && (
                <PausedOverlay onResume={gameActions.resumeGame} />
            )}

            {gameState.showMenu && (
                <GameMenuModal
                    isOpen={gameState.showMenu}
                    onClose={handleCloseMenu}
                    onOpenGuide={handleOpenMenuGuide}
                    onEndGame={handleMenuEndGame}
                    onExit={handleMenuExit}
                />
            )}

            <TutorialModal
                isOpen={isMenuTutorialOpen}
                onClose={handleCloseMenuTutorial}
                variant="stage"
            />
        </div>
    );
}