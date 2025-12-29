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

export interface CellModel {
  value: string;
  state: LetterState;
}

export interface TurnModel {
  turnValue: string; // word of turn / row
  cellValue: CellModel[];
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
  currentTurn: number;
  guessLength: number;
  maxTurns: number;
  guesses: Guess[];
}

export interface Guess {
  guess: string;
  letterStates: number[];
}
