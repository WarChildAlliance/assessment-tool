import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { environment } from 'src/environments/environment';
import { GenericConfirmationDialogComponent } from '../generic-confirmation-dialog/generic-confirmation-dialog.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public user: User;

    /*
       this input sets the content of the header depending on the value
       the value refers to which page we are
     */
    @Input()
    headerConfig?: 'home' | 'profile';

    @Output()
    logout: EventEmitter<void> = new EventEmitter<void>();

    // @Input() style: 'smallsize' | 'fullsize' = 'smallsize';

    constructor(
        private route: ActivatedRoute,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.route.data.subscribe(
            (data: { user: User }) => this.user = data.user
        );
    }

    getImageUrl(): string {
        return this.user.profile.current_avatar?.image ?
            (environment.API_URL + this.user.profile.current_avatar.image) :
            'assets/avatars/award_120.svg';
    }

    openDialog(): void {
        this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            autoFocus: true,
            data: {
                title: 'hi',
                content: 'info',
                confirmBtnText: 'OK',
                confirmBtnColor: 'primary',
            }
        });
    }
}
