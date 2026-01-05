import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export type CalendarView = 'day' | 'week' | 'month';

interface CalendarHeaderProps {
  view: CalendarView;
  currentDate: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
}

export function CalendarHeader({ view, currentDate, onViewChange, onDateChange }: CalendarHeaderProps) {
  const handlePrev = () => {
    switch (view) {
      case 'day':
        onDateChange(subDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d');
      case 'week':
        return format(currentDate, 'MMMM yyyy');
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-3 bg-card border-b border-border">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-secondary"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleToday}
          className="flex flex-col items-center"
        >
          <span className="text-lg font-semibold">{getTitle()}</span>
          {view === 'day' && (
            <span className="text-sm text-muted-foreground">
              {format(currentDate, 'yyyy')}
            </span>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-secondary"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* View switcher */}
      <div className="flex bg-secondary rounded-lg p-1">
        {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
          <motion.button
            key={v}
            onClick={() => onViewChange(v)}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              view === v
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            whileTap={{ scale: 0.98 }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
