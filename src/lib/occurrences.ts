import { v4 as uuidv4 } from 'uuid';
import type { Task, Occurrence, Weekday } from '@/types/task';
import { saveOccurrence, deleteOccurrencesByTask, getOccurrencesByTask } from './db';

const WEEKDAY_MAP: Record<Weekday, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function getWeekdayFromDate(date: Date): Weekday {
  const day = date.getDay();
  const map: Record<number, Weekday> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };
  return map[day];
}

export function generateOccurrenceDates(task: Task, rangeStart: Date, rangeEnd: Date): Date[] {
  const dates: Date[] = [];

  if (task.scheduleType === 'one-time' && task.dueDateTime) {
    const dueDate = new Date(task.dueDateTime);
    if (dueDate >= rangeStart && dueDate <= rangeEnd) {
      dates.push(dueDate);
    }
    return dates;
  }

  if (task.scheduleType === 'repeating' && task.repeatRule) {
    const { weekdays, startDate, endDate, timeOfDay } = task.repeatRule;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Adjust range to rule bounds
    const effectiveStart = rangeStart > start ? rangeStart : start;
    const effectiveEnd = rangeEnd < end ? rangeEnd : end;

    const current = new Date(effectiveStart);
    current.setHours(0, 0, 0, 0);

    while (current <= effectiveEnd) {
      const weekday = getWeekdayFromDate(current);
      
      if (weekdays.includes(weekday)) {
        const occDate = new Date(current);
        if (timeOfDay) {
          occDate.setHours(timeOfDay.hour, timeOfDay.minute, 0, 0);
        }
        dates.push(occDate);
      }

      current.setDate(current.getDate() + 1);
    }
  }

  return dates;
}

export async function generateOccurrencesForTask(task: Task, windowDays: number = 60): Promise<Occurrence[]> {
  // Get existing occurrences to preserve completion state
  const existingOccurrences = await getOccurrencesByTask(task.id);
  const existingByDateTime = new Map(
    existingOccurrences.map(occ => [occ.occurrenceDateTime, occ])
  );

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 30); // Include past 30 days
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + windowDays);

  const occurrenceDates = generateOccurrenceDates(task, rangeStart, rangeEnd);
  
  const occurrences: Occurrence[] = occurrenceDates.map(date => {
    const dateTimeStr = date.toISOString();
    const existing = existingByDateTime.get(dateTimeStr);

    if (existing) {
      return existing;
    }

    return {
      id: uuidv4(),
      taskId: task.id,
      occurrenceDateTime: dateTimeStr,
      state: 'pending' as const,
      snoozedUntil: null,
      completedAt: null,
    };
  });

  return occurrences;
}

export async function syncOccurrencesForTask(task: Task): Promise<void> {
  await deleteOccurrencesByTask(task.id);
  
  if (task.status === 'archived') return;
  
  const occurrences = await generateOccurrencesForTask(task);
  
  for (const occ of occurrences) {
    await saveOccurrence(occ);
  }
}

export function getOccurrencesForDate(occurrences: Occurrence[], tasks: Task[], date: Date): Array<{ occurrence: Occurrence; task: Task }> {
  const dateStr = date.toISOString().split('T')[0];
  
  return occurrences
    .filter(occ => {
      const occDateStr = new Date(occ.occurrenceDateTime).toISOString().split('T')[0];
      return occDateStr === dateStr;
    })
    .map(occurrence => {
      const task = tasks.find(t => t.id === occurrence.taskId);
      return task ? { occurrence, task } : null;
    })
    .filter((item): item is { occurrence: Occurrence; task: Task } => item !== null)
    .sort((a, b) => {
      // Sort by time
      return new Date(a.occurrence.occurrenceDateTime).getTime() - new Date(b.occurrence.occurrenceDateTime).getTime();
    });
}
