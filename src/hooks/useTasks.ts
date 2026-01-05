import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllTasks, saveTask, deleteTask as dbDeleteTask, getOccurrencesByDateRange, saveOccurrence } from '@/lib/db';
import { syncOccurrencesForTask } from '@/lib/occurrences';
import type { Task, Occurrence, Priority, Reminder, RepeatRule, Subtask } from '@/types/task';

export interface CreateTaskInput {
  title: string;
  notes?: string;
  allDay?: boolean;
  priority?: Priority;
  tags?: string[];
  subtasks?: Subtask[];
  scheduleType: 'one-time' | 'repeating';
  dueDateTime?: string | null;
  repeatRule?: RepeatRule | null;
  reminders?: Reminder[];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks);

      // Load occurrences for a window
      const now = new Date();
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      const end = new Date(now);
      end.setMonth(end.getMonth() + 2);
      
      const allOccurrences = await getOccurrencesByDateRange(start.toISOString(), end.toISOString());
      setOccurrences(allOccurrences);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      title: input.title,
      notes: input.notes || '',
      allDay: input.allDay || false,
      priority: input.priority || 'none',
      tags: input.tags || [],
      subtasks: input.subtasks || [],
      status: 'active',
      scheduleType: input.scheduleType,
      dueDateTime: input.dueDateTime || null,
      repeatRule: input.repeatRule || null,
      reminders: input.reminders || [],
      createdAt: now,
      updatedAt: now,
    };

    await saveTask(task);
    await syncOccurrencesForTask(task);
    await loadData();

    return task;
  }, [loadData]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<void> => {
    const existing = tasks.find(t => t.id === id);
    if (!existing) return;

    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveTask(updated);
    await syncOccurrencesForTask(updated);
    await loadData();
  }, [tasks, loadData]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await dbDeleteTask(id);
    await loadData();
  }, [loadData]);

  const completeOccurrence = useCallback(async (occurrenceId: string): Promise<void> => {
    const occurrence = occurrences.find(o => o.id === occurrenceId);
    if (!occurrence) return;

    const updated: Occurrence = {
      ...occurrence,
      state: occurrence.state === 'completed' ? 'pending' : 'completed',
      completedAt: occurrence.state === 'completed' ? null : new Date().toISOString(),
    };

    await saveOccurrence(updated);
    await loadData();
  }, [occurrences, loadData]);

  const snoozeOccurrence = useCallback(async (occurrenceId: string, minutes: number): Promise<void> => {
    const occurrence = occurrences.find(o => o.id === occurrenceId);
    if (!occurrence) return;

    const snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes);

    const updated: Occurrence = {
      ...occurrence,
      snoozedUntil: snoozedUntil.toISOString(),
    };

    await saveOccurrence(updated);
    await loadData();
  }, [occurrences, loadData]);

  return {
    tasks,
    occurrences,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeOccurrence,
    snoozeOccurrence,
    refresh: loadData,
  };
}
