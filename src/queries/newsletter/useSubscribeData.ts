import { useQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { NewsLetterDataType } from "../../api/newsletter/types";
import { QUERY_KEYS } from "../queryKeys";

export const useSubscribeData = (query: string, enabled: boolean = true, extraKey?: unknown) => {
  return useQuery<NewsLetterDataType[]>({
    queryKey: [QUERY_KEYS.NEWSLETTER_LIST, query, extraKey],
    queryFn: () =>
      newsletterApi.getSubscribeData(query).then((response) => {
        if (Array.isArray(response.data)) return response.data as NewsLetterDataType[];
        if (response.data && Array.isArray((response.data as any).data)) {
          return (response.data as any).data as NewsLetterDataType[];
        }
        return [] as NewsLetterDataType[];
      }),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};






