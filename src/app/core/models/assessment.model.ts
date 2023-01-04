import { QuestionSet } from './question-set.models';

export interface Assessment {
  id: number;
  title: string;
  grade: number;
  subject: SubjectEnum;
  language?: string;
  country?: string;
  private: boolean;
  question_sets?: QuestionSet[];
  icon?: string;
  complete_question_sets?: number;
  // THIS IS ONLY TEMPORARY FOR PRE-SEL AND POST-SEL, TODO REMOVE AFTERWARD
  locked?: boolean;
  all_question_sets_complete?: boolean;
  // END OF TEMPORARY
}

enum SubjectEnum {

  // THIS IS ONLY TEMPORARY FOR PRE-SEL AND POST-SEL, TODO REMOVE AFTERWARD
  PreSel = 'PRESEL',
  PostSel = 'POSTSEL',
  // END OF TEMPORARY
  Math = 'MATH',
  Literacy = 'LITERACY',
  Tutorial = 'TUTORIAL'
}
