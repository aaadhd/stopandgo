
export type Team = 'red' | 'blue';

export enum GamePhase {
    START = 'START',
    ROUND_START = 'ROUND_START',
    PLAYING = 'PLAYING',
    QUIZ = 'QUIZ',
    ROUND_END = 'ROUND_END',
    GAME_OVER = 'GAME_OVER',
}

export type PlayerStatus = {
    hasShield: boolean;
    isBoosted: boolean;
    isSlowed: boolean;
    isFrozen: boolean;
    isWinner: boolean;
    penalty: boolean;
};

export type PlayerStatuses = {
    [key in Team]: PlayerStatus;
};

export type LightColor = 'red' | 'yellow' | 'green';

export type ItemType = 'shield' | 'booster' | 'slow' | 'ice';

export type Item = {
    id: number;
    team: Team;
    type: ItemType;
    position: number; // y-position on the track
    disappearing: boolean;
};

export type Quiz = {
    question: string;
    answers: string[];
    correctAnswer: string;
};

export type RoundEndState = {
    title: string;
    text: string;
    winner: Team | null;
    isSuccess: boolean | null;
    nextAction: () => void;
};

export type GameState = {
    gamePhase: GamePhase;
    scores: { [key in Team]: number };
    currentRound: number;
    timeLeft: number;
    positions: { [key in Team]: number };
    playerStatus: PlayerStatuses;
    currentLight: LightColor;
    items: Item[];
    roundEndState: RoundEndState | null;
    quiz: Quiz | null;
    isQuizLoading: boolean;
    currentWinner: Team | null;
};