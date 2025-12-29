import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { map, Observable, tap } from 'rxjs';

import { KeyboardComponent } from './keyboard/keyboard.component';
import { GameService } from './game.service';
import {
  CellModel,
  GameState,
  GetCurrentGameDto,
  TurnModel,
  type GameConfigModel,
} from './game.model';
import { LetterContainerComponent } from './letter-container/letter-container.component';
import { ModalComponent } from './modal/modal.component';
import { CommonModule } from '@angular/common';
import { GameoverModalComponent } from './gameover-modal/gameover-modal.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    MatGridListModule,
    LetterContainerComponent,
    KeyboardComponent,
    ModalComponent,
    GameoverModalComponent,
    CommonModule,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements OnInit, OnDestroy {
  isModalOpen!: Observable<boolean>;
  gameConfig!: Observable<GameConfigModel>;
  isGameOverModalOpen!: Observable<boolean>;
  isGameOver!: Observable<{ isOver: boolean; isWin: boolean }>;
  answer = '';
  answerLink = 'https://www.google.com/search?q=define:' + this.answer;

  // currentGame!: Observable<GetCurrentGameModel | null>;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.setIsGameModalOpen(true);
    this.gameService.getGame().subscribe({
      next: (game) => {
        if (game) {
          this.gameService.setCurrentGame(game);
          this.gameService.setGameState(GameState.inProgress);
          this.gameService.setGameConfig({
            wordLength: game.guessLength,
            maxTurns: game.maxTurns,
          });

          let guessWord = '';
          let letterStates: number[] = [];
          let guessesAndStates: TurnModel[] = [];
          game.guesses.forEach((guess) => {
            guessWord = guess.guess;
            letterStates = guess.letterStates;
            let cellModels: CellModel[] = [];
            for (let index = 0; index < guessWord.length; index++) {
              let cellModel: CellModel = {
                value: guessWord[index],
                state: this.gameService.getCellStateFromNumber(
                  letterStates[index],
                ),
              };
              cellModels.push(cellModel);
            }

            guessesAndStates.push({
              turnValue: guessWord,
              cellValue: cellModels,
            });
          });
          this.gameService.setGameCellStateValues(guessesAndStates);
          this.gameService.updateKeyboardStatesOnLoad(guessesAndStates);
        }
      },
      error: (err) => {
        if (err.error === 'Game not found.') {
          this.gameService.setIsGameModalOpen(true);
        }
      },
    });

    // this.currentGame = this.gameService.currentGame$;
    this.gameConfig = this.gameService.gameConfig$;
    this.isModalOpen = this.gameService.isGameModalOpen$;
    this.isGameOverModalOpen = this.gameService.isGameOverModalOpen$;
    this.isGameOver = this.gameService.gameState$.pipe(
      map((value) => ({
        isOver: value === GameState.win || value === GameState.lose,
        isWin: value === GameState.win,
      })),
      tap(() => {
        if (GameState.win || GameState.lose) {
          this.answer = this.gameService.getAnswer();
          this.answerLink =
            'https://www.google.com/search?q=define:' + this.answer;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.gameService.clearTempTurn();
  }
}
