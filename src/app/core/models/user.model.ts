import { Moment } from 'moment';
import { Language } from './language.model';
import { Profile } from './profile.model';
import { Avatar } from '../models/avatar.model';

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
  see_intro: Boolean;
}

export enum UserRoles {
  Supervisor = 'SUPERVISOR',
  Student = 'STUDENT'
}
