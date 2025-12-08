import { useQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { QUERY_KEYS } from "../queryKeys";

export const useMail = (newsletter_id: number | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NEWSLETTER_DETAIL, newsletter_id],
    queryFn: () => newsletterApi.getMail(newsletter_id).then((response) => response.data),
    enabled: enabled && !!newsletter_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};






