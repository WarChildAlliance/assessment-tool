import { Attachment } from './attachment.model';
import { GeneralQuestion } from './question.model';

export interface QuestionSet {
  id: number;
  name: string;
  order: number;
  assessment: number;
  description?: string;
  attachments?: Attachment[];
  questions?: GeneralQuestion[];
  competency?: any;
  evaluated?: boolean;
  has_sel_question?: boolean;
  icon: string;
  honeypots?: number;
  completed?: boolean;
  can_start?: boolean;
}
