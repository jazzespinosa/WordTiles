import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly isSideNavOpenSubject = new BehaviorSubject<boolean>(false);
  readonly isSideNavOpen$ = this.isSideNavOpenSubject.asObservable();
  toggleSideNav() {
    this.isSideNavOpenSubject.next(!this.isSideNavOpenSubject.value);
  }
  closeSideNav() {
    this.isSideNavOpenSubject.next(false);
  }
}
