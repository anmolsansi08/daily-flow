import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Trash2, Bell, Tag as TagIcon } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SubtaskList } from '@/components/tasks/SubtaskList';
import { TagManager } from '@/components/tasks/TagManager';
import type { Task, Priority, Weekday, Subtask, Reminder, RepeatRule, Tag } from '@/types/task';

interface TaskFormProps {
  task?: Task | null;
  initialDate?: Date;
  tags?: Tag[];
  onCreateTag?: (tag: Tag) => void;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const WEEKDAYS: { value: Weekday; label: string; short: string }[] = [
  { value: 'sun', label: 'Sunday', short: 'S' },
  { value: 'mon', label: 'Monday', short: 'M' },
  { value: 'tue', label: 'Tuesday', short: 'T' },
  { value: 'wed', label: 'Wednesday', short: 'W' },
  { value: 'thu', label: 'Thursday', short: 'T' },
  { value: 'fri', label: 'Friday', short: 'F' },
  { value: 'sat', label: 'Saturday', short: 'S' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: 'bg-muted' },
  { value: 'low', label: 'Low', color: 'bg-priority-low' },
  { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
  { value: 'high', label: 'High', color: 'bg-priority-high' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'At time' },
  { value: 15, label: '15 min before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

export function TaskForm({ task, initialDate, tags = [], onCreateTag, onSubmit, onCancel, onDelete }: TaskFormProps) {
  const isEditing = !!task;
  
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [allDay, setAllDay] = useState(task?.allDay || false);
  const [priority, setPriority] = useState<Priority>(task?.priority || 'none');
  const [scheduleType, setScheduleType] = useState<'one-time' | 'repeating'>(task?.scheduleType || 'one-time');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  
  // Date/Time
  const defaultDate = initialDate || new Date();
  const [date, setDate] = useState(
    task?.dueDateTime 
      ? format(new Date(task.dueDateTime), 'yyyy-MM-dd')
      : format(defaultDate, 'yyyy-MM-dd')
  );
  const [time, setTime] = useState(
    task?.dueDateTime 
      ? format(new Date(task.dueDateTime), 'HH:mm')
      : format(defaultDate, 'HH:mm')
  );

  // Repeat rule
  const [weekdays, setWeekdays] = useState<Weekday[]>(task?.repeatRule?.weekdays || []);
  const [endDate, setEndDate] = useState(
    task?.repeatRule?.endDate 
      ? format(new Date(task.repeatRule.endDate), 'yyyy-MM-dd')
      : ''
  );

  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>(task?.reminders || []);

  // UI state
  const [showPriority, setShowPriority] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const toggleWeekday = (day: Weekday) => {
    setWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleReminder = (offsetMinutes: number) => {
    const existing = reminders.find(r => r.offsetMinutes === offsetMinutes);
    if (existing) {
      setReminders(prev => prev.filter(r => r.id !== existing.id));
    } else {
      setReminders(prev => [...prev, {
        id: uuidv4(),
        type: offsetMinutes === 0 ? 'at-time' : 'offset-before',
        offsetMinutes,
        enabled: true,
      }]);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const dueDateTime = allDay 
      ? new Date(`${date}T00:00:00`).toISOString()
      : new Date(`${date}T${time}:00`).toISOString();

    const repeatRule: RepeatRule | null = scheduleType === 'repeating' && weekdays.length > 0 && endDate
      ? {
          frequency: 'weekly',
          weekdays,
          startDate: date,
          endDate,
          timeOfDay: allDay ? null : { 
            hour: parseInt(time.split(':')[0]), 
            minute: parseInt(time.split(':')[1]) 
          },
        }
      : null;

    onSubmit({
      title: title.trim(),
      notes: notes.trim(),
      allDay,
      priority,
      tags: selectedTags,
      scheduleType,
      dueDateTime: scheduleType === 'one-time' ? dueDateTime : null,
      repeatRule,
      subtasks,
      reminders,
    });
  };

  const isValid = title.trim() && (
    scheduleType === 'one-time' || 
    (weekdays.length > 0 && endDate)
  );

  const selectedTagCount = selectedTags.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border ios-glass">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <h2 className="text-lg font-semibold">
          {isEditing ? 'Edit Task' : 'New Task'}
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSubmit}
          disabled={!isValid}
          className="text-primary font-semibold disabled:opacity-50"
        >
          {isEditing ? 'Save' : 'Add'}
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto ios-scroll p-4 space-y-6">
        {/* Title & Notes */}
        <div className="space-y-3">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium h-12"
            autoFocus
          />
          <Textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        {/* Date & Time */}
        <div className="bg-card rounded-xl p-4 space-y-4 ios-shadow">
          <div className="flex items-center justify-between">
            <span className="font-medium">All Day</span>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {!allDay && (
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Repeat */}
        <div className="bg-card rounded-xl p-4 space-y-4 ios-shadow">
          <div className="flex items-center justify-between">
            <span className="font-medium">Repeat</span>
            <Switch 
              checked={scheduleType === 'repeating'} 
              onCheckedChange={(checked) => setScheduleType(checked ? 'repeating' : 'one-time')} 
            />
          </div>

          <AnimatePresence>
            {scheduleType === 'repeating' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Weekday picker */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Repeat on</label>
                  <div className="flex gap-2">
                    {WEEKDAYS.map(({ value, short }) => (
                      <button
                        key={value}
                        onClick={() => toggleWeekday(value)}
                        className={cn(
                          "w-9 h-9 rounded-full text-sm font-medium transition-all",
                          weekdays.includes(value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {short}
                      </button>
                    ))}
                  </div>
                </div>

                {/* End date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">End date (required)</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={date}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority */}
        <div className="bg-card rounded-xl ios-shadow overflow-hidden">
          <button
            onClick={() => setShowPriority(!showPriority)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <span className="font-medium">Priority</span>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", PRIORITIES.find(p => p.value === priority)?.color)} />
              <span className="text-muted-foreground capitalize">{priority}</span>
              <ChevronDown className={cn("w-5 h-5 transition-transform", showPriority && "rotate-180")} />
            </div>
          </button>
          
          <AnimatePresence>
            {showPriority && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPriority(p.value);
                        setShowPriority(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors",
                        priority === p.value ? "bg-secondary" : "hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full", p.color)} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags */}
        <div className="bg-card rounded-xl ios-shadow overflow-hidden">
          <button
            onClick={() => setShowTags(!showTags)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              <span className="font-medium">Tags</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedTagCount > 0 && (
                <span className="text-sm text-primary">{selectedTagCount} selected</span>
              )}
              <ChevronDown className={cn("w-5 h-5 transition-transform", showTags && "rotate-180")} />
            </div>
          </button>
          
          <AnimatePresence>
            {showTags && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-4">
                  <TagManager
                    tags={tags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    onCreateTag={onCreateTag || (() => {})}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reminders */}
        <div className="bg-card rounded-xl ios-shadow overflow-hidden">
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span className="font-medium">Reminders</span>
            </div>
            <div className="flex items-center gap-2">
              {reminders.length > 0 && (
                <span className="text-sm text-primary">{reminders.length} active</span>
              )}
              <ChevronDown className={cn("w-5 h-5 transition-transform", showReminders && "rotate-180")} />
            </div>
          </button>
          
          <AnimatePresence>
            {showReminders && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-2">
                  {REMINDER_OPTIONS.map((option) => {
                    const isActive = reminders.some(r => r.offsetMinutes === option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleReminder(option.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg flex items-center justify-between transition-colors",
                          isActive ? "bg-primary/10" : "hover:bg-secondary/50"
                        )}
                      >
                        <span>{option.label}</span>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <X className="w-3 h-3 text-primary-foreground" />
                            </motion.div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtasks */}
        <div className="bg-card rounded-xl p-4 ios-shadow space-y-3">
          <h3 className="font-medium">Subtasks</h3>
          <SubtaskList
            subtasks={subtasks}
            onChange={setSubtasks}
          />
        </div>

        {/* Delete button for editing */}
        {isEditing && onDelete && (
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Task
          </Button>
        )}
      </div>
    </motion.div>
  );
}
