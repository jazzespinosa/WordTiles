export enum LetterState {
  correct = 'correct',
  present = 'present',
  incorrect = 'incorrect',
  default = 'default',
}

export enum GameState {
  newGame = 'newGame',
  inProgress = 'inProgress',
  win = 'win',
  lose = 'lose',
  default = 'default',
}

export interface GameConfigModel {
  wordLength: number;
  maxTurns: number;
}

export interface NewGameResponseDto {
  gameId: number;
  wordLength: number;
  maxTurns: number;
}

export interface GuessPostResponseDto {
  gameId: number;
  guess: string;
  turn: number;
  isGuessCorrect: boolean;
  answer: string;
  letterStates: number[];
}

export interface GetCurrentGameDto {
  gameId: number;
  turnsPlayed: number;
  guessLength: number;
  maxTurns: number;
  guesses: Guess[];
}

export interface Guess {
  guess: string;
  letterStates: number[];
}

export interface GlobalGameStatusModel {
  gameState: GameState;
  gameId: number;
  wordLength: number;
  maxTurns: number;
  currentTurn: number;
  guesses: TurnModel[];
}

export interface TurnModel {
  turnValue: string; // word of turn / row
  cellValue: CellModel[];
}

export interface CellModel {
  value: string; // letter
  state: LetterState;
}

export interface HomeStatsModel {
  hasExistingGame: boolean;
  gamesPlayed: number;
  winPercentage: number;
  currentStreak: number;
  homeGameHistories: GameHistoryModel[];
}

export interface GameHistoryModel {
  gameId: number;
  date: Date;
  word: string;
  result: string;
  turnsSolved: number;
  maxTurns: number;
}

export interface StatsModel {
  gamesPlayed: number;
  winPercentage: number;
  gamesWon: number;
  gamesLost: number;
  averageTurnsToWin: number;
  currentStreak: number;
  longestStreak: number;
  fastestWinByTime: FastestWinByTimeModel;
  fastestWinByTurns: FastestWinByTurnsModel;
  wordLengthDistribution: WordLengthDistributionModel[];
  turnDistribution: TurnDistributionModel[];
  usedWordDistribution: WordDistributionModel[];
  winsByTurnDistribution: WinsByTurnDistributionModel[];
}

export interface FastestWinByTimeModel {
  gameId: number;
  duration: Date;
  word: string;
}

export interface FastestWinByTurnsModel {
  gameId: number;
  turnsTaken: number;
  word: string;
}

export interface WordLengthDistributionModel {
  wordLength: number;
  count: number;
}

export interface TurnDistributionModel {
  turn: number;
  count: number;
}

export interface WordDistributionModel {
  word: string;
  count: number;
}

export interface WinsByTurnDistributionModel {
  wordLength: number;
  count: TurnsToWinModel[];
}

export interface TurnsToWinModel {
  turns: number;
  winCount: number;
}
