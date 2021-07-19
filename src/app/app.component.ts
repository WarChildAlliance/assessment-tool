import { Component, HostListener } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    private router: Router,
    private swUpdate: SwUpdate,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.checkAppUpdates();
    this.registerIcons();
  }

  @HostListener('document:visibilitychange', ['$event'])
  @HostListener('window:beforeunload', ['$event'])
  async canDeactivate(event: Event): Promise<boolean | void> {
    if (event.type === 'visibilitychange') {
      if (document.hidden) {
        this.inactiveTimeout = setTimeout(
          () => {
            this.endSession().subscribe(
              _ => this.router.navigate([''])
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

  private checkAppUpdates(): void {
    this.swUpdate.available.subscribe(_ => {
      this.swUpdate.activateUpdate().then(() => document.location.reload());
    });
  }

  private registerIcons(): void {
    this.matIconRegistry.addSvgIcon(
      'volume_up',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/material-icons/volume_up.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'cancel',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/material-icons/cancel.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'arrow_back',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/material-icons/arrow_back.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'competency_star',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/material-icons/competency_star.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'competency_star_outline',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/material-icons/competency_star_outline.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'logout',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/material-icons/logout.svg')
    );
  }
}
