import { getCategories, createCategory } from '../lib/api/categories';
import { useEffect, useState } from 'react';
import type { Category } from '../lib/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const create = async (name: string) => {
    await createCategory(name);
    await refresh();
  };

  useEffect(() => {
    let ignore = false;

    getCategories()
      .then((data) => {
        if (!ignore) setCategories(data.categories);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Failed to load categories');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  return { categories, loading, error, refresh, create };
}