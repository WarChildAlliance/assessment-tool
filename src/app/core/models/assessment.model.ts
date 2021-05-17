import { Topic } from './topic.models';

export interface Assessment {
  id: number;
  title: string;
  grade: number;
  subject: SubjectEnum;
  language?: string;
  country?: string;
  private: boolean;
  topics?: Topic[];
  show_feedback?: number;
}

enum SubjectEnum {
  Math = 'MATH',
  Literacy = 'LITERACY'
}
