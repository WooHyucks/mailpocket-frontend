import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../api/Auth";
import { QUERY_KEYS } from "../queryKeys";

export const useUserData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: () => authApi.getUserData().then((response) => response.data),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};


