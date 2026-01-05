import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, Occurrence } from '@/types/task';

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  occurrences: Occurrence[];
  onDaySelect: (date: Date) => void;
  selectedDate: Date;
}

export function MonthView({ currentDate, tasks, occurrences, onDaySelect, selectedDate }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return occurrences.filter(occ => {
      const occDate = format(new Date(occ.occurrenceDateTime), 'yyyy-MM-dd');
      return occDate === dateStr;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          const hasCompletedTasks = dayTasks.some(t => t.state === 'completed');
          const hasPendingTasks = dayTasks.some(t => t.state === 'pending');

          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDaySelect(day)}
              className={cn(
                "calendar-cell relative flex flex-col items-center justify-start py-2 rounded-xl min-h-[60px]",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                isSelected && "bg-primary text-primary-foreground",
                isDayToday && !isSelected && "bg-calendar-today",
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                isDayToday && !isSelected && "text-primary font-semibold"
              )}>
                {format(day, 'd')}
              </span>

              {/* Task indicators */}
              {dayTasks.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {hasPendingTasks && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-primary"
                    )} />
                  )}
                  {hasCompletedTasks && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-primary-foreground/60" : "bg-success"
                    )} />
                  )}
                </div>
              )}

              {/* Task count badge */}
              {dayTasks.length > 2 && (
                <span className={cn(
                  "text-[10px] mt-0.5",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  +{dayTasks.length - 2}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
