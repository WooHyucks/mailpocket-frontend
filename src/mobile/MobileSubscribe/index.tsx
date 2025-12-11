import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { decodedToken, Token } from "../../api/utils";
import { newsletterApi } from "../../api/newsletter";
import { useCategories } from "../../queries/categories";
import { useNewsletterList, useSubscribeData } from "../../queries/newsletter";
import { QUERY_KEYS } from "../../queries/queryKeys";
import { InfiniteData } from "@tanstack/react-query";
import { NewsletterResponse } from "../../api/newsletter/types";
import { sendEventToAmplitude } from "../../components/Amplitude";
import Nav from "../../components/Nav";
import Symbol from "../../components/Symbol";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import SlackGuideModal from "../../components/Modal/SlackGuideModal";
import { Category } from "../../components/Category";
import Spinner from "../../components/Spinner";
import "../../index.css";
import { NewsLetterDataType } from "../../api/newsletter/types";
import SignIn from "../../components/Modal/SignIn";



const MobileSubscribe = () => {
  const [subscribeable, setSubscribeable] = useState<NewsLetterDataType[]>([]);
  const [newsletterchecked, setNewsLetterChecked] = useState<number[]>([]);
  const [subscribedLocal, setSubscribedLocal] = useState<NewsLetterDataType[]>([]);
  const navigate = useNavigate();
  const [slackGuideOpenModal, setSlackGuideOpenModal] = useState(false);
  const [authOpenModal, setAuthOpenModal] = useState(false);
  const [isActiveMailModal, setIsActiveMailModal] = useState(false);
  const [acitveMailData, setActiveMailData] = useState<NewsLetterDataType | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const authTokenDecode = decodedToken();
  const authToken = Token();
  const ref = useRef<HTMLDivElement | null>(null);
  const pageRef = useIntersectionObserver(ref, {});
  const isPageEnd = pageRef?.isIntersecting;
  const queryClient = useQueryClient();
  const REDIRECT_FLAG_KEY = "mobile-subscribe-initial-redirect";
  const initialRedirectDoneRef = useRef(
    typeof window !== "undefined" && sessionStorage.getItem(REDIRECT_FLAG_KEY) === "true"
  );

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: newsletterListData, isFetching, fetchNextPage, isFetchingNextPage, hasNextPage } = useNewsletterList(activeCategory);
  const newsletterListDataTyped = newsletterListData as InfiniteData<NewsletterResponse & { nextCursor: number | null }> | undefined;
  // 구독중 데이터는 항상 조회 (로그인 여부는 서버에서 검증)
  const {
    data: newslettersubscribe = [],
    isLoading: isLoadingSubscribed,
    isFetching: isFetchingSubscribed,
    isFetched: isFetchedSubscribed,
    refetch: refetchSubscribed,
  } = useSubscribeData("/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking", !!authToken, authToken);

  useEffect(() => {
    if (!authToken) {
      navigate('/landingpage')
    }
    sendEventToAmplitude("view select article", "");
  }, [authToken, navigate]);

  // 토큰이 바뀔 때마다 초기 리다이렉트 여부 리셋 (새 로그인)
  useEffect(() => {
    if (!authToken) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(REDIRECT_FLAG_KEY);
      }
      initialRedirectDoneRef.current = false;
      return;
    }
    initialRedirectDoneRef.current =
      typeof window !== "undefined" && sessionStorage.getItem(REDIRECT_FLAG_KEY) === "true";
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    // 로그인 후에도 항상 구독 목록을 다시 요청
    refetchSubscribed();
  }, [authToken, refetchSubscribed]);

  useEffect(() => {
    if (!authToken) return;
    if (!isFetchedSubscribed || isLoadingSubscribed || isFetchingSubscribed) return;
    // 로그인 직후 최초 한 번만 마이페이지로 이동
    if (initialRedirectDoneRef.current) return;
    if (newslettersubscribe.length > 0) {
      initialRedirectDoneRef.current = true;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(REDIRECT_FLAG_KEY, "true");
      }
      navigate("/mobileMyPage");
    }
  }, [authToken, isFetchedSubscribed, isLoadingSubscribed, isFetchingSubscribed, newslettersubscribe.length, navigate]);

  useEffect(() => {
    if (newsletterListDataTyped?.pages) {
      const allData = newsletterListDataTyped.pages.flatMap((page: NewsletterResponse & { nextCursor: number | null }) => page.data);
      setSubscribeable(allData);
    }
  }, [newsletterListDataTyped]);

  const fetchNext = useCallback(async () => {
    const res = await fetchNextPage();
    if (res.isError) {
      console.log(res.error);
    }
  }, [fetchNextPage]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (isPageEnd && hasNextPage) {
      timerId = setTimeout(() => {
        fetchNext();
      }, 500);
    }
    return () => clearTimeout(timerId);
  }, [fetchNext, isPageEnd, hasNextPage]);


  const handlePostNewsLetterData = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      if (newsletterchecked.length <= 0) {
        alert("뉴스레터를 구독해주세요");
      } else {
        const responesPut = await newsletterApi.putSubscribe({ ids: newsletterchecked });
        if (responesPut.status === 201) {
          sendEventToAmplitude("complete to select article", "")
          sendEventToAmplitude("click add destination", "");
          window.location.href =
            "https://slack.com/oauth/v2/authorize?client_id=6427346365504.6466397212374&scope=incoming-webhook,team:read&user_scope=";
        }
      }
    } catch (error) {
      console.log("Api 데이터 보내기 실패");
    }
  };


  const handleModalOpen = () => {
    if (authTokenDecode === false) {
      setAuthOpenModal(true);
    } else {
      setSlackGuideOpenModal(true);
    }
  };

  const handleNewsLetterSubcribeDataRenewal = useCallback(() => {
    setSubscribedLocal(newslettersubscribe || []);
    const newslettersubscribeId = (newslettersubscribe || []).map((item) => item.id);
    setNewsLetterChecked([...newslettersubscribeId]);
  }, [newslettersubscribe]);

  useEffect(() => {
    handleNewsLetterSubcribeDataRenewal();
  }, [handleNewsLetterSubcribeDataRenewal]);

  return (
    <div className="mx-auto min-h-[100vh] bg-gradient-to-b from-white via-purple-50/20 to-white">
      <Nav setAuthOpenModal={setAuthOpenModal} authTokenDecode={authTokenDecode} />
      <div className="mx-auto max-w-[1200px] mt-4 mb-24 md:mb-10 px-4">
        {isActiveMailModal === true ? (
          <MailModal
            setIsActiveMailModal={setIsActiveMailModal}
            acitveMailData={acitveMailData}
            newslettersubscribe={newslettersubscribe}
            queryClient={queryClient}
            subscribeable={subscribeable}
            setSubscribeable={setSubscribeable}
            activeCategory={activeCategory}
            subscribedLocal={subscribedLocal}
            setSubscribedLocal={setSubscribedLocal}
          ></MailModal>
        ) : (
          ""
        )}
        
        {/* Hero Section */}
        <div className="flex items-center gap-3 mb-6">
          <Symbol />
          <div className="flex-1 bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-4 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              최근 요약 확인하고, 뉴스레터 구독하기
            </p>
            <p className="text-base font-extrabold text-gray-800">
              어떤 뉴스레터를 좋아하시나요?
            </p>
          </div>
        </div>

        {/* Category Section */}
        <div className="flex items-center mt-6 mb-6 whitespace-nowrap overflow-auto subscribe-scrollbar">
          <div className="flex gap-3 mx-2">
            <Category
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
              isLoading={categoriesLoading}
            ></Category>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
          <div className="overflow-y-auto pb-4">
            {/* Subscribed Newsletters - Instagram style */}
            {(isLoadingSubscribed || (isFetchingSubscribed && subscribedLocal.length === 0)) ? (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-customPurple to-purple-600 rounded-full"></div>
                  <h1 className="text-xl font-extrabold text-gray-800">구독중인 뉴스레터</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-customPurple border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <div
                  className="flex overflow-x-auto gap-4 subscribe-scrollbar pb-2"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#8f20ff #f0f0f0" }}
                >
                  {[...Array(6)].map((_, idx) => (
                    <div
                      key={`mobile-subscribed-skeleton-${idx}`}
                      className="flex flex-col items-center gap-2 w-[72px] flex-shrink-0"
                    >
                      <div className="p-[2px] rounded-full bg-gradient-to-br from-purple-100 to-purple-50 shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
                      </div>
                      <div className="w-12 h-3 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : subscribedLocal.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-customPurple to-purple-600 rounded-full"></div>
                  <h1 className="text-xl font-extrabold text-gray-800">구독중인 뉴스레터</h1>
                  <span className="ml-2 px-2 py-0.5 bg-customPurple/10 text-customPurple text-xs font-bold rounded-full">
                    {subscribedLocal.length}
                  </span>
                </div>
                <div
                  className="flex overflow-x-auto gap-4 subscribe-scrollbar pb-2"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#8f20ff #f0f0f0" }}
                >
                  {subscribedLocal.map((data) => (
                    <div
                      key={data.id}
                      className="flex flex-col items-center gap-2 w-[72px] flex-shrink-0 cursor-pointer"
                      onClick={() => {
                        setActiveMailData(data);
                        setIsActiveMailModal(true);
                      }}
                    >
                      <div className="p-[2px] rounded-full bg-gradient-to-br from-customPurple to-purple-400 shadow-md">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white">
                          <img
                            className="w-full h-full object-cover"
                            src={`/images/${data.name}.png`}
                            alt={data.name}
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-800 font-semibold leading-tight text-center line-clamp-2 px-1">
                        {data.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              ""
            )}

            {/* Available Newsletters */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-customPurple to-purple-600 rounded-full"></div>
                <h1 className="text-xl font-extrabold text-gray-800">
                  구독 가능한 뉴스레터
                </h1>
              </div>
              {isFetching && subscribeable.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <Spinner />
                </div>
              ) : !isFetching && subscribeable.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-gradient-to-br from-purple-50/50 to-white p-8 rounded-2xl border border-purple-100 shadow-sm max-w-md w-full text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-base font-extrabold text-gray-800 mb-2">
                      아직 해당 뉴스레터가 도착하지 않았어요
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      해당 카테고리의 뉴스레터가 준비되면 알려드릴게요. 🔔
                    </p>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-4">
                {subscribeable
                  .filter((data) => data && data.id && !subscribedLocal.some((subscribed) => subscribed && subscribed.id === data.id))
                  .map((data) => (
                    <div key={data.id} className="w-full">
                      <NewsLetter
                        setActiveMailData={setActiveMailData}
                        setIsActiveMailModal={setIsActiveMailModal}
                        data={data}
                      ></NewsLetter>
                    </div>
                  ))}
                {(isFetching || isFetchingNextPage) && subscribeable.length > 0 && (
                  <>
                    {[...Array(3)].map((_, idx) => (
                      <div
                        key={`newsletter-skeleton-${idx}`}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-full min-w-[100px] h-[140px] animate-pulse"
                      >
                        <div className="mb-3 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-sm"></div>
                          <div className="size-12 rounded-full relative z-10 border-2 border-white shadow-md bg-gray-200"></div>
                        </div>
                        <div className="w-full text-center space-y-2">
                          <div className="mx-auto h-3 w-[70%] rounded bg-gray-200"></div>
                          <div className="mx-auto h-3 w-[55%] rounded bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              )}
              {/* Loading Spinner */}
              {(isFetchingNextPage || (isFetching && subscribeable.length > 0)) && (
                <div className="col-span-3 flex justify-center items-center py-8 mt-4">
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100">
            <button
              className="h-[60px] w-full bg-gradient-to-r from-customPurple to-purple-600 text-white text-base font-bold hover:from-purple-600 hover:to-customPurple transition-all duration-300 shadow-lg"
              onClick={handleModalOpen}
            >
              선택 완료
            </button>
          </div>
        </div>
      </div>
      {authOpenModal && (
        <SignIn setAuthOpenModal={setAuthOpenModal} />
      )}
      {slackGuideOpenModal && (
        <SlackGuideModal
          setSlackGuideOpenModal={setSlackGuideOpenModal}
          handlePostNewsLetterData={handlePostNewsLetterData}
          subscribelength={newslettersubscribe.length}
        />
      )}
      <div className="w-full touch-none h-10 mb-10" ref={ref}></div>
    </div>
  );
};

const NewsLetter = ({ data, setActiveMailData, setIsActiveMailModal }: any) => {
  return (
    <div
      onClick={() => {
        setActiveMailData(data);
        setIsActiveMailModal(true);
      }}
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 w-full min-w-[100px] h-[140px]"
      key={data.id}
    >
      <div className="mb-3 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-customPurple/20 to-purple-200/20 rounded-full blur-sm"></div>
        <img
          src={"../images/" + data.name + ".png"}
          className="size-12 rounded-full relative z-10 border-2 border-white shadow-md"
          alt={data.name}
        />
      </div>
      <div className="w-full text-center">
        <span className="font-semibold text-xs text-gray-700 inline-block break-words line-clamp-2 px-1">
          {data.name}
        </span>
      </div>
    </div>
  );
};

const MailModal = ({
  setIsActiveMailModal,
  acitveMailData,
  newslettersubscribe,
  queryClient,
  subscribeable,
  setSubscribeable,
  activeCategory,
  subscribedLocal,
  setSubscribedLocal,
}: any) => {
  const [isSub, setIsSub] = useState(false);

  const hasId = useCallback((): boolean => {
    if (!acitveMailData) return false;
    return newslettersubscribe.some((subscribe: any) => subscribe.id === acitveMailData.id);
  }, [newslettersubscribe, acitveMailData]);

  const deleteSubscribe = (
    subscribeToDelete: NewsLetterDataType,
    subScribeList: Array<NewsLetterDataType>
  ) => {
    return subScribeList.filter((newLetter: NewsLetterDataType) => {
      return newLetter.id !== subscribeToDelete.id;
    });
  };

  useEffect(() => {
    if (!acitveMailData) return;
    setIsSub(hasId());
  }, [hasId, acitveMailData]);

  if (!acitveMailData) return null;

  return (
    <div className="w-full h-full fixed top-0 left-0 z-50">
      <div 
        className="h-full bg-black/50 backdrop-blur-sm"
        onClick={() => setIsActiveMailModal(false)}
      >
        <div 
          className="w-[90%] max-w-[500px] h-[600px] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsActiveMailModal(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <img src="/images/close.svg" alt="닫기" className="size-4" />
          </button>

          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-customPurple/30 to-purple-200/30 rounded-full blur-sm"></div>
                <img
                  className="size-12 rounded-full relative z-10 border-2 border-white shadow-md"
                  src={"../images/" + acitveMailData.name + ".png"}
                  alt={acitveMailData.name}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-extrabold text-gray-800">{acitveMailData.name}</h2>
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 ${acitveMailData.mail ? "overflow-y-auto" : "overflow-hidden"} mb-4`}>
              <div className="font-extrabold text-base mb-4 text-gray-800">
                {acitveMailData.mail
                  ? acitveMailData.mail.subject
                  : "해당 뉴스레터의 새 소식을 기다리고 있어요."}
              </div>
              <div className="flex flex-col gap-4">
                {acitveMailData.mail ? (
                  Object.entries(acitveMailData.mail.summary_list).map(
                    ([key, value]: any, index) => {
                      return (
                        <div key={index} className="bg-gradient-to-br from-purple-50/50 to-white p-4 rounded-xl border border-purple-100">
                          <div className="font-extrabold text-sm text-customPurple mb-2">{key}</div>
                          <div className="font-semibold text-sm text-gray-700 leading-relaxed">{value}</div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="bg-gradient-to-br from-purple-50/50 to-white p-6 rounded-xl border border-purple-100 text-center">
                    <p className="font-semibold text-sm text-gray-600">
                      소식이 생기면 메일포켓이 빠르게 요약해서 전달해드릴게요
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              {isSub ? (
                <button
                  onClick={async () => {
                    setIsSub(false);
                    try {
                      await newsletterApi.readPageUnSubscribe(
                        acitveMailData.id
                      );
                      const result = deleteSubscribe(
                        acitveMailData,
                        subscribedLocal
                      );

                      setSubscribedLocal(result);
                      queryClient.setQueryData(
                        [QUERY_KEYS.NEWSLETTER_LIST, "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"],
                        result
                      );
                      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWSLETTER_LIST] });
                      if (
                        activeCategory === 0 ||
                        activeCategory === acitveMailData.category
                      ) {
                        setSubscribeable((prev: any) => [
                          ...prev,
                          acitveMailData,
                        ]);
                      }
                      sendEventToAmplitude("select article", {
                        "unselect article": acitveMailData.name,
                      });
                    } catch (error) {
                      setIsSub(true);
                    }
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white w-full py-3 rounded-xl font-bold transition-colors duration-200 shadow-md"
                >
                  구독해제
                </button>
              ) : (
                <button
                  onClick={async () => {
                    setIsActiveMailModal(false);
                    setIsSub(true);
                    try {
                        await newsletterApi.readPageSubscribe(
                        acitveMailData.id
                      );
                      // optimistic: remove from subscribable list
                      const result = deleteSubscribe(
                        acitveMailData,
                        subscribeable
                      );
                      setSubscribeable(result);
                      // optimistic: add to subscribed cache + local state
                      setSubscribedLocal((prev: NewsLetterDataType[]) => {
                        if (prev.find((item) => item.id === acitveMailData.id)) return prev;
                        return [acitveMailData, ...prev];
                      });
                      queryClient.setQueryData(
                        [QUERY_KEYS.NEWSLETTER_LIST, "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"],
                        (oldData: NewsLetterDataType[] = []) => {
                          if (oldData.find((item) => item.id === acitveMailData.id)) return oldData;
                          return [acitveMailData, ...oldData];
                        }
                      );
                      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWSLETTER_LIST] });
                      sendEventToAmplitude("select article", {
                        "article name": acitveMailData.name,
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  className="bg-gradient-to-r from-customPurple to-purple-600 hover:from-purple-600 hover:to-customPurple text-white w-full py-3 rounded-xl font-bold transition-all duration-200 shadow-md"
                >
                  구독하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSubscribe;