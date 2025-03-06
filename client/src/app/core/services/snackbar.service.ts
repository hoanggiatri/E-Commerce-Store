import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private snackbar = inject(MatSnackBar);

  error(message: string): void {
    this.snackbar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snack-error'],
    });
  }

  success(message: string): void {
    this.snackbar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snack-success'],
    });
  }
}
