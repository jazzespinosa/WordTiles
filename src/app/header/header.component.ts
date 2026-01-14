import {
  Component,
  DestroyRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserModel } from '../auth/auth.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppService } from '../app.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  userData: UserModel | null = null;
  isLoading: boolean = false;
  isViewPortSmall: boolean = false;

  constructor(
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private appService: AppService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((userModel) => {
        this.userData = userModel;
      });

    if (window.innerWidth < 440) this.isViewPortSmall = true;
    else this.isViewPortSmall = false;
  }

  onLogin() {
    this.router.navigate(['/auth']);
    this.appService.closeSideNav();
  }

  onLogout(event: Event) {
    event.stopPropagation();
    this.isLoading = true;
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/auth']);
      this.isLoading = false;
    }, 1000);
    this.appService.closeSideNav();
  }

  onSideNavMenuClick() {
    this.appService.toggleSideNav();
  }

  onTitleClick() {
    this.appService.closeSideNav();
  }
}
