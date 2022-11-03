import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AnswerService } from 'src/app/core/services/answer.service';
import { AssessmentService } from 'src/app/core/services/assessment.service';

interface DialogData {
  steps: any;
}

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.scss']
})

export class TutorialDialogComponent implements OnInit {

  public title ? = '';
  public content ? = '';
  public imageURL = '';
  public audioURL = '';
  public index = 0;
  public steps: any[] =  null;

  private audio: HTMLAudioElement;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public translate: TranslateService,
    private assessmentService: AssessmentService,
    private router: Router,
    private answerService: AnswerService) {
      if (data.steps) {
        this.steps = data.steps;
      }
  }

  ngOnInit(): void {
    this.playAudio();
  }

  public getImage(): string{
    return 'assets/tutorial/images/' + this.steps[this.index].pictureURL;
  }

  public onNextStep(): void {
    this.index += 1;
    this.stopAudio();
    this.playAudio();
  }

  public onPreviousStep(): void {
    if (this.index > 1) {
      this.index -= 1;
    } else {
      this.index = 0;
    }
    this.stopAudio();
    this.playAudio();
  }

  public closeTutorial(): void {
    this.audio.pause();
    this.redirect();
  }

  private getAudio(): string{
    return 'assets/tutorial/audio/' + this.steps[this.index].audioURL;
  }

  private playAudio(): void {
    this.audio = new Audio(this.getAudio());
    this.audio.play();
  }

  private stopAudio(): void{
    this.audio.pause();
  }

  private redirect(): void{
    const redirect = this.steps[this.index].redirect ? this.steps[this.index].redirect : null;
    if (redirect) {
      this.assessmentService.getTutorial().subscribe( tutorial => {
        let url = '/';
        if (tutorial){
          if (redirect[0] === 'assessment') {
            url = url + 'assessments' + '/' + tutorial.title + '/' + tutorial.id;
          } else if (redirect[0] === 'topic') {
            const topic = tutorial.topics[redirect[1]];
            this.answerService.startTopicAnswer(topic.id);
            url = url + 'assessments' + '/' + tutorial.title + '/' + tutorial.id + '/' + 'topics' +
            '/' + topic.id + '/' + 'questions' + '/' + topic.questions[0].id;
          } else {
            url = url + redirect[0];
          }
          this.router.navigate([url]);
        }
      });
    }
  }
}
