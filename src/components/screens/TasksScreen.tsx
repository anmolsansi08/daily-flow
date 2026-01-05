import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Filter } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';
import { TaskListItem } from '@/components/tasks/TaskListItem';
import { TaskForm } from '@/components/tasks/TaskForm';
import type { Task, Occurrence } from '@/types/task';

type FilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export function TasksScreen() {
  const { tasks, occurrences, completeOccurrence, updateTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredItems = useMemo(() => {
    const today = startOfDay(new Date());
    
    const items = occurrences
      .map(occ => {
        const task = tasks.find(t => t.id === occ.taskId);
        return task ? { occurrence: occ, task } : null;
      })
      .filter((item): item is { occurrence: Occurrence; task: Task } => item !== null)
      .filter(item => item.task.status === 'active' || filter === 'completed');

    switch (filter) {
      case 'today':
        return items.filter(({ occurrence }) => 
          isToday(new Date(occurrence.occurrenceDateTime)) && occurrence.state !== 'completed'
        );
      case 'upcoming':
        return items.filter(({ occurrence }) => {
          const date = new Date(occurrence.occurrenceDateTime);
          return date > today && occurrence.state !== 'completed';
        });
      case 'overdue':
        return items.filter(({ occurrence }) => {
          const date = new Date(occurrence.occurrenceDateTime);
          return isPast(date) && !isToday(date) && occurrence.state !== 'completed';
        });
      case 'completed':
        return items.filter(({ occurrence }) => occurrence.state === 'completed');
      default:
        return items.filter(({ occurrence }) => occurrence.state !== 'completed');
    }
  }, [tasks, occurrences, filter]);

  // Group by date
  const groupedItems = useMemo(() => {
    const groups: Record<string, { occurrence: Occurrence; task: Task }[]> = {};
    
    filteredItems.forEach(item => {
      const date = new Date(item.occurrence.occurrenceDateTime);
      let key: string;
      
      if (isToday(date)) {
        key = 'Today';
      } else if (isTomorrow(date)) {
        key = 'Tomorrow';
      } else {
        key = format(date, 'EEEE, MMMM d');
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].occurrence.occurrenceDateTime);
      const dateB = new Date(b[1][0].occurrence.occurrenceDateTime);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredItems]);

  const filters: { value: FilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Circle className="w-4 h-4" /> },
    { value: 'today', label: 'Today', icon: null },
    { value: 'upcoming', label: 'Upcoming', icon: null },
    { value: 'overdue', label: 'Overdue', icon: null },
    { value: 'completed', label: 'Done', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, taskData);
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    await deleteTask(editingTask.id);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {filters.map((f) => (
            <motion.button
              key={f.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {f.icon}
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto ios-scroll p-4">
        {groupedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <Filter className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">No tasks found</p>
            <p className="text-sm">Try changing your filter</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {groupedItems.map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {date}
                </h3>
                <div className="space-y-2">
                  {items.map(({ occurrence, task }, index) => (
                    <motion.div
                      key={occurrence.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <TaskListItem
                        task={task}
                        occurrence={occurrence}
                        onClick={() => setEditingTask(task)}
                        onComplete={() => completeOccurrence(occurrence.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit task modal */}
      <AnimatePresence>
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            onDelete={handleDeleteTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
