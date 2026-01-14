import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { concatMap, map, Observable, Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GameState } from '../game.model';

@Component({
  selector: 'app-gameover-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gameover-modal.component.html',
  styleUrl: './gameover-modal.component.css',
})
export class GameoverModalComponent implements OnInit {
  answer = '';
  answerLink = 'https://www.google.com/search?q=define:' + this.answer;

  isGameOver!: Observable<{ isOver: boolean; isWin: boolean }>;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
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

  onOKClick() {
    this.gameService.setIsGameOverModalOpen(false);
  }
}
