import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { concatMap, map, Observable, Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GameState } from '../game.model';
import confetti from 'canvas-confetti';

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
      tap((status) => {
        if (GameState.win || GameState.lose) {
          this.answer = this.gameService.getGuessResponse()?.answer ?? '';
          this.answerLink =
            'https://www.google.com/search?q=define:' + this.answer;
        }

        if (status.isWin) {
          this.triggerConfetti();
        }
      }),
    );
  }

  onOKClick() {
    this.gameService.setIsGameOverModalOpen(false);
  }

  triggerConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;
    var skew = 1;

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.85 },
        zIndex: 2000,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.85 },
        zIndex: 2000,
      });

      var timeLeft = end - Date.now();
      var ticks = Math.max(200, 500 * (timeLeft / duration));
      skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: ticks,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors: ['#ff0000ff'],
        gravity: randomInRange(0.4, 0.6),
        scalar: randomInRange(0.4, 1),
        drift: randomInRange(-0.4, 0.4),
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
}
