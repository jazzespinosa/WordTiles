import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { combineLatest, map, Observable, Subscription, tap } from 'rxjs';
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

@Component({
  selector: 'app-letter-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letter-container.component.html',
  styleUrl: './letter-container.component.css',
  animations: [
    trigger('cellAnimate', [
      state(
        'hasValue',
        style({
          // 'background-color': 'red',
          opacity: 1,
          transform: 'translateX(0)',
        })
      ),
      state(
        'hasNoValue',
        style({
          // 'background-color': 'purple',
          opacity: 0,
          transform: 'translateX(-2rem)',
        })
      ),
      transition('hasNoValue <=> hasValue', animate(300)),
    ]),
  ],
})
export class LetterContainerComponent implements OnInit, OnDestroy {
  @Input() turnIndex!: number; //row
  @Input() letterIndex!: number; //column

  cellValue!: string;
  currentTurn = 0;
  currentTurnValue = '';
  prevTurnValue = '';

  cellStateClass = 'default';
  animateState = 'hasNoValue';

  invalidTurn = false;
  isGameOver!: Observable<boolean>;

  private subsGetTurnValue!: Subscription;
  private subsGetGameCellState!: Subscription;
  private subsIsInvalidTurn!: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.subsGetGameCellState = this.gameService.gameCellStateValues$
      .pipe(tap((values) => (this.currentTurn = values.length)))
      .subscribe((value) => {
        if (value[this.turnIndex]) {
          this.cellStateClass = value[this.turnIndex].cellValue[
            this.letterIndex
          ]
            ? value[this.turnIndex].cellValue[this.letterIndex].state.toString()
            : 'default';
        }
        if (value.length === 0) {
          this.cellStateClass = 'default';
        }

        let turnValue = value[this.turnIndex];
        if (turnValue) {
          this.cellValue = turnValue.turnValue[this.letterIndex];
        } else {
          this.cellValue = ' ';
        }
      });

    this.subsGetTurnValue = combineLatest([
      this.gameService.currentTurnValue$,
      this.gameService.getCurrentTurn(),
    ]).subscribe(([value, currentTurn]) => {
      this.prevTurnValue = this.currentTurnValue;
      this.currentTurnValue = value[this.letterIndex] ?? '';

      if (
        (this.currentTurnValue && currentTurn === this.turnIndex) ||
        currentTurn > this.turnIndex
      ) {
        this.animateState = 'hasValue';
      } else {
        this.animateState = 'hasNoValue';
      }
    });

    this.subsIsInvalidTurn = this.gameService.isGuessValid$.subscribe(
      (value) => {
        if (this.currentTurn === this.turnIndex) {
          this.invalidTurn = !value;
          if (!value) {
            this.triggerShake();
          }
        }
      }
    );

    this.isGameOver = this.gameService.gameState$.pipe(
      map(
        (value) =>
          value === GameState.win ||
          value === GameState.lose ||
          value === GameState.default
      )
    );
  }

  ngOnDestroy(): void {
    this.subsGetTurnValue.unsubscribe();
    this.subsGetGameCellState.unsubscribe();
    this.subsIsInvalidTurn.unsubscribe();
  }

  triggerShake() {
    setTimeout(() => {
      this.gameService.setIsGuessValid(true);
    }, 1000);
  }

  onAnimateStart(event: AnimationEvent) {
    if (event.toState === 'hasNoValue') {
      this.currentTurnValue = this.prevTurnValue;
    }
  }
}
