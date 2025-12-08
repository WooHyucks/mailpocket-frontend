import { useQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { NewsLetterDataType } from "../../api/newsletter/types";
import { QUERY_KEYS } from "../queryKeys";

export const useSubscribeData = (query: string, enabled: boolean = true) => {
  return useQuery<NewsLetterDataType[]>({
    queryKey: [QUERY_KEYS.NEWSLETTER_LIST, query],
    queryFn: () => newsletterApi.getSubscribeData(query).then((response) => response.data),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};






