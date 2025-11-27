import { useQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { QUERY_KEYS } from "../queryKeys";

export const useMailDetail = (s3_object_key: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NEWSLETTER_DETAIL, s3_object_key],
    queryFn: () => newsletterApi.getMailDetail(s3_object_key!).then((response) => response.data),
    enabled: enabled && !!s3_object_key,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};





