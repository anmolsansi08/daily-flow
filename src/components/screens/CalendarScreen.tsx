import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { CalendarHeader, type CalendarView } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types/task';

interface CalendarScreenProps {
  onTaskClick: (taskId: string) => void;
}

export function CalendarScreen({ onTaskClick }: CalendarScreenProps) {
  const { tasks, occurrences, createTask, updateTask, completeOccurrence, deleteTask } = useTasks();
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const activeTasks = useMemo(() => 
    tasks.filter(t => t.status === 'active'),
    [tasks]
  );

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    if (view === 'month') {
      setView('day');
      setCurrentDate(date);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await createTask({
      title: taskData.title || '',
      notes: taskData.notes,
      allDay: taskData.allDay,
      priority: taskData.priority,
      scheduleType: taskData.scheduleType || 'one-time',
      dueDateTime: taskData.dueDateTime,
      repeatRule: taskData.repeatRule,
      reminders: taskData.reminders,
      subtasks: taskData.subtasks,
    });
    setShowTaskForm(false);
  };

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

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        onViewChange={setView}
        onDateChange={(date) => {
          setCurrentDate(date);
          setSelectedDate(date);
        }}
      />

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <MonthView
                currentDate={currentDate}
                tasks={activeTasks}
                occurrences={occurrences}
                selectedDate={selectedDate}
                onDaySelect={handleDaySelect}
              />
            </motion.div>
          )}

          {view === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <WeekView
                currentDate={currentDate}
                tasks={activeTasks}
                occurrences={occurrences}
                selectedDate={selectedDate}
                onDaySelect={setSelectedDate}
                onTaskClick={handleTaskClick}
                onCompleteOccurrence={completeOccurrence}
              />
            </motion.div>
          )}

          {view === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <DayView
                currentDate={currentDate}
                tasks={activeTasks}
                occurrences={occurrences}
                onTaskClick={handleTaskClick}
                onCompleteOccurrence={completeOccurrence}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating action button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center ios-shadow-lg"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Task form modal */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            initialDate={selectedDate}
            onSubmit={handleCreateTask}
            onCancel={() => setShowTaskForm(false)}
          />
        )}
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
