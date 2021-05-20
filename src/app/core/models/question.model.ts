import { Attachment } from './attachment.model';

export interface Question {
  id: number;
  title: string;
  question_type: QuestionTypeEnum;
  hint: Hint;
  attachments: Attachment[];
}

export interface QuestionInput extends Question {
  valid_answer: string;
}

export interface QuestionNumberLine extends Question {
  expected_value: number;
  start: number;
  end: number;
  step: number;
  show_value: boolean;
  show_ticks: boolean;
}

export interface QuestionSelect extends Question {
  multiple: boolean;
  options: SelectOption[];
}

export interface QuestionSort extends Question {
  category_A: string;
  category_B: string;
  options: SortOption[];
}

export type GeneralQuestion = QuestionInput | QuestionNumberLine | QuestionSelect | QuestionSort;

export interface SelectOption {
  id: number;
  value: string;
  valid: boolean;
  attachments: Attachment[];
}

export interface SortOption {
  id: number;
  value: string;
  category: string;
  attachments: Attachment[];
}

enum QuestionTypeEnum {
  Input = 'INPUT',
  Select = 'SELECT',
  Sort = 'SORT',
  NumberLine = 'NUMBER_LINE'
}

export interface Hint {
  id: number;
  text: string;
  attachments: Attachment[];
}
