import { useQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { QUERY_KEYS } from "../queryKeys";

export const useReadMailData = (mailKey: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NEWSLETTER_DETAIL, mailKey],
    queryFn: () => newsletterApi.getReadMailData(mailKey).then((response) => response.data),
    enabled: enabled && !!mailKey,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};






