import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import Keyboard from 'simple-keyboard';
import { GameService } from '../game.service';
import { map, Observable, Subscription, take, tap } from 'rxjs';
import { CellModel, GameState, LetterState } from '../game.model';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css',
})
export class KeyboardComponent implements OnInit, OnDestroy {
  wordLength = 0;
  value = '';
  keyboard!: Keyboard;
  isGameOver = false;

  private keyDownListener!: (event: KeyboardEvent) => void;

  private subsGameConfig!: Subscription;
  private subsKeyboardState!: Subscription;
  private subsIsGameOver!: Subscription;
  private subsIsNewGameStarted!: Subscription;
  private subsCurrentKeyboardStates!: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, // checks the current platform the app is running (browser, server, or mobile env)
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.initKeyboard();

    // checks if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Only add the event listener in the browser
      this.keyDownListener = (event: KeyboardEvent) => {
        this.onKeyPress(event.key);
      };
      window.addEventListener('keydown', this.keyDownListener);
    }

    this.subsGameConfig = this.gameService.gameConfig$.subscribe((value) => {
      this.wordLength = value.wordLength;
    });

    this.subsKeyboardState = this.gameService.keyboardState$.subscribe(
      (value) => {
        this.updateKeyboardButtonTheme(value.value, value.state);
      }
    );

    this.subsIsGameOver = this.gameService.gameState$.subscribe((value) => {
      if (value === GameState.win || value === GameState.lose) {
        this.isGameOver = true;
      } else {
        this.isGameOver = false;
      }
    });

    this.subsIsNewGameStarted = this.gameService.gameState$.subscribe(
      (gameState) => {
        if (gameState === GameState.newGame) {
          this.resetKeyboardStates();
          this.gameService.setGameState(GameState.inProgress);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.keyDownListener) {
      window.removeEventListener('keydown', this.keyDownListener);
    }

    this.subsGameConfig.unsubscribe();
    this.subsKeyboardState.unsubscribe();
    this.subsIsGameOver.unsubscribe();
    this.subsIsNewGameStarted.unsubscribe();
    this.subsCurrentKeyboardStates.unsubscribe();
  }

  initKeyboard() {
    this.keyboard = new Keyboard({
      onKeyPress: (key) => this.onKeyPress(key),
      layout: {
        default: [
          'Q W E R T Y U I O P',
          'A S D F G H J K L',
          '{enter} Z X C V B N M {bksp}',
        ],
      },
      display: {
        '{bksp}': '⌫',
        '{enter}': 'ENTER',
      },
    });

    let currentKeyboardStates: CellModel[] = [];
    this.subsCurrentKeyboardStates = this.gameService.keyboardStates$.subscribe(
      (value) => {
        currentKeyboardStates = value;
        if (currentKeyboardStates.length > 0) {
          currentKeyboardStates.forEach((item) => {
            this.updateKeyboardButtonTheme(item.value, item.state);
          });
        }
      }
    );
  }

  resetKeyboardStates() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    letters.forEach((item) => {
      let keyTheme = this.keyboard.getButtonThemeClasses(item);
      this.keyboard.removeButtonTheme(item, keyTheme[0]);
    });
  }

  onKeyPress(key: string) {
    if (this.isGameOver) {
      return;
    }

    if ((key === '{bksp}' || key === 'Backspace') && this.value.length > 0) {
      this.value = this.value.slice(0, this.value.length - 1);
      this.gameService.onChangeTurnValue(this.value);
    } else if (
      key === '{enter}' ||
      key === 'Enter'
      // &&  this.value.length === this.wordLength
    ) {
      // this.keyboard.addButtonTheme(key, 'correct-btn');
      this.gameService.onEnterValue(this.value).subscribe({
        next: () => {
          this.gameService.setIsGuessValid(true);
          this.value = '';
        },
        error: (err) => {
          if (err.error.startsWith('Invalid guess word')) {
            this.gameService.setIsGuessValid(false);
          }
          if (
            err.error ===
            'Guess word length does not match the game word length.'
          ) {
            this.gameService.setIsGuessValid(false);
          }
        },
      });
    } else if (this.isAlphabet(key) && this.value.length < this.wordLength) {
      this.value = this.value + key.toUpperCase();
      this.gameService.onChangeTurnValue(this.value);
    }
  }

  isAlphabet(input: string) {
    if (input.length === 1 && input.match(/[a-z]/i)) {
      return true;
    }
    return false;
  }

  updateKeyboardButtonTheme(key: string, state: LetterState) {
    let keyboardClasses: string[] = [];
    if (this.keyboard.getButtonThemeClasses(key).length > 0) {
      keyboardClasses = this.keyboard.getButtonThemeClasses(key);
    }
    if (
      state === LetterState.correct ||
      (state === LetterState.present && !keyboardClasses.includes('correct')) ||
      (state === LetterState.incorrect &&
        !keyboardClasses.includes('correct') &&
        !keyboardClasses.includes('present'))
    ) {
      keyboardClasses.forEach((state) => {
        this.keyboard.removeButtonTheme(key, state);
      });
      this.keyboard.addButtonTheme(key, state);
    }
  }
}
