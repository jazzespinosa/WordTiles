import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-to-play',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './how-to-play.component.html',
  styleUrl: './how-to-play.component.css',
})
export class HowToPlayComponent {
  // Example tiles for the CRANE guess (secret word is TRAIN)
  exampleTiles = [
    { letter: 'C', state: 'incorrect' }, // C is not in TRAIN
    { letter: 'R', state: 'correct' }, // R is in correct position
    { letter: 'A', state: 'correct' }, // A is in correct position
    { letter: 'N', state: 'present' }, // N is in TRAIN but in the wrong position
    { letter: 'E', state: 'incorrect' }, // E is not in TRAIN
  ];
}
