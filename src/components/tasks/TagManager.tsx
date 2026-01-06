import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Tag } from '@/types/task';

interface TagManagerProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onCreateTag: (tag: Tag) => void;
  compact?: boolean;
}

const PRESET_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Teal
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Violet
  '#FF2D55', // Pink
  '#8E8E93', // Gray
];

export function TagManager({ 
  tags, 
  selectedTags, 
  onTagsChange, 
  onCreateTag,
  compact = false 
}: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[5]);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    const newTag: Tag = {
      id: uuidv4(),
      name: newTagName.trim(),
      color: selectedColor,
    };
    
    onCreateTag(newTag);
    onTagsChange([...selectedTags, newTag.id]);
    setNewTagName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-3">
      {/* Existing tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <motion.button
            key={tag.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleTag(tag.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              selectedTags.includes(tag.id)
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : ""
            )}
            style={{ 
              backgroundColor: `${tag.color}20`,
              color: tag.color,
            }}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
            {selectedTags.includes(tag.id) && (
              <Check className="w-3 h-3" />
            )}
          </motion.button>
        ))}
        
        {/* Add tag button */}
        {!compact && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Tag
          </motion.button>
        )}
      </div>

      {/* Create new tag form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-secondary/50 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: selectedColor }}
                />
                <Input
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  className="flex-1"
                  autoFocus
                />
              </div>

              {/* Color picker */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all",
                      selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
