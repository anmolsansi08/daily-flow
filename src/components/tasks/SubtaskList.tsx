import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Subtask } from '@/types/task';

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  editable?: boolean;
}

export function SubtaskList({ subtasks, onChange, editable = true }: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState('');

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    onChange([...subtasks, {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
    }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    onChange(subtasks.filter(s => s.id !== id));
  };

  const toggleSubtask = (id: string) => {
    onChange(subtasks.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{completedCount}/{subtasks.length}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Subtasks list */}
      <Reorder.Group 
        axis="y" 
        values={subtasks} 
        onReorder={onChange}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {subtasks.map((subtask) => (
            <Reorder.Item
              key={subtask.id}
              value={subtask}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 group"
            >
              {editable && (
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSubtask(subtask.id)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  subtask.completed
                    ? "bg-success border-success"
                    : "border-muted-foreground/40"
                )}
              >
                <AnimatePresence>
                  {subtask.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-success-foreground"
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <span className={cn(
                "flex-1 text-sm",
                subtask.completed && "line-through text-muted-foreground"
              )}>
                {subtask.title}
              </span>

              {editable && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeSubtask(subtask.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </motion.button>
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add subtask input */}
      {editable && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add subtask..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
            className="flex-1 h-10"
          />
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={addSubtask}
            disabled={!newSubtask.trim()}
            className="h-10 w-10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
