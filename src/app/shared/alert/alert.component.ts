import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input({ required: true }) type!: 'warning' | 'error';
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Output() cancel = new EventEmitter<void>();

  onCancel() {
    this.cancel.emit();
  }

  get alertIcon() {
    return this.type === 'warning'
      ? 'bi bi-exclamation-circle-fill'
      : 'bi bi-exclamation-octagon-fill';
  }

  get alertType() {
    return this.type === 'warning' ? 'warning' : 'error';
  }
}
