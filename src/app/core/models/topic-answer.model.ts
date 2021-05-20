import { Moment } from 'moment';
import { AnswerSession } from './answer-session.model';
import { GeneralAnswer } from './answer.model';

export interface TopicAnswer {
    id?: number;
    topic_access?: number;
    topic?: number;
    complete?: boolean;
    start_date: Moment | string;
    end_date: Moment | string;
    session?: AnswerSession | number;
    answers?: GeneralAnswer[];
}
