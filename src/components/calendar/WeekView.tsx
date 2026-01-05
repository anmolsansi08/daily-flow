import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { getOccurrencesForDate } from '@/lib/occurrences';
import type { Task, Occurrence } from '@/types/task';
import { TaskListItem } from '@/components/tasks/TaskListItem';

interface WeekViewProps {
  currentDate: Date;
  tasks: Task[];
  occurrences: Occurrence[];
  onDaySelect: (date: Date) => void;
  selectedDate: Date;
  onTaskClick: (taskId: string) => void;
  onCompleteOccurrence: (occurrenceId: string) => void;
}

export function WeekView({ 
  currentDate, 
  tasks, 
  occurrences, 
  onDaySelect, 
  selectedDate,
  onTaskClick,
  onCompleteOccurrence 
}: WeekViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Week days header */}
      <div className="flex border-b border-border bg-card px-2">
        {days.map((day) => {
          const isDayToday = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDaySelect(day)}
              className={cn(
                "flex-1 py-3 flex flex-col items-center gap-1",
              )}
            >
              <span className="text-xs text-muted-foreground font-medium">
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                isSelected && "bg-primary text-primary-foreground",
                isDayToday && !isSelected && "bg-primary/10 text-primary",
              )}>
                {format(day, 'd')}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      <div className="flex-1 overflow-y-auto ios-scroll p-4">
        <h3 className="text-lg font-semibold mb-4">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        
        <DayTaskList
          date={selectedDate}
          tasks={tasks}
          occurrences={occurrences}
          onTaskClick={onTaskClick}
          onCompleteOccurrence={onCompleteOccurrence}
        />
      </div>
    </div>
  );
}

interface DayTaskListProps {
  date: Date;
  tasks: Task[];
  occurrences: Occurrence[];
  onTaskClick: (taskId: string) => void;
  onCompleteOccurrence: (occurrenceId: string) => void;
}

function DayTaskList({ date, tasks, occurrences, onTaskClick, onCompleteOccurrence }: DayTaskListProps) {
  const dayItems = useMemo(() => {
    return getOccurrencesForDate(occurrences, tasks, date);
  }, [date, tasks, occurrences]);

  if (dayItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-muted-foreground"
      >
        <p className="text-lg">No tasks</p>
        <p className="text-sm">Tap + to add a task</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {dayItems.map(({ occurrence, task }, index) => (
        <motion.div
          key={occurrence.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <TaskListItem
            task={task}
            occurrence={occurrence}
            onClick={() => onTaskClick(task.id)}
            onComplete={() => onCompleteOccurrence(occurrence.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
