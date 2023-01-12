import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { first, catchError } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';
import { once } from 'events';

@Component({
  selector: 'app-question-set-intro',
  templateUrl: './question-set-intro.component.html',
  styleUrls: ['./question-set-intro.component.scss']
})
export class QuestionSetIntroComponent implements OnInit {

  private quoteAudio = {
    MATH: {
      eng: 'assets/audios/from-text/subject-intro-maths_eng.mp3',
      fre: 'assets/audios/from-text/subject-intro-maths_fre.mp3',
      ara: 'assets/audios/from-text/subject-intro-maths_ara.mp3'
    }, LITERACY: {
      eng: 'assets/audios/from-text/subject-intro-literacy_eng.mp3',
      fre: 'assets/audios/from-text/subject-intro-literacy_fre.mp3',
      ara: 'assets/audios/from-text/subject-intro-literacy_ara.mp3'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const assessmentId = parseInt(params.get('assessment_id'), 10);
      const subject = params.get('subject');
      const questionId = params.get('question_id');
      const audioSrcs = this.quoteAudio[subject] ?? null;

      if (!audioSrcs) { this.navigateToQuestion(questionId); }
      this.userService.currentUser.pipe(first()).subscribe(async (user: User) => {
        const currentLang = user.language.code.toLowerCase();
        await this.playAudio(audioSrcs[currentLang], 2000);
        this.registerAssessmentIntroShown(user, assessmentId).pipe(
          catchError(() => {
            this.navigateToQuestion(questionId);
            return EMPTY;
          })
        ).subscribe(() => this.navigateToQuestion(questionId));
      });
    });
  }

  private registerAssessmentIntroShown(user: User, assessmentId: number): Observable<User> {
    const introsShown = user.skip_intro_for_assessments ?? [];
    introsShown.push(assessmentId);
    user.skip_intro_for_assessments = introsShown;
    this.userService.updateUser(user);
    return this.userService.updateUserNoCache({ id: user.id, skip_intro_for_assessments: introsShown });
  }

  private navigateToQuestion(questionId: string): void {
    this.router.navigate(['questions', questionId], { relativeTo: this.route.parent });
  }

  private timeout(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async playAudio(audioSrc: string, msFallbackTimeout: number): Promise<void> {
    if (!audioSrc) {
      await this.timeout(msFallbackTimeout);
      return;
    }
    const audio = new Audio(audioSrc);
    audio.load();
    audio.play();
    await once(audio, 'ended');
  }
}
