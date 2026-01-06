import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Check, Trash2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, Occurrence, Tag } from '@/types/task';

interface SwipeableTaskItemProps {
  task: Task;
  occurrence: Occurrence;
  tags: Tag[];
  onClick: () => void;
  onComplete: () => void;
  onDelete: () => void;
  compact?: boolean;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableTaskItem({ 
  task, 
  occurrence, 
  tags,
  onClick, 
  onComplete, 
  onDelete, 
  compact = false 
}: SwipeableTaskItemProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const isCompleted = occurrence.state === 'completed';
  const isOverdue = !isCompleted && new Date(occurrence.occurrenceDateTime) < new Date();
  const time = task.allDay ? null : format(new Date(occurrence.occurrenceDateTime), 'h:mm a');

  // Transform x position to opacity and scale of action buttons
  const leftOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const rightOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const leftScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);
  const rightScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.5]);

  // Background colors
  const leftBg = useTransform(x, [0, SWIPE_THRESHOLD], ['hsl(142, 71%, 45%)', 'hsl(142, 71%, 45%)']);
  const rightBg = useTransform(x, [-SWIPE_THRESHOLD, 0], ['hsl(0, 84%, 60%)', 'hsl(0, 84%, 60%)']);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x > SWIPE_THRESHOLD) {
      onComplete();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onDelete();
    }
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const taskTags = tags.filter(t => task.tags.includes(t.id));

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Left action (complete) */}
      <motion.div 
        className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 bg-success rounded-l-xl"
        style={{ opacity: leftOpacity }}
      >
        <motion.div style={{ scale: leftScale }}>
          <Check className="w-6 h-6 text-success-foreground" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Right action (delete) */}
      <motion.div 
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-destructive rounded-r-xl"
        style={{ opacity: rightOpacity }}
      >
        <motion.div style={{ scale: rightScale }}>
          <Trash2 className="w-6 h-6 text-destructive-foreground" />
        </motion.div>
      </motion.div>

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={isDragging ? {} : { scale: 0.98 }}
        onClick={() => !isDragging && onClick()}
        className={cn(
          "relative bg-card rounded-xl px-4 py-3 ios-shadow cursor-pointer",
          getPriorityClass(),
          compact && "py-2"
        )}
      >
        <div className="flex items-center gap-3">
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
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-success-foreground"
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                isCompleted && "line-through text-muted-foreground"
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

            {/* Tags */}
            {!compact && taskTags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {taskTags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary"
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks progress */}
            {!compact && task.subtasks.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
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
        </div>
      </motion.div>
    </div>
  );
}
