import { useQuery } from "@tanstack/react-query";
import { channelApi } from "../../api/channel";
import { QUERY_KEYS } from "../queryKeys";

export const useChannelData = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNELS, query],
    queryFn: () => channelApi.getChannelData(query).then((response) => response.data),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};





