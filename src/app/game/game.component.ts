import { Component, DestroyRef, OnDestroy, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { map, Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { GameService } from './game.service';
import { GameState, type GameConfigModel } from './game.model';
import { LetterContainerComponent } from './letter-container/letter-container.component';
import { ModalComponent } from './modal/modal.component';
import { CommonModule } from '@angular/common';
import { GameoverModalComponent } from './gameover-modal/gameover-modal.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { GuessLoadingSpinnerComponent } from '../shared/guess-loading-spinner/guess-loading-spinner.component';

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
    LoadingSpinnerComponent,
    GuessLoadingSpinnerComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements OnInit, OnDestroy {
  isModalOpen!: Observable<boolean>;
  gameConfig: GameConfigModel = {
    wordLength: 5,
    maxTurns: 6,
  };
  isGameOverModalOpen!: Observable<boolean>;
  isGameOver!: Observable<{ isOver: boolean; isWin: boolean }>;
  answer = '';
  answerLink = 'https://www.google.com/search?q=define:' + this.answer;
  isGameLoading = false;
  isGuessLoading!: Observable<boolean>;

  constructor(
    private gameService: GameService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.isGameLoading = true;
    this.isGuessLoading = this.gameService.isGuessLoading$;

    this.gameService.resetGame();
    this.gameService.setIsGameModalOpen(true);
    this.isModalOpen = this.gameService.isGameModalOpen$;
    this.isGameOverModalOpen = this.gameService.isGameOverModalOpen$;

    this.gameService.globalGameStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.gameConfig = {
          wordLength: value.wordLength,
          maxTurns: value.maxTurns,
        };
      });

    this.gameService
      .getGame()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isGameLoading = false;
        },
        error: () => {
          this.isGameLoading = false;
        },
      });

    this.isGameOver = this.gameService.globalGameStatus$.pipe(
      map((value) => ({
        isOver:
          value.gameState === GameState.win ||
          value.gameState === GameState.lose,
        isWin: value.gameState === GameState.win,
      })),
      tap(() => {
        if (GameState.win || GameState.lose) {
          this.answer = this.gameService.getGuessResponse()?.answer ?? '';
          this.answerLink =
            'https://www.google.com/search?q=define:' + this.answer;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.gameService.setTempTurnValue('');
  }

  onPlayAgainModal() {
    this.gameService.setIsGameModalOpen(true);
  }
}
