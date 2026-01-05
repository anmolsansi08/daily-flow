import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, Occurrence } from '@/types/task';

interface TaskListItemProps {
  task: Task;
  occurrence: Occurrence;
  onClick: () => void;
  onComplete: () => void;
  compact?: boolean;
}

export function TaskListItem({ task, occurrence, onClick, onComplete, compact = false }: TaskListItemProps) {
  const isCompleted = occurrence.state === 'completed';
  const isOverdue = !isCompleted && new Date(occurrence.occurrenceDateTime) < new Date();
  const time = task.allDay ? null : format(new Date(occurrence.occurrenceDateTime), 'h:mm a');

  const getPriorityClass = () => {
    switch (task.priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "ios-list-item flex items-center gap-3 ios-shadow",
        getPriorityClass(),
        compact && "py-2"
      )}
    >
      {/* Completion checkbox */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
          isCompleted
            ? "bg-success border-success"
            : isOverdue
            ? "border-destructive"
            : "border-muted-foreground/40"
        )}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-success-foreground"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            isCompleted && "task-completed"
          )}>
            {task.title}
          </span>
          {isOverdue && !isCompleted && (
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          )}
        </div>
        
        {!compact && task.notes && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {task.notes}
          </p>
        )}

        {/* Subtasks progress */}
        {!compact && task.subtasks.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden max-w-[100px]">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ 
                  width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` 
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}
      </div>

      {/* Time */}
      {time && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>
      )}
    </motion.div>
  );
}
