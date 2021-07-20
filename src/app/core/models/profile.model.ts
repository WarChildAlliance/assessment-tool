import { Avatar } from './avatar.model';

export interface Profile {
    id: number;
    student: number;
    effort: number;
    total_competency: number;
    current_avatar: Avatar;
    unlocked_avatars: Avatar[];
}
