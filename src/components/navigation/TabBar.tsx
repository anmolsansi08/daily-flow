import { motion } from 'framer-motion';
import { Calendar, ListTodo, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'calendar' | 'tasks' | 'settings';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex items-center justify-around h-tab border-t border-border bg-card ios-glass px-4 pb-safe-bottom">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 py-2 px-6 relative"
          >
            {isActive && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            
            <Icon className={cn(
              "w-6 h-6 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
            
            <span className={cn(
              "text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
