import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../core/models/user.model';
import { AnswerService } from '../core/services/answer.service';
import { AssessmentService } from '../core/services/assessment.service';
import { AuthService } from '../core/services/auth.service';
import { CacheService } from '../core/services/cache.service';
import { ProfileService } from '../core/services/profile.service';
import { UserService } from '../core/services/user.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { TutorialService } from '../core/services/tutorial.service';
import { GenericConfirmationDialogComponent } from '../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public user: User;
    public loading = true;
    public competencies = [];

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        private answerService: AnswerService,
        private assessmentService: AssessmentService,
        private authService: AuthService,
        private cacheService: CacheService,
        private userService: UserService,
        private profileService: ProfileService,
        public translate: TranslateService,
        private tutorialService: TutorialService
    ) { }

    ngOnInit(): void {
        const audio = new Audio('/assets/audios/Lit123[22]ambience_garden_loop.mp3');
        audio.load();
        audio.loop = true;

        // Prompt for permissions: to autoplay background sound in the home page
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((stream) => {
                audio.play();
            });

        this.userService.currentUser.subscribe( activeUser => {
            this.user = activeUser;
        });

        this.tutorialService.createAllTours();

        this.cacheService.hasActiveSession().pipe(
            switchMap((hasActiveSession: boolean) => {
                if (!hasActiveSession) {
                    return this.answerService.startSession();
                }
                return EMPTY;
            })
        ).subscribe();

        this.assessmentService.loadAllAssessments();

        this.profileService.getAvatarsList().subscribe(avatars => {
            for (const avatar of avatars) {
                this.http.get(`${environment.API_URL}` + avatar.image, { responseType: 'arraybuffer' }).subscribe();
            }
        });
    }

    public logout(): void {
        const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: false,
            data: {
                content: 'auth.logoutPrompt',
                cancelBtn: true,
                cancelBtnText: 'general.no',
                confirmBtnText: 'general.yes',
                confirmBtnColor: 'warn',
            }
        });
        dialogRef.afterClosed().subscribe((value) => {
            if (value) {
                this.userService.resetUser();
                this.authService.logout();
            }
        });
    }
}
