import { HttpClient, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, from, Observable } from 'rxjs';
import { switchMap} from 'rxjs/operators';
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


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    user: User;
    loading = true;
    competencies = [];

    constructor(
        private route: ActivatedRoute,
        private answerService: AnswerService,
        private assessmentService: AssessmentService,
        private authService: AuthService,
        private http: HttpClient,
        private cacheService: CacheService,
        private userService: UserService,
        private profileService: ProfileService,
        public translate: TranslateService,
        private tutorialService: TutorialService
    ) { }

    ngOnInit(): void {

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

/*         this.cacheService.networkStatus.subscribe((online: boolean) => {
            console.log("network status", online)
            if (online) {
                this.sendStoredMutations();
            }
        });  */


        this.assessmentService.loadAllAssessments();

        this.profileService.getAvatarsList().subscribe(avatars => {
            for (const avatar of avatars) {
                this.http.get(`${environment.API_URL}` + avatar.image, { responseType: 'arraybuffer' }).subscribe();
            }
        });
    }

    /* // Send all the stored requests from the IndexedDb
    // Why is this done here and not directly in the cacheService ?
    private sendStoredMutations(): void {
        from(this.cacheService.getRequests()).subscribe((requests: { key: number, value: HttpRequest<unknown> }[]) => {
            for (const request of requests) {
                let requestToSend: Observable<any> = null;
                if (request.value.method === 'POST') {
                    requestToSend = this.http.post(request.value.urlWithParams, request.value.body);
                } else if (request.value.method === 'PUT') {
                    requestToSend = this.http.put(request.value.urlWithParams, request.value.body);
                } else if (request.value.method === 'DELETE') {
                    requestToSend = this.http.delete(request.value.urlWithParams);
                }

                if (requestToSend) {
                    requestToSend.subscribe((_) => {
                        this.cacheService.deleteRequest(request.key);
                    });
                }
            }
        });
    } */

    logout(): void {
        this.userService.resetUser();
        this.authService.logout();
    }

}
