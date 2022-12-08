import { Moment } from 'moment';
import { AnswerSession } from './answer-session.model';
import { GeneralAnswer } from './answer.model';

export interface QuestionSetAnswer {
    id?: number;
    question_set_access?: number;
    question_set?: number;
    complete?: boolean;
    start_date: Moment | string;
    end_date: Moment | string;
    session?: AnswerSession | number;
    answers?: GeneralAnswer[];
    competency?: number;
}
