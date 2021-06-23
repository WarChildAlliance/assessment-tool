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
}
