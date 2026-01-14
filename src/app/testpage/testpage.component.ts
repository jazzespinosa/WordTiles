import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewContainerRef,
} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import bootstrap from 'bootstrap';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarHorizontalPosition,
  MatSnackBarLabel,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SnackbarComponent } from '../shared/snackbar/snackbar.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-testpage',
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './testpage.component.html',
  styleUrl: './testpage.component.css',
})
export class TestpageComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.viewContainerRef = this.viewContainerRef;
  }

  // private _snackBar = inject(MatSnackBar);

  // durationInSeconds = 5;

  // openSnackBar() {
  //   this._snackBar.openFromComponent(SnackbarComponent, {
  //     duration: this.durationInSeconds * 1000,
  //   });
  // }

  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  openSnackBar() {
    this._snackBar.open('Oops! That is not a valid word.', 'OK', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 1000,
      panelClass: ['custom-snackbar', 'translate-middle-x'],
    });
  }
}
