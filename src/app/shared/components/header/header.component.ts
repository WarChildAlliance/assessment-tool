import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';
import { GenericConfirmationDialogComponent } from '../generic-confirmation-dialog/generic-confirmation-dialog.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    /*
    this input sets the content of the header depending on the value
    the value refers to which page we are
    */
    @Input()
    headerConfig?: 'home' | 'profile';

    @Output()
    logout: EventEmitter<void> = new EventEmitter<void>();

   // @Input() style: 'smallsize' | 'fullsize' = 'smallsize';
    public user: User;
    public questionHeader = false;

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private userService: UserService,
        public translate: TranslateService,
    ) {
    }

    ngOnInit(): void {
/*         this.route.data.subscribe(
            (data: { user: User }) => this.user = data.user
        ); */
        this.userService.currentUser.subscribe(user => {
            this.user = user;
        });

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            if (event.url.includes('/questions/')) {
                this.questionHeader = true;
            } else {
                this.questionHeader = false;
            }
        });
    }

    public getImageUrl(): string {
        return this.user.profile.current_avatar?.image ?
            (environment.API_URL + this.user.profile.current_avatar.image) :
            'assets/avatars/award_120.svg';
    }

    public openConfirmationDialog(): void {
        this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                title: 'general.hi',
                content: 'general.info',
                confirmBtnText: 'general.OK',
                confirmBtnColor: 'primary',
            }
        });
    }
}
