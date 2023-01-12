import { Moment } from 'moment';
import { QuestionSetAnswer } from './question-set-answer.model';
import { User } from './user.model';

export interface AnswerSession {
    id?: number;
    start_date: Moment | string;
    end_date: Moment | string;
    student: User | number;
    assessment_question_set_answers?: QuestionSetAnswer[];
    question_set_competency?: number;
}
