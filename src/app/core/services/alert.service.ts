import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private snackbar: MatSnackBar, private translate: TranslateService) { }

  public error(message: string, action?: string): void {
    return this.open(message, this.errorConfig, action);
  }

  private open(message: string = 'Unknown username. Contact your teacher in case you forgot your code',
               config: MatSnackBarConfig, action?: string): void {
    if (action) {
      config.duration = undefined;
    }
    this.translate.get('unknownUser').subscribe((res) => {
      this.snackbar.open(res, action, config);
    });
  }
}
