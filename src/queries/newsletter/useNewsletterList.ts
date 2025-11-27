import { useInfiniteQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { Params, NewsletterResponse } from "../../api/newsletter/types";
import { QUERY_KEYS } from "../queryKeys";

export const useNewsletterList = (category: number = 0) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.NEWSLETTER_LIST, category],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => {
      let params: Params = {
        in_mail: true,
        subscribe_status: "subscribable",
        sort_type: "ranking",
      };

      // cursor가 있으면 추가 (첫 페이지는 cursor 없음)
      if (pageParam !== undefined) {
        params.cursor = String(pageParam);
      }

      if (category !== 0) {
        params.category_id = category;
      }

      return newsletterApi.getNewsletterData("/newsletter", params).then((response) => {
        // API 응답 구조 확인
        // response.data가 배열인지 객체인지 확인
        let dataArray: any[] = [];
        
        if (Array.isArray(response.data)) {
          // response.data가 직접 배열인 경우
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // response.data가 { data: [...] } 형태인 경우
          dataArray = (response.data as NewsletterResponse).data || [];
        }
        
        return {
          data: dataArray,
        };
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // 모든 페이지의 데이터 개수를 합산하여 다음 cursor 계산
      // 첫 페이지: 0개 → 다음 cursor = 8 (8개 받음)
      // 두 번째: 8개 → 다음 cursor = 16 (8개 더 받음)
      // 세 번째: 16개 → 다음 cursor = 24 (8개 더 받음)
      const totalCount = allPages.reduce((sum, page) => {
        return sum + (page.data?.length || 0);
      }, 0);
      
      // 마지막 페이지에 데이터가 있고, 8개를 받았으면 다음 페이지가 있음
      const lastPageDataCount = lastPage.data?.length || 0;
      if (lastPageDataCount > 0) {
        return totalCount;
      }
      return undefined;
    },
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

