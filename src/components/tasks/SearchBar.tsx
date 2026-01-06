import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { Priority } from '@/types/task';
import type { Tag } from '@/types/task';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  priorities: Priority[];
  onPrioritiesChange: (priorities: Priority[]) => void;
  tags: Tag[];
  selectedTags: string[];
  onSelectedTagsChange: (tagIds: string[]) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-priority-high' },
  { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
  { value: 'low', label: 'Low', color: 'bg-priority-low' },
];

export function SearchBar({
  value,
  onChange,
  priorities,
  onPrioritiesChange,
  tags,
  selectedTags,
  onSelectedTagsChange,
  showFilters = false,
  onToggleFilters,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const togglePriority = (priority: Priority) => {
    if (priorities.includes(priority)) {
      onPrioritiesChange(priorities.filter(p => p !== priority));
    } else {
      onPrioritiesChange([...priorities, priority]);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onSelectedTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onSelectedTagsChange([...selectedTags, tagId]);
    }
  };

  const hasActiveFilters = priorities.length > 0 || selectedTags.length > 0;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tasks..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-10 pr-20 h-11 bg-secondary/50 border-0 focus-visible:ring-1"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-full hover:bg-secondary"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFilters}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              showFilters || hasActiveFilters ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl p-4 ios-shadow space-y-4">
              {/* Priority filters */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => (
                    <motion.button
                      key={p.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => togglePriority(p.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        priorities.includes(p.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", p.color)} />
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tags filters */}
              {tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <motion.button
                        key={tag.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          selectedTags.includes(tag.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onPrioritiesChange([]);
                    onSelectedTagsChange([]);
                  }}
                  className="text-sm text-destructive font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
