import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { AuthService } from './auth/auth.service';

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
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => console.log('user', user));
  }

  @ViewChild('sidenav') sidenav!: MatSidenav;

  toggleSideNav() {
    this.sidenav.toggle();
  }

  closeSideNav() {
    if (this.sidenav.opened) {
      this.sidenav.close();
    }
  }
}
