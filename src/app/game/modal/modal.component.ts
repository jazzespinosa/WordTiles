import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameState } from '../game.model';

type ErrorType = {
  errorName: string;
  errorMessage: string;
};

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnInit {
  selectedWordLength = 5;
  selectedMaxTurns = 6;
  isLoading = false;
  isError = false;
  isResumeEnabled = false;
  ErrorType = { errorName: '', errorMessage: '' };

  constructor(
    private gameService: GameService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.gameService.globalGameStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (globalGameStatus) => {
          if (globalGameStatus.gameId !== 0) {
            this.isResumeEnabled = true;
          } else {
            this.isResumeEnabled = false;
          }
        },
      });
  }

  onNewGameStartModal() {
    this.isLoading = true;
    this.isError = false;
    this.ErrorType = { errorName: '', errorMessage: '' };

    this.gameService
      .onNewGameStart(+this.selectedWordLength, +this.selectedMaxTurns)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          return throwError(() => new Error('Something went wrong.', error));
        }),
      )
      .subscribe({
        next: () => {
          this.gameService.updateGlobalGameStatus({
            gameState: GameState.inProgress,
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.isError = true;

          this.ErrorType = {
            errorName: error.name,
            errorMessage: error,
          };
          console.log('error', error);
        },
        complete: () => {
          this.isLoading = false;
          this.isError = false;
          this.ErrorType = { errorName: '', errorMessage: '' };

          this.gameService.setIsGameModalOpen(false);
        },
      });
  }

  onResumeModal() {
    this.gameService.setIsGameModalOpen(false);
  }
}
