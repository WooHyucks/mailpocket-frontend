import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { CategoryType } from "../../api/categories/types";
import { QUERY_KEYS } from "../queryKeys";

export const useCategories = () => {
  return useQuery<CategoryType[]>({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};
