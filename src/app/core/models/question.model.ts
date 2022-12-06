import { Attachment } from './attachment.model';

export interface Question {
  id: number;
  title: string;
  title_audio: string;
  order: number;
  question_type: QuestionTypeEnum;
  hint: Hint;
  attachments: Attachment[];
}

export interface QuestionInput extends Question {
  valid_answer: string;
}

export interface QuestionSEL extends Question {
  sel_type: string;
}

export interface QuestionNumberLine extends Question {
  expected_value: number;
  start: number;
  end: number;
  step: number;
  shuffle: boolean;
}

export interface QuestionCalcul extends Question {
  first_value: number;
  second_value: number;
  operator: string;
}

export interface QuestionSelect extends Question {
  options: SelectOption[];
  // display_type: 'grid' | 'horizontal' | 'vertical';
}

export interface QuestionDomino extends Question {
  expected_value: number;
  options: DominoOption[];
}

export interface QuestionSort extends Question {
  category_A: string;
  category_B: string;
  options: SortOption[];
}

export interface QuestionDragDrop extends Question {
  drop_areas: DropArea[];
  draggable_options: DraggableOption[];
}

export interface QuestionCustomizedDragAndDrop extends Question {
  first_value: number;
  first_style: string;
  second_value: number;
  second_style: string;
  operator: string;
  shape: string;
}

export type GeneralQuestion = QuestionInput | QuestionNumberLine | QuestionSelect | QuestionSort | QuestionDragDrop
 | QuestionDomino | QuestionSEL | QuestionCalcul | QuestionCustomizedDragAndDrop;

export interface SelectOption {
  id: number;
  title: string;
  valid: boolean;
  attachments: Attachment[];
}

export interface DominoOption {
  id: number;
  left_side_value: number;
  right_side_value: number;
  valid: boolean;
}

export interface SortOption {
  id: number;
  title: string;
  category: string;
  attachments: Attachment[];
}

export interface DraggableOption {
  id: number;
  area_option: number;
  attachments: Attachment[];
}

export enum QuestionTypeEnum {
  SEL = 'SEL',
  Input = 'INPUT',
  Select = 'SELECT',
  Sort = 'SORT',
  NumberLine = 'NUMBER_LINE',
  DragAndDrop = 'DRAG_AND_DROP',
  CustomizedDragAndDrop = 'CUSTOMIZED_DRAG_AND_DROP',
  Domino = 'DOMINO',
  Calcul = 'CALCUL'
}

export interface Hint {
  id: number;
  text: string;
  attachments: Attachment[];
}

export interface DropArea {
  id: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
}
