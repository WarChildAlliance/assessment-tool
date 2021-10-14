import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '../core/services/cache.service';
import { GenericConfirmationDialogComponent } from '../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

    authForm = new FormGroup({
        code: new FormControl(null, [Validators.required, Validators.pattern(/\d{6,}/)])
    });

    constructor(
        private authService: AuthService,
        public translate: TranslateService,
        private cacheService: CacheService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        if (!this.cacheService.networkStatus.getValue()){
            this.showOfflineModal();
        }
    }

    showOfflineModal(): void {
        const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            data: {
              title: 'Login not possible',
              content: 'You need to have an internet connection in order to login.',
              cancelBtn: false,
              confirmBtnText: 'Close',
              confirmBtnColor: 'warn',
            }
          });
    }

    onSubmit(): void {
        if (!this.cacheService.networkStatus.getValue()){
            this.showOfflineModal();
        } else {
            const code = this.authForm.get('code').value;
            this.authService.login(code);
        }
    }

}
