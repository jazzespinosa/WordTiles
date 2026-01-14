import { Component, DestroyRef, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, MatIconModule, CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})
export class SideNavComponent implements OnInit {
  activeLink: string = '';

  constructor(
    private appService: AppService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event: NavigationEnd) => {
        this.activeLink = event.urlAfterRedirects;
      });
  }
  closeSideNav() {
    this.appService.closeSideNav();
  }
}
