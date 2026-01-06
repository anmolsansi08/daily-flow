import { useState, useEffect, useCallback } from 'react';
import { getAllTags, saveTag, deleteTag as dbDeleteTag } from '@/lib/db';
import type { Tag } from '@/types/task';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTags = useCallback(async () => {
    try {
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const createTag = useCallback(async (tag: Tag): Promise<void> => {
    await saveTag(tag);
    await loadTags();
  }, [loadTags]);

  const updateTag = useCallback(async (tag: Tag): Promise<void> => {
    await saveTag(tag);
    await loadTags();
  }, [loadTags]);

  const deleteTag = useCallback(async (id: string): Promise<void> => {
    await dbDeleteTag(id);
    await loadTags();
  }, [loadTags]);

  return {
    tags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
    refresh: loadTags,
  };
}
