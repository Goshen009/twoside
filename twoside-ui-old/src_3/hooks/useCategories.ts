import { useCallback, useEffect, useState } from "react";
import CategoriesApi from "@/lib/api/categories";
import type { Category } from "@/lib/types";

export function useCategories() {
  const [categories, set_categories] = useState<Category[]>([]);
  const [loading, set_loading] = useState(true);

  const fetchCategories = useCallback(() => CategoriesApi.list(true).then(set_categories), []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) set_loading(true); });
    fetchCategories().finally(() => { if (active) set_loading(false); });
    return () => { active = false; };
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}