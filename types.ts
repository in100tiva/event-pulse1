export interface Event {
  id: string;
  title: string;
  date: string;
  status: 'Live' | 'Published' | 'Ended' | 'Draft';
  rsvps: number;
  suggestions: number;
  polls: number;
  image: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  status: 'Confirmed' | 'Maybe' | 'Declined';
  checkedIn: boolean;
}

export interface Suggestion {
  id: string;
  text: string;
  author: string;
  votes: number;
  answered: boolean;
}

export interface PollOption {
  label: string;
  percentage: number;
}
