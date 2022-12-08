import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { AnswerSession } from './core/models/answer-session.model';
import { AnswerService } from './core/services/answer.service';
import { TranslateService } from '@ngx-translate/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public serviceWorkerHasUpdate = false;

  private inactiveTimeout;

  constructor(
    private answerService: AnswerService,
    private router: Router,
    private swUpdate: SwUpdate,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private titleService: Title,
    public translate: TranslateService,
  ) {
    this.checkAppUpdates();
    this.registerIcons();
    this.translate.get('general.assessmentTool').subscribe((translated) => {
      this.titleService.setTitle(translated);
    });
  }


  @HostListener('document:visibilitychange', ['$event'])
  @HostListener('window:beforeunload', ['$event'])

  ngOnInit(): void {
    // check service worker for updates
    if (this.swUpdate.isEnabled) {
      interval(60000).subscribe(() => this.swUpdate.checkForUpdate().then(() => {
        // checking for updates
      }));
    }
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map(evt => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      }))).subscribe(() => {
        this.serviceWorkerHasUpdate = true;
        location.reload();
      });
  }

  canDeactivate(event: Event): boolean | void {
    if (event.type === 'visibilitychange') {
      if (document.hidden) {
        this.inactiveTimeout = setTimeout(
          () => {
            this.endSession().subscribe(
              _ => this.router.navigate([''])
            );
          },
          1000 * 60 * 20
        );
      } else if (this.inactiveTimeout) {
        clearTimeout(this.inactiveTimeout);
        this.inactiveTimeout = null;
      }
    } else {
      this.endSession().toPromise();
      return false;
    }
  }

  private endSession(): Observable<AnswerSession> {
    return this.answerService.endQuestionSetAnswer().pipe(
      switchMap(_ => this.answerService.endSession())
    );
  }

  private checkAppUpdates(): void {
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map(evt => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      }))).subscribe(_ => {
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
