import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lighten } from 'polished';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';
import { environment } from 'src/environments/environment';
import { FeedbackAudio } from '../../topic/components/audio-feedback/audio-feedback.dictionary';

@Component({
  selector: 'app-flower',
  templateUrl: './flower.component.html',
  styleUrls: ['./flower.component.scss'],
})
export class FlowerComponent implements OnInit {
  @Input() topic: Topic;
  @Input() index: number;
  @Input() flowerColor: string;
  public flowerColorLighter: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService
  ) {}

  ngOnInit(): void {
    this.flowerColorLighter = lighten(0.25, this.flowerColor);
  }

  public playLockedTopicAudioFeedback(topicIndex: number): void {
    const topicElement = document.getElementById(
      'topic-' + topicIndex.toString()
    ) as HTMLElement;
    topicElement.classList.add('vibration');
    setTimeout(() => {
      topicElement.classList.remove('vibration');
    }, 500);
    // TODO: change to angry bee sound when available
    const sound = FeedbackAudio.wrongAnswer[0];
    const audio = new Audio(sound);
    audio.load();
    audio.play();
  }

  public getTopicIcon(): string {
    return this.topic.icon
      ? environment.API_URL + this.topic.icon
      : 'assets/yellow_circle.svg';
  }

  public async startTopic(): Promise<void> {
    if (this.topic.has_sel_question && (await this.isNotFirstTry())) {
      // If has SEL questions and isn't the student first try: filter questions to remove SEL questions
      this.topic.questions = this.topic.questions?.filter(
        (question) => question.question_type !== 'SEL'
      );
    }

    const questionId = this.topic.questions[0].id;
    this.answerService.startTopicAnswer(this.topic.id).subscribe();
    this.router.navigate(['topics', this.topic.id, 'questions', questionId], {
      relativeTo: this.route,
    });
  }

  private async isNotFirstTry(): Promise<boolean> {
    const answers = await this.answerService
      .getCompleteStudentAnswersForTopic(this.topic.id)
      .toPromise();
    return answers.length > 0;
  }
}
