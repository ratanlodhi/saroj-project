import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaintingCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export function useCategories() {
  const [categories, setCategories] = useState<PaintingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('painting_categories')
          .select('id, name, slug, description')
          .order('name');

        if (error) throw error;
        setCategories(data ?? []);
      } catch {
        // If the table doesn't exist yet or the connection is offline,
        // fall back to an empty list so the rest of the UI still works.
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}
