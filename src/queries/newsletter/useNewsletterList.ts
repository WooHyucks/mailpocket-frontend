import { useInfiniteQuery } from "@tanstack/react-query";
import { newsletterApi } from "../../api/newsletter";
import { Params, NewsletterResponse } from "../../api/newsletter/types";
import { QUERY_KEYS } from "../queryKeys";

export const useNewsletterList = (category: number = 0) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.NEWSLETTER_LIST, category],
    queryFn: async ({ pageParam = null }) => {
      let params: Params = {
        in_mail: true,
        subscribe_status: "subscribable",
        sort_type: "ranking",
      };

      // cursor가 있으면 추가 (첫 페이지는 cursor 없음)
      if (pageParam !== undefined && pageParam !== null) {
        params.cursor = String(pageParam);
      }

      if (category !== 0) {
        params.category_id = category;
      }

      try {
        const response = await newsletterApi.getNewsletterData("/newsletter", params);

        // API 응답 구조 확인
        // response.data가 배열인지 객체인지 확인
        let dataArray: any[] = [];
        let nextCursor: string | null | undefined = undefined;
        
        if (Array.isArray(response.data)) {
          // response.data가 직접 배열인 경우
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // response.data가 { data: [...], nextCursor: ... } 형태인 경우
          if ('data' in response.data) {
            dataArray = (response.data as NewsletterResponse).data || [];
          }
          if ('nextCursor' in response.data) {
            nextCursor = (response.data as NewsletterResponse).nextCursor;
          }
        }
        
        // response 자체에 nextCursor가 있는 경우도 확인
        if (nextCursor === undefined && response.data && typeof response.data === 'object' && 'nextCursor' in response.data) {
          nextCursor = (response.data as any).nextCursor;
        }
        
        return {
          data: Array.isArray(dataArray) ? dataArray : [],
          nextCursor: nextCursor,
        };
      } catch (error) {
        // 실패 시에도 구조를 보장해 getNextPageParam에서 undefined 접근을 방지
        return { data: [], nextCursor: undefined };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // lastPage가 없거나 객체가 아니면 종료
      if (!lastPage || typeof lastPage !== "object") return undefined;

      const dataArray = Array.isArray((lastPage as any).data) ? (lastPage as any).data : [];
      const nextCursorValue = (lastPage as any).nextCursor;

      // 서버 nextCursor가 있으면 그대로 사용
      if (nextCursorValue !== undefined && nextCursorValue !== null) {
        const next = Number(nextCursorValue);
        return Number.isNaN(next) ? undefined : next;
      }

      // 데이터가 없거나 비어있으면 종료
      if (!dataArray || dataArray.length === 0) {
        return undefined;
      }

      // 백엔드 nextCursor가 없을 때, 누적 개수 기반 커서(8개 페이징 기준)로 추론
      const totalCount = Array.isArray(allPages)
        ? allPages.reduce((sum, page: any) => {
            const arr = Array.isArray(page?.data) ? page.data : [];
            return sum + arr.length;
          }, 0)
        : 0;

      // 마지막 페이지가 8개 미만이면 더 이상 없음
      if (dataArray.length < 8) return undefined;

      return totalCount;
    },
    initialPageParam: null as number | null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

