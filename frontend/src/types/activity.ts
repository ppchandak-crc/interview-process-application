export const ActivityStatusEnum = {
  DRAFT: 'Draft',
  REGISTRATION_OPEN: 'Registration Open',
  REGISTRATION_CLOSED: 'Registration Closed',
  INTERVIEW: 'Interview',
  COMPLETED: 'Completed',
} as const;

export type ActivityStatus = typeof ActivityStatusEnum[keyof typeof ActivityStatusEnum];

export interface Activity {
  id: number;
  name: string;
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  required_participants: number;
  maximum_registrations: number;
  minimum_age: number;
  safety_shoes_required: boolean;
  registration_opening_date: string;
  registration_closing_date: string;
  introductory_paragraph?: string;
  status: ActivityStatus;
  form_schema?: any;
}

export type ActivityCreate = Omit<Activity, 'id'>;
