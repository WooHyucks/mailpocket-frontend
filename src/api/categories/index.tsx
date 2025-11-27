import axiosInstance from "../axiosInstance";
import { CategoryType } from "./types";

export const categoriesApi = {
  getCategories: async (): Promise<CategoryType[]> => {
    const response = await axiosInstance.get("/newsletter/categories ");
    return response.data;
  },
};




