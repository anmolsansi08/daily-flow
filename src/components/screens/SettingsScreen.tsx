import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Lock, 
  Palette, 
  Shield, 
  ChevronRight,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface SettingsScreenProps {
  hasPasscode: boolean;
  onSetupPasscode: () => void;
  onRemovePasscode: () => void;
  onLock: () => void;
}

export function SettingsScreen({ hasPasscode, onSetupPasscode, onRemovePasscode, onLock }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationsEnabled(false);
      }
    }
  };

  const settingsSections = [
    {
      title: 'Security',
      items: [
        {
          icon: Lock,
          label: 'Passcode Lock',
          description: hasPasscode ? 'Enabled' : 'Disabled',
          action: hasPasscode ? (
            <button 
              onClick={onRemovePasscode}
              className="text-destructive text-sm font-medium"
            >
              Remove
            </button>
          ) : (
            <button 
              onClick={onSetupPasscode}
              className="text-primary text-sm font-medium"
            >
              Set Up
            </button>
          ),
        },
        ...(hasPasscode ? [{
          icon: Shield,
          label: 'Lock Now',
          description: 'Lock the app immediately',
          onClick: onLock,
          showChevron: true,
        }] : []),
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Enable Notifications',
          description: 'Receive task reminders',
          action: (
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsToggle}
            />
          ),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: 'Dark Mode',
          description: 'Switch between light and dark theme',
          action: (
            <Switch
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                document.documentElement.classList.toggle('dark', checked);
              }}
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto ios-scroll p-4 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide px-1">
              {section.title}
            </h3>
            <div className="bg-card rounded-xl ios-shadow overflow-hidden">
              {section.items.map((item, index) => (
                <motion.div
                  key={item.label}
                  whileTap={item.onClick ? { backgroundColor: 'hsl(var(--secondary))' } : {}}
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3",
                    index > 0 && "border-t border-border",
                    item.onClick && "cursor-pointer active:bg-secondary"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>

                  {item.action}
                  {item.showChevron && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* App info */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>Task Manager</p>
          <p className="mt-1">Version 1.0.0</p>
          <p className="mt-4 text-xs">Built with ❤️ for productivity</p>
        </div>
      </div>
    </div>
  );
}
