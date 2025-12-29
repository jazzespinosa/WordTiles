import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { catchError, map, Observable, Subscription, throwError } from 'rxjs';

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
export class ModalComponent implements OnInit, OnDestroy {
  selectedWordLength = 5;
  selectedMaxTurns = 6;
  isLoading = false;
  isError = false;
  isResumeEnabled = false;
  ErrorType = { errorName: '', errorMessage: '' };

  private subsCurentGame!: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.subsCurentGame = this.gameService.currentGame$.subscribe({
      next: (currentGame) => {
        if (currentGame) {
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

    this.gameService.setGameConfig({
      wordLength: +this.selectedWordLength,
      maxTurns: +this.selectedMaxTurns,
    });

    this.gameService
      .onNewGameStart()
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Something went wrong.', error));
        })
      )
      .subscribe({
        next: () => {},
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

  ngOnDestroy(): void {
    this.subsCurentGame.unsubscribe();
  }
}
