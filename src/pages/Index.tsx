import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { PasscodeScreen } from '@/components/auth/PasscodeScreen';
import { CalendarScreen } from '@/components/screens/CalendarScreen';
import { TasksScreen } from '@/components/screens/TasksScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { TabBar, type TabType } from '@/components/navigation/TabBar';

const Index = () => {
  const { 
    isLoading, 
    isAuthenticated, 
    hasPasscode, 
    setupPasscode, 
    verifyPasscode,
    lock,
    removePasscode 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show passcode verification if locked
  if (hasPasscode && !isAuthenticated) {
    return (
      <PasscodeScreen
        mode="verify"
        onComplete={verifyPasscode}
      />
    );
  }

  // Show passcode setup if requested
  if (showPasscodeSetup) {
    return (
      <PasscodeScreen
        mode="setup"
        onComplete={async (passcode) => {
          await setupPasscode(passcode);
          setShowPasscodeSetup(false);
          return true;
        }}
        onSkip={() => setShowPasscodeSetup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <CalendarScreen onTaskClick={() => {}} />
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <TasksScreen />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <SettingsScreen
                hasPasscode={hasPasscode}
                onSetupPasscode={() => setShowPasscodeSetup(true)}
                onRemovePasscode={removePasscode}
                onLock={lock}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
