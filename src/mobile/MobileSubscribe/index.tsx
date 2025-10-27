import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  decodedToken,
  getCategory,
  getNewsletterData,
  getSubscribeData,
  Params,
  putSubscribe,
  readPageSubscribe,
  readPageUnSubscribe,
  Token,
} from "../../api/api";
import { sendEventToAmplitude } from "../../components/Amplitude";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import Nav from "../../components/Nav";
import Symbol from "../../components/Symbol";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import { Loader } from "../../components/Loader";
import SlackGuideModal from "../../components/Modal/SlackGuideModal";
import { Category } from "../../components/Category";
import "../../index.css";
import { NewsLetterDataType } from "../../pages/SubscribePage";
import SignIn from "../../components/Modal/SignIn";

export type SummaryItem = {
  [key: string]: string;
};

export type NewsletterResponse = {
  data: NewsLetterDataType[];
  nextCursor?: string | null;
};


const MobileSubscribe = () => {
  const [subscribeable, setSubscribeable] = useState<NewsLetterDataType[]>([]);
  const [newslettersubscribe, setNewsLettersubscribe] = useState<NewsLetterDataType[]>([]);
  const [newsletterchecked, setNewsLetterChecked] = useState<number[]>([]);
  const navigate = useNavigate();
  const [slackGuideOpenModal, setSlackGuideOpenModal] = useState(false);
  const [authOpenModal, setAuthOpenModal] = useState(false);
  const [isActiveMailModal, setIsActiveMailModal] = useState(false);
  const [acitveMailData, setActiveMailData] = useState();
  const [activeCategory, setActiveCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [subscribelength, setNewsLettersubscribeLength] = useState(0)
  const [categories, setCategories] = useState([]);
  const authTokenDecode = decodedToken();
  const authToken = Token();
  const ref = useRef<HTMLDivElement | null>(null);
  const pageRef = useIntersectionObserver(ref, {});
  const isPageEnd = pageRef?.isIntersecting;

  useEffect(() => {
    if (!authToken) {
      navigate('/landingpage')
    }
    sendEventToAmplitude("view select article", "");
  }, []);

  const fetchNewsletter = async (
    lastId: any,
    category: number | undefined = 0
  ): Promise<NewsletterResponse> => {
    let params: Params = {
      in_mail: true,
      subscribe_status: "subscribable",
      sort_type: "ranking",
    };

    if (lastId) {
      params.cursor = lastId;
    }

    if (category !== 0) {
      params.category_id = category;
    }

    const { data } = await getNewsletterData("/newsletter", params);
    setSubscribeable((prevData) => [...prevData, ...data]);
    return { data, nextCursor: data.length ? data[data.length - 1].id : null };
  };

  const { data, isFetching, fetchNextPage, isFetchingNextPage, hasNextPage, error, status } =
    useInfiniteQuery<NewsletterResponse, Error>({
      queryKey: ["newsletter", activeCategory],
      queryFn: ({ pageParam }: QueryFunctionContext) => fetchNewsletter(pageParam, activeCategory),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      initialPageParam: undefined,
    });

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

  const handleGetNewsLetterData = async () => {
    try {
      const responesSubscribe = await getSubscribeData(
        "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"
      );
      setNewsLettersubscribe(responesSubscribe.data);
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    }
  };

  const handleGetNewsLetterLengthData = async () => {
    try {
      const responesSubscribe = await getSubscribeData(
        "/newsletter?in_mail=true&subscribe_status=subscribed&sort_type=ranking"
      );
      setNewsLettersubscribeLength(responesSubscribe.data.length);
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    }
  };

  const handlePostNewsLetterData = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      if (newsletterchecked.length <= 0) {
        alert("뉴스레터를 구독해주세요");
      } else {
        const responesPut = await putSubscribe({ ids: newsletterchecked });
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

  useEffect(() => {
    handleGetNewsLetterData();
    handleCategory();
  }, []);

  const handleCategory = async () => {
    let response = await getCategory();
    setCategories(response.data);
  };

  useEffect(() => {
    handleNewsLetterSubcribeDataRenewal();
  }, [newslettersubscribe]);

  const handleModalOpen = () => {
    if (authTokenDecode === false) {
      setAuthOpenModal(true);
    } else {
      setSlackGuideOpenModal(true);
    }
  };

  const handleNewsLetterSubcribeDataRenewal = () => {
    const newslettersubscribeId = newslettersubscribe.map((item) => item.id);
    setNewsLetterChecked([...newslettersubscribeId]);
  };



  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substring(0, n) + "..." : str;
  };

  return (
    <div className="mx-auto min-h-[100vh] bg-white">
      <Nav setAuthOpenModal={setAuthOpenModal} authTokenDecode={authTokenDecode} />
      <div className="mx-auto max-w-[1200px] mt-3 mb-10">
        {isActiveMailModal === true ? (
          <MailModal
            setIsActiveMailModal={setIsActiveMailModal}
            acitveMailData={acitveMailData}
            newslettersubscribe={newslettersubscribe}
            setNewsLettersubscribe={setNewsLettersubscribe}
            subscribeable={subscribeable}
            setSubscribeable={setSubscribeable}
            activeCategory={activeCategory}
          ></MailModal>
        ) : (
          ""
        )}
        <div className="flex justify-between md:gap-8 px-3">
          <div className="flex gap-2 justify-center ">
            <Symbol />
            <div
              className="flex flex-col gap-2 text-left border p-4 bg-white rounded-lg"
              style={{ boxShadow: "1px 2px lightgrey" }}
            >
              <p className="text-xs font-semibold text-gray-400">
                최근 요약 확인하고, 뉴스레터 구독하기
              </p>
              <p className="text-sm font-semibold">
                어떤 뉴스레터를 좋아하시나요?
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-8 whitespace-nowrap overflow-auto subscribe-scrollbar">
          <div className="flex gap-[10px] mx-2">
            <Category
              fetchNewsletter={fetchNewsletter}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={categories}
              subscribeable={subscribeable}
              setSubscribeable={setSubscribeable}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              fetchNextPage={fetchNextPage}
            ></Category>
          </div>
        </div>
        <div className="mt-3">
          <div className="overflow-y-auto">
            <div className="md:p-3">
              {Object.keys(newslettersubscribe).length > 0 ? (
                <div>
                  <h1 className="mb-5 text-lg font-extrabold">
                    구독중인 뉴스레터
                  </h1>
                  <div
                    className={`flex whitespace-nowrap overflow-auto subscribe-scrollbar gap-4`}
                  >
                    {newslettersubscribe.map((data) => (
                      <div>
                        <NewsLetter
                          setActiveMailData={setActiveMailData}
                          setIsActiveMailModal={setIsActiveMailModal}
                          data={data}
                        ></NewsLetter>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <h1 className="mt-5 text-lg font-extrabold md:p-3">
              구독 가능한 뉴스레터
            </h1>
            <div className="grid md:grid-cols-4 gap-4 px-[10px]">
              {subscribeable.map((data) => (
                <div className="">
                  <NewsLetter
                    setActiveMailData={setActiveMailData}
                    setIsActiveMailModal={setIsActiveMailModal}
                    data={data}
                  ></NewsLetter>
                </div>
              ))}
            </div>
          </div>
          <div className="fixed bottom-[0px]">
            <button
              className="h-[60px] w-svw border-2 bg-customPurple text-white text-base font-bold  hover:scale-110 transition-transform"
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
      <div className="w-full  touch-none h-10 mb-10" ref={ref}></div>
      {isFetching && hasNextPage && <Loader />}
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
      className="justify-around flex flex-wrap border-2 rounded-md bg-white items-center"
      // style={{ boxShadow: "-1px 5px 1px 1px lightgray" }}
      key={data.id}
    >
      <div className="flex flex-col items-center min-h-[100px]">
        <div>
          <img
            src={"../images/" + data.id + ".png"}
            className="size-[40px] m-[9px] rounded-full "
            alt=""
          />
        </div>
        <div className="w-full">
          <span className="px-1 font-semibold text-xs text-center inline-block w-[70px] mx-[10px] whitespace-pre-wrap break-all items-center">
            {data.name}
          </span>
        </div>
      </div>
    </div>
  );
};

const MailModal = ({
  setIsActiveMailModal,
  acitveMailData,
  newslettersubscribe,
  setNewsLettersubscribe,
  subscribeable,
  setSubscribeable,
  activeCategory,
}: any) => {
  const [isSub, setIsSub] = useState(false);

  const hasId = (): any => {
    return newslettersubscribe.some((subscribe: any) => {
      return subscribe.id === acitveMailData.id;
    });
  };

  const deleteSubscribe = (
    subscribeToDelete: NewsLetterDataType,
    subScribeList: Array<NewsLetterDataType>
  ) => {
    return subScribeList.filter((newLetter: NewsLetterDataType) => {
      return newLetter.id !== subscribeToDelete.id;
    });
  };

  useEffect(() => {
    let result = hasId();
    setIsSub(result);
  }, []);

  return (
    <div className="w-full h-full fixed top-0">
      <div className="h-full bg-black bg-opacity-35">
        <div className="w-[80%] h-[500px] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg">
          <span
            onClick={() => {
              setIsActiveMailModal(false);
            }}
            className="fixed top-3 right-5 cursor-pointer"
          >
            <img src="/images/close.svg" alt="" className="size-6" />
          </span>
          <div className="p-[20px] h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-center  gap-2 text-[20px] font-semibold">
                <div className="">
                  <img
                    className="size-[40px] rounded-full border-1 border-black"
                    src={"../images/" + acitveMailData.id + ".png"}
                    alt=""
                  />
                </div>
                <div className="">{acitveMailData.name}</div>
              </div>
              <div
                className={`pt-[20px] ${acitveMailData.mail ? "overflow-auto" : "overflow-hidden"
                  } h-full `}
              >
                <div className="font-extrabold text-base mb-3">
                  {acitveMailData.mail
                    ? acitveMailData.mail.subject
                    : "해당 뉴스레터의 새 소식을 기다리고 있어요."}
                </div>
                <div className="flex  h-full items-start gap-[15px] flex-col">
                  {acitveMailData.mail ? (
                    Object.entries(acitveMailData.mail.summary_list).map(
                      ([key, value]: any) => {
                        return (
                          <div>
                            <div className="font-extrabold mb-3">{key}</div>
                            <div className="font-bold text-sm">{value}</div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="font-bold text-sm">
                      소식이 생기면 메일포켓이 빠르게 요약해서 전달해드릴게요
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {isSub ? (
                  <button
                    onClick={async () => {
                      setIsSub(false);
                      try {
                        let response = await readPageUnSubscribe(
                          acitveMailData.id
                        );
                        const result = deleteSubscribe(
                          acitveMailData,
                          newslettersubscribe
                        );

                        setNewsLettersubscribe(result);
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
                    className="bg-[gray] text-[#FFFFFF] w-full p-[10px] rounded-md font-semibold"
                  >
                    구독해제
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setIsActiveMailModal(false);
                      setIsSub(true);
                      try {
                        let response = await readPageSubscribe(
                          acitveMailData.id
                        );
                        const result = deleteSubscribe(
                          acitveMailData,
                          subscribeable
                        );
                        setSubscribeable(result);
                        setNewsLettersubscribe((prev: any) => [
                          acitveMailData,
                          ...prev,
                        ]);
                        sendEventToAmplitude("select article", {
                          "article name": acitveMailData.name,
                        });
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="bg-[#8F36FF] text-[#FFFFFF] w-full p-[10px] rounded-md font-semibold"
                  >
                    구독하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSubscribe;
