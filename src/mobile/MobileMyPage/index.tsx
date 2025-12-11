import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { decodedToken, Token } from "../../api/utils";
import { useSubscribeData } from "../../queries/newsletter";
import { newsletterApi } from "../../api/newsletter";
import { QUERY_KEYS } from "../../queries/queryKeys";
import { sendEventToAmplitude } from "../../components/Amplitude";
import { MobileMyPageNav } from "../../components/mobileComponent/MobileNav";
import MobileSummary from "../../components/mobileComponent/MobileSummary";
import PageLoding from "../../components/PageLoding";
import { SummaryItem } from "../../api/newsletter/types";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "../../components/Toast";

export interface NavNewsLetterDataType {
  id: number;
  s3_object_key: string;
  name: string;
  created_at: string;
  subject: string;
  updated_at: string;
  read_link: string;
  summary_list: SummaryItem;
  newsletter_id: number;
  date: string;
  from_name: string;
  from_email: string;
  html_body: string;
}

const MobileMyPage = () => {
  const [myNewsLetterDetailKey, setMyNewsLetterDetailKey] = useState("");
  const [myNewsLetterDetail, setMyNewsLetterDetail] = useState<NavNewsLetterDataType[]>([]);
  const [selectedItem, setSelectedItem] = useState(0);
  const [activeMail, setActiveMail] = useState(0);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const navigate = useNavigate();
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const mainRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const showToast = useToast();

  const {
    data: myNewsLetter = [],
    isLoading: isLoadingNewsLetters,
    isFetching: isFetchingNewsLetters,
    isFetched: isFetchedNewsLetters,
  } = useSubscribeData(
    "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking",
    !!authToken && authTokenDecode !== false
  );


  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeMail]);




  useEffect(() => {
    if (!authToken || authTokenDecode === false) {
      navigate("/landingpage");
    } else {
      sendEventToAmplitude("view my page", "");
      // 로딩/패칭이 완전히 끝난 후에만 빈 상태 처리
      if (!isLoadingNewsLetters && !isFetchingNewsLetters && isFetchedNewsLetters) {
        if (myNewsLetter.length === 0) {
          showToast("구독중인 뉴스레터가 없습니다.", { type: "info" });
          navigate("/mobileSubscribe");
        }
      }
    }
  }, [
    authToken,
    authTokenDecode,
    navigate,
    isLoadingNewsLetters,
    isFetchingNewsLetters,
    isFetchedNewsLetters,
    myNewsLetter,
    showToast,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (myNewsLetter.length > 0) {
        setIsLoadingDetail(true);
        try {
          const query = myNewsLetterDetailKey 
            ? `/mail?key=${myNewsLetterDetailKey}` 
            : `/newsletter/${myNewsLetter[0].id}/last-mail`;
          
          const data = await queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.NEWSLETTER_DETAIL, query],
            queryFn: () => newsletterApi.getMyPageNewsLetterDetail(query).then((response) => response.data),
            staleTime: 1000 * 60 * 5,
          });
          
          setMyNewsLetterDetail([data]);
          sendEventToAmplitude("view article detail", {
            "article name": data.from_name,
            "post name": data.subject,
          });
        } catch (error) {
          console.log("Api 데이터 불러오기 실패", error);
        } finally {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchData();
  }, [myNewsLetterDetailKey, myNewsLetter, queryClient]);

  return (
    <div className="h-[100vh] overflow-auto custom-scrollbar" ref={mainRef}>
      <MobileMyPageNav
        MayPageNavNewsLetterData={myNewsLetterDetail}
        mynewsletter={myNewsLetter}
        onSelectItem={setSelectedItem}
        selectItemId={selectedItem}
        setMyNewsLetterDetailKey={setMyNewsLetterDetailKey}
        setActiveMail={setActiveMail}
        activeMail={activeMail}
        isLoading={isLoadingNewsLetters || isLoadingDetail}
      />
      <div className="mx-3 h-full" ref={mainRef}>
        {isLoadingDetail ? (
          <>
            <div className="flex flex-col gap-4 mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <div className="flex items-center gap-3 mt-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="mt-10 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-[95%]" />
              <Skeleton className="h-5 w-[90%]" />
              <Skeleton className="h-48 w-full mt-4 rounded-lg" />
              <Skeleton className="h-5 w-full mt-6" />
              <Skeleton className="h-5 w-[85%]" />
              <Skeleton className="h-48 w-full mt-4 rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <MobileSummary summaryNewsLetterData={myNewsLetterDetail} />
            {myNewsLetterDetail.map((data) => {
              return data.html_body !== null ? (
                <div
                  key={data.id}
                  className="mt-10 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: data.html_body }}
                />
              ) : (
                <PageLoding />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMyPage;
