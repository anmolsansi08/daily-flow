import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasscodeScreenProps {
  mode: 'setup' | 'verify' | 'confirm';
  onComplete: (passcode: string) => Promise<boolean>;
  onSkip?: () => void;
}

export function PasscodeScreen({ mode, onComplete, onSkip }: PasscodeScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleNumber = useCallback(async (num: string) => {
    setError('');
    
    if (mode === 'setup') {
      if (!isConfirming) {
        const newPasscode = passcode + num;
        setPasscode(newPasscode);
        if (newPasscode.length === 4) {
          setIsConfirming(true);
        }
      } else {
        const newConfirm = confirmPasscode + num;
        setConfirmPasscode(newConfirm);
        if (newConfirm.length === 4) {
          if (newConfirm === passcode) {
            await onComplete(passcode);
          } else {
            setError('Passcodes do not match');
            setIsShaking(true);
            setTimeout(() => {
              setIsShaking(false);
              setConfirmPasscode('');
            }, 500);
          }
        }
      }
    } else {
      const newPasscode = passcode + num;
      setPasscode(newPasscode);
      if (newPasscode.length === 4) {
        const success = await onComplete(newPasscode);
        if (!success) {
          setError('Incorrect passcode');
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setPasscode('');
          }, 500);
        }
      }
    }
  }, [passcode, confirmPasscode, isConfirming, mode, onComplete]);

  const handleDelete = useCallback(() => {
    if (mode === 'setup' && isConfirming) {
      setConfirmPasscode(prev => prev.slice(0, -1));
    } else {
      setPasscode(prev => prev.slice(0, -1));
    }
    setError('');
  }, [mode, isConfirming]);

  const currentCode = mode === 'setup' && isConfirming ? confirmPasscode : passcode;

  const getMessage = () => {
    if (mode === 'setup') {
      return isConfirming ? 'Confirm your passcode' : 'Create a passcode';
    }
    return 'Enter passcode';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold mb-2">{getMessage()}</h1>
        
        {mode === 'setup' && !isConfirming && (
          <p className="text-muted-foreground text-center mb-8">
            Protect your tasks with a 4-digit passcode
          </p>
        )}

        {/* Passcode dots */}
        <motion.div
          className="flex gap-4 my-8"
          animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                currentCode.length > i
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/40"
              )}
              animate={currentCode.length > i ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.2 }}
            />
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-destructive text-sm mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumber(num.toString())}
              className="w-20 h-20 rounded-full bg-secondary text-2xl font-medium flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            >
              {num}
            </motion.button>
          ))}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full flex items-center justify-center text-muted-foreground"
            disabled
          >
            <Fingerprint className="w-7 h-7" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumber('0')}
            className="w-20 h-20 rounded-full bg-secondary text-2xl font-medium flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          >
            0
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="w-20 h-20 rounded-full flex items-center justify-center"
          >
            <Delete className="w-7 h-7 text-foreground" />
          </motion.button>
        </div>

        {mode === 'setup' && onSkip && !isConfirming && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-primary font-medium"
            onClick={onSkip}
          >
            Skip for now
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
