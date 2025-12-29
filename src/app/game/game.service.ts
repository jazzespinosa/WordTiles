import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  concatMap,
  map,
  shareReplay,
  Subject,
  tap,
} from 'rxjs';
import {
  type CellModel,
  type GameConfigModel,
  // type GameOverModel,
  type GuessPostResponseDto,
  type GetCurrentGameDto,
  LetterState,
  type TurnModel,
  GameState,
  NewGameResponseDto,
} from './game.model';
import { HttpClient } from '@angular/common/http';
import { Environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient) {}

  private readonly INITIAL_WORD_LENGTH = 5;
  private readonly INITIAL_MAX_TURNS = 6;

  private readonly environment = new Environment();
  private baseUrl = this.environment.getApiUrl();

  // ========== isGameModalOpen ==========
  private readonly isGameModalOpen = new BehaviorSubject<boolean>(false);
  readonly isGameModalOpen$ = this.isGameModalOpen.asObservable();
  setIsGameModalOpen(value: boolean) {
    this.isGameModalOpen.next(value);
  }

  // ========== isGameOverModalOpen ==========
  private readonly isGameOverModalOpen = new BehaviorSubject<boolean>(false);
  readonly isGameOverModalOpen$ = this.isGameOverModalOpen.asObservable();
  setIsGameOverModalOpen(value: boolean) {
    this.isGameOverModalOpen.next(value);
  }

  // ========== keyboardStates ==========
  private readonly keyboardStates = new BehaviorSubject<CellModel[]>([]);
  readonly keyboardStates$ = this.keyboardStates.asObservable();
  getKeyboardStates() {
    return this.keyboardStates.getValue();
  }
  setKeyboardStates(values: CellModel[]) {
    this.keyboardStates.next(values);
  }

  // ========== keyboardState ==========
  private readonly keyboardState = new BehaviorSubject<CellModel>({
    value: '',
    state: LetterState.default,
  });
  readonly keyboardState$ = this.keyboardState.asObservable();

  // ========== currentTurnValue ==========
  private readonly currentTurnValue = new BehaviorSubject<string>('');
  readonly currentTurnValue$ = this.currentTurnValue.asObservable();

  // ========== gameConfig ==========
  private readonly gameConfig = new BehaviorSubject<GameConfigModel>({
    wordLength: this.INITIAL_WORD_LENGTH,
    maxTurns: this.INITIAL_MAX_TURNS,
  });
  readonly gameConfig$ = this.gameConfig.asObservable();
  setGameConfig(value: GameConfigModel) {
    this.gameConfig.next(value);
  }

  // ========== gameCellStateValues ==========
  private readonly gameCellStateValues = new BehaviorSubject<TurnModel[]>([]);
  readonly gameCellStateValues$ = this.gameCellStateValues.asObservable();
  setGameCellStateValues(value: TurnModel[]) {
    this.gameCellStateValues.next(value);
  }
  addGameCellStateValues(turnValue: string, cellValues: CellModel[]) {
    this.gameCellStateValues.next([
      ...this.gameCellStateValues.value,
      {
        turnValue: turnValue,
        cellValue: cellValues,
      },
    ]);
  }
  getGameCellStateValues() {
    return this.gameCellStateValues.getValue();
  }

  // ========== gameState ==========
  private readonly gameState = new BehaviorSubject<GameState>(
    GameState.default,
  );
  readonly gameState$ = this.gameState.asObservable();
  getGameState(): GameState {
    return this.gameState.getValue();
  }
  setGameState(value: GameState) {
    this.gameState.next(value);
  }

  // ========== answer ==========
  private readonly answer = new BehaviorSubject<string>('');
  readonly answer$ = this.answer.asObservable();
  getAnswer(): string {
    return this.answer.getValue();
  }
  setAnswer(value: string) {
    this.answer.next(value);
  }

  // ========== gameResponse ==========
  private readonly gameResponse = new BehaviorSubject<GetCurrentGameDto | null>(
    null,
  );
  readonly gameResponse$ = this.gameResponse.asObservable();

  // ========== gameId ==========
  private readonly gameId = new BehaviorSubject<number>(0);
  readonly gameId$ = this.gameId.asObservable();
  getGameId(): number {
    return this.gameId.getValue();
  }
  setGameId(value: number) {
    this.gameId.next(value);
  }

  // ========== currentGame ==========
  private readonly currentGame = new BehaviorSubject<GetCurrentGameDto | null>(
    null,
  );
  readonly currentGame$ = this.currentGame.asObservable();
  getCurrentGame(): GetCurrentGameDto | null {
    return this.currentGame.getValue();
  }
  setCurrentGame(value: GetCurrentGameDto | null) {
    this.currentGame.next(value);
  }

  // ========== guessResponse ==========
  private readonly guessResponse =
    new BehaviorSubject<GuessPostResponseDto | null>(null);
  readonly guessResponse$ = this.guessResponse.asObservable();
  getGuessResponse(): GuessPostResponseDto | null {
    return this.guessResponse.getValue();
  }
  setGuessResponse(value: GuessPostResponseDto | null) {
    this.guessResponse.next(value);
  }

  // ========== isGuessValid ==========
  private readonly isGuessValid = new Subject<boolean>();
  readonly isGuessValid$ = this.isGuessValid.asObservable();
  setIsGuessValid(value: boolean) {
    this.isGuessValid.next(value);
  }

  onChangeTurnValue(newValue: string) {
    if (newValue.length <= this.gameConfig.value.wordLength) {
      this.currentTurnValue.next(newValue);
    }
  }

  onEnterValue(enteredValue: string) {
    return this.http.get<GetCurrentGameDto>(this.baseUrl + 'api/Game/get').pipe(
      map((response) => ({
        gameId: response.gameId,
        currentTurn: response.currentTurn,
        guessLength: response.guessLength,
        maxTurns: response.maxTurns,
        guesses: response.guesses,
      })),
      tap((game) => this.gameResponse.next(game)),
      concatMap((game) =>
        this.http
          .post<GuessPostResponseDto>(this.baseUrl + 'api/Game/guess', {
            GameId: game.gameId,
            Guess: enteredValue,
          })
          .pipe(
            map((response) => ({
              gameId: response.gameId,
              guess: response.guess,
              turn: response.turn,
              isGuessCorrect: response.isGuessCorrect,
              answer: response.answer,
              letterStates: response.letterStates,
            })),
          ),
      ),
      tap((postResponse) => this.processGuess(postResponse, enteredValue)),
      map(() => void 0),
    );
  }

  processGuess(postResponse: GuessPostResponseDto, enteredValue: string) {
    // this.setGuessResponse(postResponse);

    let cellValues: CellModel[] = [];
    let isWinner = false;
    let guess = postResponse.guess;
    let letterStates: number[] = postResponse.letterStates;

    for (let i = 0; i < guess.length; i++) {
      let stateNumber = letterStates[i];
      let state: LetterState = this.getCellStateFromNumber(stateNumber);

      this.keyboardState.next({
        value: enteredValue[i],
        state: state,
      });
      cellValues.push({
        state: state,
        value: enteredValue[i],
      });
    }

    this.addGameCellStateValues(enteredValue, cellValues);
    this.clearTempTurn();

    for (const cellValue of cellValues) {
      if (cellValue.state !== LetterState.correct) {
        isWinner = false;
        break;
      }
      isWinner = true;
    }

    if (isWinner) {
      this.onGameOver(postResponse.answer, GameState.win);
      return;
    }

    if (
      this.getGameCellStateValues().length >=
      this.gameConfig.getValue().maxTurns
    ) {
      this.onGameOver(postResponse.answer, GameState.lose);
      return;
    }
  }

  onGameOver(answer: string, gameState: GameState) {
    this.setAnswer(answer);
    this.setGameState(gameState);
    this.setIsGameOverModalOpen(true);
  }

  onNewGameStart() {
    let wordLength = this.gameConfig.value.wordLength;
    let maxTurns = this.gameConfig.value.maxTurns;

    return this.http
      .post<NewGameResponseDto>(this.baseUrl + 'api/Game/newgame', {
        wordLength: wordLength,
        maxTurns: maxTurns,
      })
      .pipe(
        map((response) => ({
          gameId: response.gameId,
          wordLength: response.wordLength,
          maxTurns: response.maxTurns,
        })),
        tap((response) => {
          this.gameCellStateValues.next([]);
          this.clearTempTurn();
          this.setCurrentGame({
            gameId: response.gameId,
            currentTurn: 0,
            guessLength: response.wordLength,
            maxTurns: response.maxTurns,
            guesses: [],
          });
          this.setAnswer('');
          this.setGameState(GameState.newGame);
        }),
      );
  }

  getGame() {
    return this.http.get<GetCurrentGameDto>(this.baseUrl + 'api/Game/get').pipe(
      map((response) => ({
        gameId: response.gameId,
        currentTurn: response.currentTurn,
        guessLength: response.guessLength,
        maxTurns: response.maxTurns,
        guesses: response.guesses,
      })),
    );
  }

  getCellStateFromNumber(stateNumber: number): LetterState {
    let state: LetterState = LetterState.default;
    switch (stateNumber) {
      case 0:
        state = LetterState.correct;
        break;
      case 1:
        state = LetterState.present;
        break;
      case 2:
        state = LetterState.incorrect;
        break;
      case 3:
        state = LetterState.default;
        break;
      default:
    }

    return state;
  }

  updateKeyboardStatesOnLoad(guessesAndStates: TurnModel[]) {
    let keyboardStates: CellModel[] = [];
    for (let i = 0; i < guessesAndStates.length; i++) {
      for (let f = 0; f < guessesAndStates[i].cellValue.length; f++) {
        let keyboardState: CellModel = {
          value: guessesAndStates[i].cellValue[f].value,
          state: guessesAndStates[i].cellValue[f].state,
        };

        keyboardStates.push(keyboardState);
      }
    }
    this.setKeyboardStates(keyboardStates);
  }

  getCurrentTurn() {
    return this.gameCellStateValues$.pipe(
      map((values) => values.length),
      shareReplay(1),
    );
  }

  clearTempTurn() {
    this.currentTurnValue.next('');
  }
}
