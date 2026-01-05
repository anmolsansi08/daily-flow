export type Priority = 'none' | 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed' | 'archived';
export type OccurrenceState = 'pending' | 'completed' | 'skipped';
export type ReminderType = 'at-time' | 'offset-before';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  offsetMinutes: number; // 0 = at-time, positive = minutes before
  enabled: boolean;
}

export interface RepeatRule {
  frequency: 'weekly';
  weekdays: Weekday[];
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  timeOfDay: { hour: number; minute: number } | null; // null for all-day
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  allDay: boolean;
  priority: Priority;
  tags: string[];
  subtasks: Subtask[];
  status: TaskStatus;
  
  // Scheduling
  scheduleType: 'one-time' | 'repeating';
  dueDateTime: string | null; // ISO datetime for one-time tasks
  repeatRule: RepeatRule | null;
  
  // Reminders
  reminders: Reminder[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Occurrence {
  id: string;
  taskId: string;
  occurrenceDateTime: string; // ISO datetime
  state: OccurrenceState;
  snoozedUntil: string | null;
  completedAt: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  passcode: string | null;
  biometricEnabled: boolean;
}
