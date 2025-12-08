import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sendEventToAmplitude } from "../../components/Amplitude";
import Nav from "../../components/Nav";
import Symbol from "../../components/Symbol";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import SlackGuideModal from "../../components/Modal/SlackGuideModal";
import { Category } from "../../components/Category";
import Spinner from "../../components/Spinner";
import { isMobile } from "../../App";
import SignIn from "../../components/Modal/SignIn";
import { useCategories } from "../../queries/categories";
import { useNewsletterList, useSubscribeData } from "../../queries/newsletter";
import { newsletterApi } from "../../api/newsletter";
import { NewsLetterDataType } from "../../api/newsletter/types";
import { Token, decodedToken } from "../../api/utils";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../queries/queryKeys";


const Subscribe = () => {
  const [subscribeable, setSubscribeable] = useState<NewsLetterDataType[]>([]);
  const [seeMoreStates, setSeeMoreStates] = useState<{ [id: number]: boolean }>({});
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<Record<number, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();
  const [authOpenModal, setAuthOpenModal] = useState(false);
  const [slackGuideOpenModal, setSlackGuideOpenModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const authTokenDecode = decodedToken();
  const authToken = Token();
  const ref = useRef<HTMLDivElement | null>(null);
  const pageRef = useIntersectionObserver(ref, {});
  const isPageEnd = pageRef?.isIntersecting;

  const { data: newsletterListData, isFetching, fetchNextPage, isFetchingNextPage, hasNextPage } = useNewsletterList(activeCategory);
  const { data: newslettersubscribe = [] } = useSubscribeData(
    "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking",
    !!authToken
  );
  const subscribelength = newslettersubscribe.length;

  const handleNewsLetterSeeMoreSelect = (newsletterid: number) => {
    setSeeMoreStates((prevStates) => ({
      ...prevStates,
      [newsletterid]: !prevStates[newsletterid],
    }));
  };

  useEffect(() => {
    if (isMobile) {
      navigate("/mobileSubscribe");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!authToken) {
      navigate('/landingpage');
    }
    sendEventToAmplitude("view select article", "");
  }, [authToken, navigate]);

  useEffect(() => {
    if (newsletterListData?.pages) {
      const allData = newsletterListData.pages.flatMap((page: any) => page.data || []);
      setSubscribeable(allData);
    } else {
      setSubscribeable([]);
    }
  }, [newsletterListData]);

  // 구독중인 뉴스레터 초기 상태 설정
  useEffect(() => {
    if (newslettersubscribe.length > 0) {
      setSubscriptionStatusMap((prevMap) => {
        const newSubscriptionStatusMap: Record<number, boolean> = { ...prevMap };
        newslettersubscribe.forEach((newsletter) => {
          // 구독중인 뉴스레터는 기본적으로 true (구독중 상태)
          // subscriptionStatusMap에 이미 false로 설정된 값이 있으면 유지, 없으면 true로 설정
          if (newSubscriptionStatusMap[newsletter.id] === undefined) {
            newSubscriptionStatusMap[newsletter.id] = true;
          }
        });
        return newSubscriptionStatusMap;
      });
    }
  }, [newslettersubscribe]);

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
      if (subscribelength <= 0) {
        alert("뉴스레터를 구독해주세요");
      } else {
        await sendEventToAmplitude("complete to select article", "");
        await sendEventToAmplitude("click add destination", "");
        const url = "https://slack.com/oauth/v2/authorize?client_id=6427346365504.6466397212374&scope=incoming-webhook,team:read&user_scope=";
        window.open(url, "_blank");
      }
    } catch (error) {
      console.log("Api 데이터 보내기 실패");
    }
  };

  const handleNewsLetterSelected = async (
    newsletterId: number,
    bool: boolean,
    newslettername: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageSubscribe(newsletterId);
      if (response.status === 201) {
        // 구독하기를 했으므로 항상 true로 설정
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: true,
        }));
        
        // 구독 가능한 목록에서 해당 뉴스레터 찾기
        const newsletterToMove = subscribeable.find((item) => item.id === newsletterId);
        
        if (newsletterToMove) {
          // 구독 가능한 목록에서 제거
          setSubscribeable((prev) => prev.filter((item) => item.id !== newsletterId));
          
          // 구독중인 목록 쿼리 업데이트
          queryClient.setQueryData<NewsLetterDataType[]>(
            [QUERY_KEYS.NEWSLETTER_LIST, "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"],
            (oldData = []) => {
              if (!oldData.find((item) => item.id === newsletterId)) {
                return [...oldData, newsletterToMove];
              }
              return oldData;
            }
          );
        }
        
        // 구독중인 목록 쿼리 무효화하여 refetch
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.NEWSLETTER_LIST, "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"] 
        });
      }
      sendEventToAmplitude("select article", {
        "article name": newslettername,
      });
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  const handleNewsLetterUnSelected = async (
    newsletterId: number,
    bool: boolean,
    newslettername: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageUnSubscribe(newsletterId);
      if (response.status === 204) {
        // 구독해제를 했으므로 항상 false로 설정
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: false,
        }));
        
        // 구독중인 목록에서 해당 뉴스레터 찾기
        const newsletterToMove = newslettersubscribe.find((item) => item.id === newsletterId);
        
        if (newsletterToMove) {
          // 구독중인 목록 쿼리 업데이트 (제거)
          queryClient.setQueryData<NewsLetterDataType[]>(
            [QUERY_KEYS.NEWSLETTER_LIST, "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"],
            (oldData = []) => oldData.filter((item) => item.id !== newsletterId)
          );
          
          // 구독 가능한 목록에 추가 (현재 카테고리와 일치하는 경우만)
          if (activeCategory === 0 || Number(newsletterToMove.category) === activeCategory) {
            setSubscribeable((prev) => {
              if (!prev.find((item) => item.id === newsletterId)) {
                return [...prev, newsletterToMove];
              }
              return prev;
            });
          }
        }
        
        // 구독중인 목록 쿼리 무효화하여 refetch
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.NEWSLETTER_LIST, "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"] 
        });
      }
      sendEventToAmplitude("unselect article", {
        "article name": newslettername,
      });
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };


  const handleModalOpen = () => {
    if (authTokenDecode === false) {
      setAuthOpenModal(true);
    } else {
      setSlackGuideOpenModal(true);
    }
  };

  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substring(0, n) + "..." : str;
  };

  return (
    <div className="mx-auto h-auto bg-whitesmoke   min-h-screen">
      <Nav setAuthOpenModal={setAuthOpenModal} authTokenDecode={authTokenDecode} />
      <div className="mx-auto max-w-[1200px] mt-6 md:mt-10 mb-14 md:mb-10 px-4 md:px-0">
        {/* Header Section */}
        <div className="flex flex-row md:flex-col justify-between items-center md:gap-4 gap-8 mb-6">
          <div className="flex gap-3 items-center">
            <Symbol />
            <div className="flex-1 bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-4 rounded-xl shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                최근 요약 확인하고, 뉴스레터 구독하기
              </p>
              <p className="text-base md:text-sm font-extrabold text-gray-800">
                어떤 뉴스레터를 좋아하시나요?
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <button
              className="h-[45px] rounded-xl border-none bg-gradient-to-r from-customPurple to-purple-600 text-white text-base font-bold w-[150px] hover:from-purple-600 hover:to-customPurple transition-all duration-300 shadow-lg"
              onClick={handleModalOpen}
            >
              선택 완료
            </button>
          </div>
        </div>
        <div className="mt-6">
          <div className="overflow-y-auto">
            <div className="md:p-3">
              {Object.keys(newslettersubscribe).length > 0 ? (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-gradient-to-b from-customPurple to-purple-600 rounded-full"></div>
                    <h1 className="text-xl md:text-lg font-extrabold text-gray-800">
                      구독중인 뉴스레터
                    </h1>
                    <span className="ml-2 px-2 py-0.5 bg-customPurple/10 text-customPurple text-xs font-bold rounded-full">
                      {newslettersubscribe.length}
                    </span>
                  </div>
                  <div
                    className="flex overflow-x-auto gap-4 custom-scrollbar-horizontal pb-[15px] cursor-pointer"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#8f20ff #f0f0f0' }}
                  >
                    {newslettersubscribe.map((data) => (
                      <div
                        className="flex-shrink-0 w-[285px] md:w-[285px] flex flex-col border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        key={`subscribed-${data.id}`}
                      >
                        <div className="relative bg-gradient-to-br from-purple-50/50 to-white">
                          <div className="border-b border-gray-200 min-h-[80px] flex items-center p-4">
                            <p className="font-extrabold text-sm md:text-base text-gray-800 leading-relaxed">
                              {data.mail
                                ? truncate(data.mail.subject, 35)
                                : "해당 뉴스레터의 새 소식을 기다리고 있어요."}
                            </p>
                          </div>
                          <div
                            className={`h-[250px] w-full md:w-[285px] mb-7 ${seeMoreStates[data.id]
                              ? "overflow-y-auto"
                              : "overflow-hidden"
                              } text-ellipsis custom-scrollbar px-5 py-4`}
                          >
                            {data.mail && data.mail.summary_list ? (
                              Object.entries(data.mail.summary_list).map(
                                ([key, value]) => (
                                  <div className="mb-4 last:mb-0" key={key}>
                                    <div className="bg-gradient-to-br from-purple-50/50 to-white p-4 rounded-xl border border-purple-100">
                                      <p className="font-extrabold text-sm text-customPurple mb-2">{key}</p>
                                      <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                                        {String(value)}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="bg-gradient-to-br from-purple-50/50 to-white p-6 rounded-xl border border-purple-100 text-center">
                                <p className="text-sm text-gray-600 font-semibold">
                                  소식이 생기면 메일포켓이 빠르게 요약해서
                                  전달해드릴게요.
                                </p>
                              </div>
                            )}
                            {data.mail && data.mail.summary_list && (
                            <div className="absolute bottom-0 left-0 right-0">
                            <button
                              className="w-full md:py-2 flex justify-center border border-y bg-white  items-center text-blue-500 text-sm md:text-xs font-bold hover:text-blue-600"
                              onClick={() =>
                                handleNewsLetterSeeMoreSelect(data.id)
                              }
                            >
                              {seeMoreStates[data.id] ? "닫기" : "더보기"}
                            </button>
                          </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-4   bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-customPurple/20 to-purple-200/20 rounded-full blur-sm"></div>
                              <img
                                className="w-10 h-10 rounded-full relative z-10 border-2 border-white shadow-md"
                                src={`/images/${data.name}.png`}
                                alt="newslettericon"
                              />
                            </div>
                            <span className="font-bold text-sm text-gray-800 md:w-[55px]">
                              {data.name}
                            </span>
                          </div>
                          {subscriptionStatusMap[data.id] === false ? (
                            <button
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-customPurple to-purple-600 text-white text-xs font-bold cursor-pointer hover:from-purple-600 hover:to-customPurple transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                              onClick={() =>
                                handleNewsLetterSelected(data.id, false, data.name)
                              }
                              disabled={loadingStates[data.id]}
                            >
                              {loadingStates[data.id] ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>구독하기</span>
                                </>
                              ) : (
                                "구독하기"
                              )}
                            </button>
                          ) : (
                            <button
                              className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-200 text-gray-500 text-xs font-bold cursor-pointer hover:bg-gray-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                              onClick={() =>
                                handleNewsLetterUnSelected(data.id, true, data.name)
                              }
                              disabled={loadingStates[data.id]}
                            >
                              {loadingStates[data.id] ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span>구독해제</span>
                                </>
                              ) : (
                                "구독해제"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex items-center mt-8 mb-6 whitespace-nowrap overflow-auto subscribe-scrollbar">
              <div className="flex gap-3 mx-2">
                <Category
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  categories={categories}
                  isLoading={categoriesLoading}
                ></Category>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-customPurple to-purple-600 rounded-full"></div>
              <h1 className="text-xl md:text-lg font-extrabold text-gray-800">
                구독 가능한 뉴스레터
              </h1>
              {isFetching && (
                <div className="ml-2">
                  <div className="w-4 h-4 border-2 border-customPurple border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {isFetching && subscribeable.length === 0 ? (
              <div className="flex justify-center items-center py-10">
                <Spinner />
              </div>
            ) : !isFetching && subscribeable.filter((data) => data && data.id && !newslettersubscribe.some((subscribed) => subscribed && subscribed.id === data.id)).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-gradient-to-br from-purple-50/50 to-white p-8 rounded-2xl border border-purple-100 shadow-sm max-w-md w-full text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-base md:text-lg font-extrabold text-gray-800 mb-2">
                    아직 뉴스레터가 도착하지 않았어요
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    새로운 뉴스레터가 준비되면 알려드릴게요. 🔔
                  </p>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-4 md:grid-cols-1 gap-4 md:gap-5 items-start">
              {subscribeable
                .filter((data) => data && data.id && !newslettersubscribe.some((subscribed) => subscribed && subscribed.id === data.id))
                .map((data, index) => (
                <div
                  className="flex flex-col justify-between w-full border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  key={`subscribable-${data.id}-${index}`}
                >
                  <div className="relative bg-gradient-to-br from-purple-50/50 to-white">
                    <div className="border-b border-gray-200 min-h-[75px] flex items-center p-4">
                      <p className="font-extrabold text-sm md:text-base text-gray-800 leading-relaxed">
                        {data.mail
                          ? truncate(data.mail.subject, 35)
                          : "해당 뉴스레터의 새 소식을 기다리고 있어요."}
                      </p>
                    </div>
                    <div
                      className={`h-[250px] mb-7 ${seeMoreStates[data.id]
                        ? "overflow-y-auto"
                        : "overflow-hidden"
                        } custom-scrollbar px-5 py-4`}
                    >
                      {data.mail && data.mail.summary_list ? (
                        Object.entries(data.mail.summary_list).map(
                          ([key, value]) => (
                            <div className="mb-4 last:mb-0" key={key}>
                              <div className="bg-gradient-to-br from-purple-50/50 to-white p-4 rounded-xl border border-purple-100">
                                <p className="font-extrabold text-sm text-customPurple mb-2">{key}</p>
                                <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                                  {String(value)}
                                </p>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="bg-gradient-to-br from-purple-50/50 to-white p-6 rounded-xl border border-purple-100 text-center">
                          <p className="text-sm text-gray-600 font-semibold">
                            소식이 생기면 메일포켓이 빠르게 요약해서
                            전달해드릴게요.
                          </p>
                        </div>
                      )}
                      {data.mail && data.mail.summary_list && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <button
                            className="w-full md:py-2 flex justify-center border border-y bg-white  items-center text-blue-500 text-sm md:text-xs font-bold hover:text-blue-600"
                            onClick={() =>
                              handleNewsLetterSeeMoreSelect(data.id)
                            }
                          >
                            {seeMoreStates[data.id] ? "닫기" : "더보기"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-customPurple/20 to-purple-200/20 rounded-full blur-sm"></div>
                        <img
                          className="w-10 h-10 rounded-full relative z-10 border-2 border-white shadow-md"
                          src={`/images/${data.name}.png`}
                          alt="newslettericon"
                        />
                      </div>
                      <span className="font-bold text-sm text-gray-800 md:w-[55px]">
                        {data.name}
                      </span>
                    </div>
                    {subscriptionStatusMap[data.id] ? (
                      <button
                        className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-200 text-gray-500 text-xs font-bold cursor-pointer hover:bg-gray-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={() =>
                          handleNewsLetterUnSelected(data.id, false, data.name)
                        }
                        disabled={loadingStates[data.id]}
                      >
                        {loadingStates[data.id] ? (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>구독해제</span>
                          </>
                        ) : (
                          "구독해제"
                        )}
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-customPurple to-purple-600 text-white text-xs font-bold cursor-pointer hover:from-purple-600 hover:to-customPurple transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={() =>
                          handleNewsLetterSelected(data.id, true, data.name)
                        }
                        disabled={loadingStates[data.id]}
                      >
                        {loadingStates[data.id] ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>구독하기</span>
                          </>
                        ) : (
                          "구독하기"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
          {/* Desktop Button */}
          <div className="block md:hidden fixed bottom-[25px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              className="h-[45px] rounded-xl bg-gradient-to-r from-customPurple to-purple-600 text-white text-base font-bold w-[150px] hover:from-purple-600 hover:to-customPurple transition-all duration-300 shadow-lg"
              onClick={handleModalOpen}
            >
              선택 완료
            </button>
          </div>
          {/* Mobile Button */}
          <div className="hidden md:block fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100">
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
          subscribelength={subscribelength}
        />
      )}
      <div className="w-full touch-none h-10 mb-10" ref={ref}></div>
      {(isFetchingNextPage || (isFetching && subscribeable.length > 0)) && (
        <div className="flex justify-center items-center py-2" >
        <div className='flex items-center justify-center mb-[120px]'>
      <div className='w-12 h-12 border-4 border-purple-200 border-t-customPurple rounded-full animate-spin'></div>
    </div>
        </div>
      )}
    </div>
  );
};

export default Subscribe;