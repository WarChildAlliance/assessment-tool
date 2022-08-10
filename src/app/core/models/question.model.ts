import { Attachment } from './attachment.model';

export interface Question {
  id: number;
  title: string;
  order: number;
  question_type: QuestionTypeEnum;
  hint: Hint;
  attachments: Attachment[];
  on_popup: boolean;
}

export interface QuestionInput extends Question {
  valid_answer: string;
}

export interface QuestionNumberLine extends Question {
  expected_value: number;
  start: number;
  end: number;
  step: number;
  tick_step: number;
  show_value: boolean;
  show_ticks: boolean;
}

export interface QuestionSelect extends Question {
  multiple: boolean;
  options: SelectOption[];
  // display_type: 'grid' | 'horizontal' | 'vertical';
}

export interface QuestionSort extends Question {
  category_A: string;
  category_B: string;
  options: SortOption[];
}

export type GeneralQuestion = QuestionInput | QuestionNumberLine | QuestionSelect | QuestionSort;

export interface SelectOption {
  id: number;
  title: string;
  valid: boolean;
  attachments: Attachment[];
}

export interface SortOption {
  id: number;
  title: string;
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
