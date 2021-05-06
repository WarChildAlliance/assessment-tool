import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AnswerSession } from './core/models/answer-session.model';
import { AnswerService } from './core/services/answer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private inactiveTimeout;

  constructor(
    private answerService: AnswerService,
    private router: Router
  ) { }

  @HostListener('document:visibilitychange', ['$event'])
  @HostListener('window:beforeunload', ['$event'])
  async canDeactivate(event: Event): Promise<boolean | void> {
    if (event.type === 'visibilitychange') {
      if (document.hidden) {
        this.inactiveTimeout = setTimeout(
          () => {
            this.endSession().subscribe(
              _ =>  this.router.navigate([''])
            );
          },
          1000 * 60 * 5
        );
      } else if (this.inactiveTimeout) {
        clearTimeout(this.inactiveTimeout);
        this.inactiveTimeout = null;
      }
    } else {
      await this.endSession().toPromise();
      return false;
    }
  }

  private endSession(): Observable<AnswerSession> {
    return this.answerService.endTopicAnswer().pipe(
      switchMap(_ => this.answerService.endSession())
    );
  }
}
