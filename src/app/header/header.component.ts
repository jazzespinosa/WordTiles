import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserModel } from '../auth/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sideNavMenuClicked = new EventEmitter<void>();
  @Output() titleClicked = new EventEmitter<void>();

  userName: string | null = '';
  subsUserName!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subsUserName = this.authService.user$.subscribe(
      (userModel) => (this.userName = userModel?.name ?? null),
    );
  }

  ngOnDestroy(): void {
    this.subsUserName.unsubscribe();
  }

  onSideNavMenuClick(event: Event) {
    event.stopPropagation();
    this.sideNavMenuClicked.emit();
  }

  onTitleClick() {
    this.titleClicked.emit();
  }
}
