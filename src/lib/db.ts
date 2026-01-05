import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Task, Occurrence, Tag, AuthState } from '@/types/task';

interface TaskManagerDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-status': TaskStatus;
      'by-due': string;
    };
  };
  occurrences: {
    key: string;
    value: Occurrence;
    indexes: {
      'by-task': string;
      'by-date': string;
    };
  };
  tags: {
    key: string;
    value: Tag;
  };
  auth: {
    key: string;
    value: AuthState;
  };
}

type TaskStatus = Task['status'];

let db: IDBPDatabase<TaskManagerDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<TaskManagerDB>> {
  if (db) return db;

  db = await openDB<TaskManagerDB>('taskmanager', 1, {
    upgrade(database) {
      // Tasks store
      const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-due', 'dueDateTime');

      // Occurrences store
      const occStore = database.createObjectStore('occurrences', { keyPath: 'id' });
      occStore.createIndex('by-task', 'taskId');
      occStore.createIndex('by-date', 'occurrenceDateTime');

      // Tags store
      database.createObjectStore('tags', { keyPath: 'id' });

      // Auth store
      database.createObjectStore('auth', { keyPath: 'id' });
    },
  });

  return db;
}

// Task operations
export async function getAllTasks(): Promise<Task[]> {
  const database = await getDB();
  return database.getAll('tasks');
}

export async function getTask(id: string): Promise<Task | undefined> {
  const database = await getDB();
  return database.get('tasks', id);
}

export async function saveTask(task: Task): Promise<void> {
  const database = await getDB();
  await database.put('tasks', task);
}

export async function deleteTask(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('tasks', id);
  // Also delete related occurrences
  const occurrences = await database.getAllFromIndex('occurrences', 'by-task', id);
  for (const occ of occurrences) {
    await database.delete('occurrences', occ.id);
  }
}

// Occurrence operations
export async function getOccurrencesByDateRange(startDate: string, endDate: string): Promise<Occurrence[]> {
  const database = await getDB();
  const all = await database.getAll('occurrences');
  return all.filter(occ => occ.occurrenceDateTime >= startDate && occ.occurrenceDateTime <= endDate);
}

export async function getOccurrencesByTask(taskId: string): Promise<Occurrence[]> {
  const database = await getDB();
  return database.getAllFromIndex('occurrences', 'by-task', taskId);
}

export async function saveOccurrence(occurrence: Occurrence): Promise<void> {
  const database = await getDB();
  await database.put('occurrences', occurrence);
}

export async function deleteOccurrencesByTask(taskId: string): Promise<void> {
  const database = await getDB();
  const occurrences = await database.getAllFromIndex('occurrences', 'by-task', taskId);
  for (const occ of occurrences) {
    await database.delete('occurrences', occ.id);
  }
}

// Tag operations
export async function getAllTags(): Promise<Tag[]> {
  const database = await getDB();
  return database.getAll('tags');
}

export async function saveTag(tag: Tag): Promise<void> {
  const database = await getDB();
  await database.put('tags', tag);
}

export async function deleteTag(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('tags', id);
}

// Auth operations
export async function getAuthState(): Promise<AuthState | undefined> {
  const database = await getDB();
  return database.get('auth', 'main');
}

export async function saveAuthState(auth: AuthState): Promise<void> {
  const database = await getDB();
  await database.put('auth', { ...auth, id: 'main' } as AuthState & { id: string });
}
