import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '../core/services/cache.service';
import { GenericConfirmationDialogComponent } from '../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { LoginCodeRegex } from '../constants/regex.constant';


@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

    public authForm = new FormGroup({
        code: new FormControl(null, [Validators.required, Validators.pattern(LoginCodeRegex)])
    });

    public deferredPrompt;

    constructor(
        private authService: AuthService,
        public translate: TranslateService,
        private cacheService: CacheService,
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        window.addEventListener('beforeinstallprompt', (e) => {
            this.deferredPrompt = e;
            console.log('this def = ', this.deferredPrompt);
        });
        if (!this.cacheService.networkStatus.getValue()){
            this.showOfflineModal();
        }
        this.handleAutoLogin();
    }

    public onSubmit(): void {
        if (!this.cacheService.networkStatus.getValue()){
            this.showOfflineModal();
        } else {
            const code = this.authForm.get('code').value;
            this.authService.login(code);
        }
    }

    public downloadPWA(): void {
        if (this.deferredPrompt !== null) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((outcome: any) => {
                if (outcome === 'accepted') {
                    this.deferredPrompt = null;
                }
            });
        }
    }

    private handleAutoLogin(): void {
        this.activatedRoute.queryParams.pipe(
            map(({code}) => code),
            filter(Boolean)
        ).subscribe(code => {
            this.authForm.patchValue({ code });
            this.onSubmit();
        });
    }

    private showOfflineModal(): void {
        const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            data: {
              title: 'auth.loginNotPossible',
              content: 'auth.noInternetConnection',
              cancelBtn: false,
              confirmBtnText: 'general.close',
              confirmBtnColor: 'warn',
            }
          });
    }
}
