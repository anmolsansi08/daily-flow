import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getOccurrencesForDate } from '@/lib/occurrences';
import type { Task, Occurrence } from '@/types/task';
import { TaskListItem } from '@/components/tasks/TaskListItem';

interface DayViewProps {
  currentDate: Date;
  tasks: Task[];
  occurrences: Occurrence[];
  onTaskClick: (taskId: string) => void;
  onCompleteOccurrence: (occurrenceId: string) => void;
}

export function DayView({ currentDate, tasks, occurrences, onTaskClick, onCompleteOccurrence }: DayViewProps) {
  const dayItems = useMemo(() => {
    return getOccurrencesForDate(occurrences, tasks, currentDate);
  }, [currentDate, tasks, occurrences]);

  const allDayItems = dayItems.filter(({ task }) => task.allDay);
  const timedItems = dayItems.filter(({ task }) => !task.allDay);

  // Generate time slots (6am to 11pm)
  const timeSlots = useMemo(() => {
    const slots: { hour: number; label: string }[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push({
        hour,
        label: format(new Date().setHours(hour, 0), 'h a'),
      });
    }
    return slots;
  }, []);

  const getItemsForHour = (hour: number) => {
    return timedItems.filter(({ occurrence }) => {
      const occHour = new Date(occurrence.occurrenceDateTime).getHours();
      return occHour === hour;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto ios-scroll">
      {/* All-day section */}
      {allDayItems.length > 0 && (
        <div className="border-b border-border p-4 bg-card">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">All Day</h4>
          <div className="space-y-2">
            {allDayItems.map(({ occurrence, task }) => (
              <TaskListItem
                key={occurrence.id}
                task={task}
                occurrence={occurrence}
                onClick={() => onTaskClick(task.id)}
                onComplete={() => onCompleteOccurrence(occurrence.id)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Time-based schedule */}
      <div className="relative">
        {timeSlots.map(({ hour, label }) => {
          const hourItems = getItemsForHour(hour);
          
          return (
            <div
              key={hour}
              className="flex border-b border-border/50 min-h-[60px]"
            >
              <div className="w-16 py-2 text-xs text-muted-foreground text-right pr-3 flex-shrink-0">
                {label}
              </div>
              <div className="flex-1 py-2 pr-4">
                {hourItems.map(({ occurrence, task }, index) => (
                  <motion.div
                    key={occurrence.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskListItem
                      task={task}
                      occurrence={occurrence}
                      onClick={() => onTaskClick(task.id)}
                      onComplete={() => onCompleteOccurrence(occurrence.id)}
                      compact
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {dayItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <p className="text-lg">No tasks for today</p>
          <p className="text-sm">Tap + to add a task</p>
        </motion.div>
      )}
    </div>
  );
}
