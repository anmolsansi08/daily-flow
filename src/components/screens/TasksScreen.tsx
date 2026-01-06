import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Filter, Inbox } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { SwipeableTaskItem } from '@/components/tasks/SwipeableTaskItem';
import { TaskForm } from '@/components/tasks/TaskForm';
import { SearchBar } from '@/components/tasks/SearchBar';
import type { Task, Occurrence, Priority } from '@/types/task';

type FilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export function TasksScreen() {
  const { tasks, occurrences, completeOccurrence, updateTask, deleteTask } = useTasks();
  const { tags, createTag } = useTags();
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilters, setPriorityFilters] = useState<Priority[]>([]);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    const today = startOfDay(new Date());
    
    let items = occurrences
      .map(occ => {
        const task = tasks.find(t => t.id === occ.taskId);
        return task ? { occurrence: occ, task } : null;
      })
      .filter((item): item is { occurrence: Occurrence; task: Task } => item !== null)
      .filter(item => item.task.status === 'active' || filter === 'completed');

    // Apply status filter
    switch (filter) {
      case 'today':
        items = items.filter(({ occurrence }) => 
          isToday(new Date(occurrence.occurrenceDateTime)) && occurrence.state !== 'completed'
        );
        break;
      case 'upcoming':
        items = items.filter(({ occurrence }) => {
          const date = new Date(occurrence.occurrenceDateTime);
          return date > today && occurrence.state !== 'completed';
        });
        break;
      case 'overdue':
        items = items.filter(({ occurrence }) => {
          const date = new Date(occurrence.occurrenceDateTime);
          return isPast(date) && !isToday(date) && occurrence.state !== 'completed';
        });
        break;
      case 'completed':
        items = items.filter(({ occurrence }) => occurrence.state === 'completed');
        break;
      default:
        items = items.filter(({ occurrence }) => occurrence.state !== 'completed');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(({ task }) => 
        task.title.toLowerCase().includes(query) ||
        task.notes.toLowerCase().includes(query) ||
        task.subtasks.some(s => s.title.toLowerCase().includes(query))
      );
    }

    // Apply priority filter
    if (priorityFilters.length > 0) {
      items = items.filter(({ task }) => priorityFilters.includes(task.priority));
    }

    // Apply tag filter
    if (selectedTagFilters.length > 0) {
      items = items.filter(({ task }) => 
        selectedTagFilters.some(tagId => task.tags.includes(tagId))
      );
    }

    return items;
  }, [tasks, occurrences, filter, searchQuery, priorityFilters, selectedTagFilters]);

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

  const handleDeleteFromSwipe = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card space-y-3">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        {/* Search bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          priorities={priorityFilters}
          onPrioritiesChange={setPriorityFilters}
          tags={tags}
          selectedTags={selectedTagFilters}
          onSelectedTagsChange={setSelectedTagFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
        
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              {searchQuery || priorityFilters.length > 0 || selectedTagFilters.length > 0 ? (
                <Filter className="w-8 h-8 opacity-50" />
              ) : (
                <Inbox className="w-8 h-8 opacity-50" />
              )}
            </div>
            <p className="text-lg font-medium">
              {searchQuery ? 'No matching tasks' : 'No tasks found'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search' : 'Try changing your filter'}
            </p>
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
                      <SwipeableTaskItem
                        task={task}
                        occurrence={occurrence}
                        tags={tags}
                        onClick={() => setEditingTask(task)}
                        onComplete={() => completeOccurrence(occurrence.id)}
                        onDelete={() => handleDeleteFromSwipe(task.id)}
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
            tags={tags}
            onCreateTag={createTag}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            onDelete={handleDeleteTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
