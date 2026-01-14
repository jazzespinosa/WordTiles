import { Component, DestroyRef, Input, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import {
  combineLatest,
  concatMap,
  map,
  Observable,
  Subscription,
  tap,
} from 'rxjs';
import {
  AnimationEvent,
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { GameState } from '../game.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-letter-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-container.component.html',
  styleUrl: './letter-container.component.css',
  animations: [
    trigger('cellAnimate', [
      state(
        'hasValue', // letter-in transition
        style({
          // 'background-color': 'red',
          opacity: 1,
          transform: 'translateX(0)',
        }),
      ),
      state(
        'hasNoValue', // letter-out transition
        style({
          // 'background-color': 'purple',
          opacity: 0,
          transform: 'translateX(-2rem)',
        }),
      ),
      transition('hasNoValue <=> hasValue', animate(300)),
    ]),
  ],
})
export class LetterContainerComponent implements OnInit {
  @Input() turnIndex!: number; //row of letter container
  @Input() letterIndex!: number; //column of letter container

  cellValue!: string;
  currentTurn = 0; //current turn of the game
  currentTurnValue = '';
  prevTurnValue = '';

  cellStateClass = 'default';
  animateState = 'hasNoValue';
  isFlipping = false;
  showColor = false;
  isInitialized = false;

  invalidTurn = false;
  isGameOver!: Observable<boolean>;

  constructor(
    private gameService: GameService,
    private destroyRef: DestroyRef,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.gameService.globalGameStatus$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((values) => (this.currentTurn = values.currentTurn)),
      )
      .subscribe((values) => {
        if (values.guesses[this.turnIndex]) {
          this.cellValue =
            values.guesses[this.turnIndex].turnValue[this.letterIndex];
          this.cellStateClass =
            values.guesses[this.turnIndex].cellValue[
              this.letterIndex
            ].state.toString();

          if (!this.isInitialized) {
            this.showColor = true;
          } else {
            if (values.currentTurn === this.turnIndex) {
              setTimeout(() => {
                this.isFlipping = true;
                this.showColor = true;
                setTimeout(() => {
                  this.isFlipping = false;
                }, 50);
              }, this.letterIndex * 200);
            }
          }
        } else {
          this.cellValue = ' ';
          this.cellStateClass = 'default';
        }
      });

    this.gameService.tempTurnValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.currentTurn === this.turnIndex && value[this.letterIndex]) {
          this.cellValue = value[this.letterIndex];
        }
      });

    //letter transition animation for current turn
    combineLatest([
      this.gameService.tempTurnValue$,
      this.gameService.globalGameStatus$,
    ]).subscribe(([tempTurnValue, { currentTurn }]) => {
      this.prevTurnValue = this.currentTurnValue;
      this.currentTurnValue = tempTurnValue[this.letterIndex] ?? '';

      if (
        (this.currentTurnValue && currentTurn === this.turnIndex) ||
        currentTurn > this.turnIndex
      ) {
        if (!this.isInitialized && currentTurn > this.turnIndex) {
          setTimeout(
            () => {
              this.animateState = 'hasValue';
            },
            this.turnIndex * 300 + this.letterIndex * 100,
          );
        } else {
          this.animateState = 'hasValue';
        }
      } else {
        this.animateState = 'hasNoValue';
      }
      this.isInitialized = true;
    });

    this.gameService.isGuessValid$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.currentTurn === this.turnIndex) {
          this.invalidTurn = !value;
          if (!value) {
            this.triggerShake();
          }
        }
      });

    this.isGameOver = this.gameService.globalGameStatus$.pipe(
      map(
        (value) =>
          value.gameState === GameState.win ||
          value.gameState === GameState.lose ||
          value.gameState === GameState.default,
      ),
    );
  }

  triggerShake() {
    setTimeout(() => {
      this.gameService.setIsGuessValid(true);
    }, 1000);

    this._snackBar.open('Oops! That is not a valid word.', '', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 1000,
      panelClass: ['custom-snackbar', 'translate-middle-x'],
    });
  }

  onAnimateStart(event: AnimationEvent) {
    if (event.toState === 'hasNoValue') {
      this.currentTurnValue = this.prevTurnValue;
    }
  }
}
