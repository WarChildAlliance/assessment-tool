import { GeneralQuestion, SelectOption, SortOption, DraggableOption, DominoOption } from './question.model';
import { QuestionSetAnswer } from './question-set-answer.model';
import { Moment } from 'moment';

export interface Answer {
  id?: number;
  question_set_answer?: QuestionSetAnswer | number;
  question: GeneralQuestion | number;
  start_datetime?: Moment | string;
  end_datetime?: Moment | string;
  valid?: boolean;
}

export interface AnswerInput extends Answer {
  value: string;
}

export interface AnswerNumberLine extends Answer {
  value: number;
}

export interface AnswerCalcul extends Answer {
  value: number;
}

export interface AnswerSEL extends Answer {
  statement: SELStatements;
}

export interface AnswerSelect extends Answer {
  selected_option: SelectOption | number;
}

export interface AnswerSort extends Answer {
  category_A: SortOption[] | number[];
  category_B: SortOption[] | number[];
}

export interface DragAndDropAreaEntry {
  selected_draggable_option: DraggableOption | number;
  area: number;
}

export interface AnswerDragAndDrop extends Answer {
  answers_per_area: DragAndDropAreaEntry[];
}

export interface AnswerDomino extends Answer {
  selected_domino: DominoOption | number;
}

export interface AnswerCustomizedDragAndDrop extends Answer {
  left_value: number;
  right_value: number;
  final_value: number;
}

export interface SkippedAnswer extends Answer {
  skipped: true;
}

export type GeneralAnswer = AnswerInput | AnswerNumberLine | AnswerSelect | AnswerSort | AnswerDragAndDrop
 | AnswerDomino | AnswerSEL | AnswerCalcul | AnswerCustomizedDragAndDrop |SkippedAnswer;

export enum SELStatements {
  'Not really like me' = 'NOT_REALLY',
  'A little like me' = 'A_LITTLE',
  'A lot like me' = 'A_LOT',
}

