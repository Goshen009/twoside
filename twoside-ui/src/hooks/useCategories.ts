import { useEffect, useState } from "react";
import CategoriesApi from "@/lib/api/categories";
import type { Category } from "@/lib/types";

export function useCategories() {
  const [categories, set_categories] = useState<Category[]>([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    let active = true;
    CategoriesApi.list(true)
      .then((data) => {
        if (active) set_categories(data);
      })
      .finally(() => {
        if (active) set_loading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}