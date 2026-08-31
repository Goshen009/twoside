import { useCallback, useEffect, useState } from "react";
import API from "../libs/api/api";

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export const useCategories = () => {
  const [categories, set_categories] = useState<Category[]>([]);
  const [loading, set_loading] = useState(true);

  const fetchCategories = useCallback(() => API.listCategories(true).then(set_categories), []);

  useEffect(() => {
    let active = true;
    set_loading(true);
    fetchCategories().finally(() => {
      if (active) set_loading(false);
    });
    return () => {
      active = false;
    };
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
};