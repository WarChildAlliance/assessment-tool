import { Attachment } from './attachment.model';
import { GeneralQuestion } from './question.model';

export interface Topic {
  id: number;
  name: string;
  order: number;
  description?: string;
  attachments?: Attachment[];
  questions?: GeneralQuestion[];
  competency?: any;
  show_feedback?: number;
  praise: number;
  allow_skip?: boolean;
  evaluated?: boolean;
  max_wrong_answers: number;
  icon: string;
  ribbon?: string;
  completed?: boolean;
}
