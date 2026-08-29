import ApiClient from "./client";
import type { Category } from "@/lib/types";

type ListCategoriesResponse = { categories: Category[] };

class CategoriesApi {
  static async list(show_inactive: boolean = true): Promise<Category[]> {
    const { data } = await ApiClient.request<ListCategoriesResponse>(
      `/categories?show_inactive=${show_inactive}`
    );
    return data.categories;
  }
}

export default CategoriesApi;