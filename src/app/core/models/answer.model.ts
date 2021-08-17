import { GeneralQuestion, SelectOption, SortOption } from './question.model';
import { TopicAnswer } from './topic-answer.model';
import { Moment } from 'moment';

export interface Answer {
  id?: number;
  topic_answer?: TopicAnswer | number;
  question: GeneralQuestion | number;
  start_datetime?: Moment | string;
  end_datetime?: Moment | string;
  valid: boolean;
}

export interface AnswerInput extends Answer {
  value: string;
}

export interface AnswerNumberLine extends Answer {
  value: number;
}

export interface AnswerSelect extends Answer {
  selected_options: SelectOption[] | number[];
}

export interface AnswerSort extends Answer {
  category_A: SortOption[] | number[];
  category_B: SortOption[] | number[];
}

export interface SkippedAnswer extends Answer {
  skipped: true;
}

export type GeneralAnswer = AnswerInput | AnswerNumberLine | AnswerSelect | AnswerSort | SkippedAnswer;
