import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GamePhase } from '../types';

// Mock audio utility
jest.mock('../utils/audio', () => ({
  playSound: jest.fn(),
}));

// Mock Gemini service
jest.mock('../services/geminiService', () => ({
  generateQuizQuestion: jest.fn().mockResolvedValue({
    question: "What is 2 + 2?",
    answers: ["3", "4", "5"],
    correctAnswer: "4",
  }),
}));

describe('useGameLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGameLogic());
    
    expect(result.current.gameState.gamePhase).toBe(GamePhase.START);
    expect(result.current.gameState.scores).toEqual({ red: 0, blue: 0 });
    expect(result.current.gameState.currentRound).toBe(1);
    expect(result.current.gameState.timeLeft).toBe(20);
  });

  it('should start game correctly', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.gameActions.startGame();
    });
    
    expect(result.current.gameState.gamePhase).toBe(GamePhase.ROUND_START);
  });

  it('should handle round start correctly', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.gameActions.startGame();
      result.current.gameActions.playRound();
    });
    
    expect(result.current.gameState.gamePhase).toBe(GamePhase.PLAYING);
    expect(result.current.gameState.positions).toEqual({ red: 0, blue: 0 });
    expect(result.current.gameState.timeLeft).toBe(20);
  });

  it('should reset game correctly', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.gameActions.startGame();
      result.current.gameActions.playRound();
      result.current.gameActions.resetGame();
    });
    
    expect(result.current.gameState.gamePhase).toBe(GamePhase.START);
    expect(result.current.gameState.scores).toEqual({ red: 0, blue: 0 });
    expect(result.current.gameState.currentRound).toBe(1);
  });
});

