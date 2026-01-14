import { Component, DestroyRef, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { AppService } from './app.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    CommonModule,
    SideNavComponent,
    MatSidenavModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isSideNavOpen = false;

  constructor(
    private appService: AppService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.appService.isSideNavOpen$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.isSideNavOpen = value;
      });
  }

  toggleSideNav() {
    this.appService.toggleSideNav();
  }

  closeSideNav() {
    this.appService.closeSideNav();
  }
}
