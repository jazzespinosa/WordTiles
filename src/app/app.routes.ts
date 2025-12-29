import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { TestpageComponent } from './testpage/testpage.component';
import { AboutComponent } from './about/about.component';
import { AuthComponent } from './auth/auth.component';
import { authGuard, loginGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'play', component: GameComponent, canActivate: [authGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'auth', component: AuthComponent, canActivate: [loginGuard] },
  { path: 'test', component: TestpageComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }, // create a 404 page
];
