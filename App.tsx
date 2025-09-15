import React, { useLayoutEffect, useRef } from 'react';
import { GamePhase } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import InfoBar from './components/InfoBar';
import GameArea from './components/GameArea';
import Controls from './components/Controls';
import StartModal from './components/modals/StartModal';
import RoundModal from './components/modals/RoundModal';
import QuizModal from './components/modals/QuizModal';
import GameOverModal from './components/modals/GameOverModal';

export default function App(): React.ReactNode {
    const { gameState, gameActions } = useGameLogic();
    const stageRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const updateScale = () => {
            const stage = stageRef.current;
            if (stage) {
                const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
                stage.style.transform = `scale(${scale})`;
            }
        };

        window.addEventListener('resize', updateScale);
        updateScale(); // Initial scale

        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const {
        gamePhase, scores, currentRound, timeLeft, positions,
        playerStatus, currentLight, items, roundEndState, quiz, isQuizLoading, currentWinner
    } = gameState;

    const showGameUI = gamePhase !== GamePhase.START && gamePhase !== GamePhase.GAME_OVER;

    return (
        <div
            ref={stageRef}
            style={{ transformOrigin: 'top center' }}
            className="w-[1280px] h-[800px] bg-white rounded-3xl shadow-lg relative overflow-hidden flex flex-col mx-auto"
        >
            {showGameUI && (
                <InfoBar
                    scores={scores}
                    currentRound={currentRound}
                    timeLeft={timeLeft}
                />
            )}

            {showGameUI && (
                <GameArea
                    positions={positions}
                    playerStatus={playerStatus}
                    currentLight={currentLight}
                    items={items}
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
                <StartModal onStart={gameActions.startGame} />
            )}

            {gamePhase === GamePhase.ROUND_START && (
                <RoundModal
                    title={`Round ${currentRound} Start!`}
                    text="Watch the traffic light carefully and go!"
                    buttonText="Ready, Set, Go!"
                    onNext={gameActions.playRound}
                />
            )}

            {gamePhase === GamePhase.ROUND_END && roundEndState && (
                <RoundModal
                    title={roundEndState.title}
                    text={roundEndState.text}
                    buttonText={currentRound >= 12 ? 'See Final Results' : 'Next Round'}
                    onNext={roundEndState.nextAction}
                    isSuccess={roundEndState.isSuccess}
                />
            )}

            {gamePhase === GamePhase.QUIZ && quiz && (
                <QuizModal
                    quiz={quiz}
                    isLoading={isQuizLoading}
                    winnerTeam={currentWinner || 'red'}
                    onAnswer={gameActions.handleQuizAnswer}
                />
            )}

            {gamePhase === GamePhase.GAME_OVER && (
                <GameOverModal scores={scores} onPlayAgain={gameActions.resetGame} />
            )}
        </div>
    );
}