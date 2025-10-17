import React, { useState, useEffect, useRef } from 'react';
import { GamePhase } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import GameHeader from './components/GameHeader';
import GameArea from './components/GameArea';
import Controls from './components/Controls';
import StartModal from './components/modals/StartModal';
import RoundModal from './components/modals/RoundModal';
import QuizModal from './components/modals/QuizModal';
import GameOverModal from './components/modals/GameOverModal';
import MenuModal from './components/modals/MenuModal';
import GameSettingsModal from './components/modals/GameSettingsModal';
import PausedOverlay from './components/modals/PausedOverlay';
import TeamSetupScreen from './components/modals/TeamSetupScreen';

export default function App(): React.ReactNode {
    const { gameState, teams, gameActions } = useGameLogic();
    const [showSplash, setShowSplash] = useState(false);
    const [isSplashFadingOut, setIsSplashFadingOut] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);
    const splashTimerRef = useRef<NodeJS.Timeout | null>(null);

    const {
        gamePhase, scores, currentRound, timeLeft, positions,
        playerStatus, currentLight, items, roundEndState, quiz, isQuizLoading, currentWinner,
        showSettings
    } = gameState;

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
    const buttonsDisabled = gameState.isPaused || gameState.showMenu;

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

    return (
        <div
            className="w-full h-full bg-white shadow-lg relative overflow-hidden flex flex-col"
        >
            {showGameUI && (
                <GameHeader
                    title="Stop & Go"
                    currentRound={currentRound}
                    showTimer={isPlayingPhase && !gameState.isPaused}
                    timerValue={timeLeft}
                    showPause={isPlayingPhase}
                    isPaused={gameState.isPaused}
                    onPause={gameState.isPaused ? gameActions.resumeGame : gameActions.pauseGame}
                    showMenuButton={isPlayingPhase}
                    onOpenMenu={gameActions.openMenu}
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

            {gamePhase === GamePhase.START && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <StartModal onStart={gameActions.startGame} />
                </div>
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
                    buttonText={currentRound >= 5 ? 'See Final Results' : 'Next Round'}
                    onNext={roundEndState.nextAction}
                    isSuccess={roundEndState.isSuccess}
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
                <MenuModal
                    onResume={gameActions.closeMenu}
                    onEndGame={gameActions.endGameFromMenu}
                    onExit={gameActions.exitGame}
                />
            )}
        </div>
    );
}