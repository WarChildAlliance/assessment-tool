import { Moment } from 'moment';
import { TopicAnswer } from './topic-answer.model';
import { User } from './user.model';

export interface AnswerSession {
    id?: number;
    start_date: Moment;
    end_date: Moment;
    student: User | number;
    assessment_topic_answers?: TopicAnswer[];
}
