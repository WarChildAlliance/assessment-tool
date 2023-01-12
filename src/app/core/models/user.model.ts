import { Moment } from 'moment';
import { Avatar } from './avatar.model';
import { Language } from './language.model';
import { Profile } from './profile.model';

export interface User {
  id: number;
  username?: string;
  first_name: string;
  last_name: string;
  email?: string;
  last_login?: Moment;
  role?: UserRoles;
  language?: Language;
  country?: string;
  created_by?: number;
  profile?: Profile;
  avatars?: Avatar[];
  see_intro: boolean;
  skip_intro_for_assessments?: number[];
  grade?: string;
}

export enum UserRoles {
  Supervisor = 'SUPERVISOR',
  Student = 'STUDENT'
}
