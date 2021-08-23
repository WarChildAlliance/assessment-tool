import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private snackConfig: MatSnackBarConfig = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 5000
  };

  private errorConfig: MatSnackBarConfig = {
    ...this.snackConfig,
    panelClass: 'snackbar-error',
  };

  constructor(private snackbar: MatSnackBar) { }

  public error(message: string, action?: string): void {
    return this.open(message, this.errorConfig, action);
  }

  private open(message: string = 'Unknown username. Contact your teacher in case you forgot your code',
               config: MatSnackBarConfig, action?: string): void {
    if (action) {
      config.duration = undefined;
    }
    this.snackbar.open(message, action, config);
  }
}
