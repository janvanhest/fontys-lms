export const STATUS_COLORS = {
  open:        '#1976d2', // blue
  bezig:       '#ed6c02', // orange
  feedback:    '#d32f2f', // red
  afgerond:    '#2e7d32', // green
};

export const STATUS_LABELS = {
  open:        'Open',
  bezig:       'Wordt aangewerkt',
  feedback:    'Feedback',
  afgerond:    'Afgerond',
};

export const STATUSES = Object.keys(STATUS_COLORS);

export const ACTIVITY_TYPES = [
  'Coaching',
  'Workshop',
  'Sprint review',
  'Semesterplan',
  'Posterpresentatie',
  'Overdracht',
];
