import React, { useEffect, useState } from "react";
import KakaoShare from "./Shared/KakaoShare";
import Symbol from "./Symbol";
import UrlShare from "./Shared/UrlShare";
import { SummaryNewsLetterDataType } from "../pages/ReadPage";
import { newsletterApi } from "../api/newsletter";
import { Token } from "../api/utils";
import { sendEventToAmplitude } from "./Amplitude";
import { Skeleton } from "./ui/skeleton";

export interface SubscribeNewsLetterDataType {
  id: number;
  name: string;
  category: string;
}

interface SummaryProps {
  summaryNewsLetterData: SummaryNewsLetterDataType[];
  newslettersubscribe?: SubscribeNewsLetterDataType[];
  isLoadingDetail?: boolean;
}

export const Summary = ({
  summaryNewsLetterData,
  newslettersubscribe,
}: SummaryProps) => {
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<
    Record<number, boolean>
  >({});
  const [expandedSummaries, setExpandedSummaries] = useState<
    Record<number, boolean>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const authToken = Token();

  useEffect(() => {
    if (newslettersubscribe) {
      const newslettersubscribed = newslettersubscribe.map((data) => data.id);
      const newSubscriptionStatusMap: Record<number, boolean> = {};
      summaryNewsLetterData.forEach((data) => {
        const isSubscribed = newslettersubscribed.includes(data.newsletter_id);
        newSubscriptionStatusMap[data.newsletter_id] = isSubscribed;
      });
      setSubscriptionStatusMap(newSubscriptionStatusMap);
    }
  }, [newslettersubscribe, summaryNewsLetterData]);

  const handleNewsLetterSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageSubscribe(newsletterId);
      if (response.status === 201) {
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: true,
        }));
        sendEventToAmplitude("select article", {
          "article name": newslettername,
        });
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  const handleNewsLetterUnSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageUnSubscribe(newsletterId);
      if (response.status === 204) {
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: false,
        }));
        sendEventToAmplitude("unselect article", {
        "article name": newslettername,
      });
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  const toggleSummaryExpansion = (summaryId: number) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [summaryId]: !prevState[summaryId],
    }));
  };

  return (
    <div>
      <div>
        {summaryNewsLetterData.map((data) => (
          <div key={data.id} className="border-b border-gray-200 flex mt-8 flex-col pb-6 bg-gradient-to-br from-white to-purple-50/20 rounded-xl p-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                    src={`images/${data.name}.png`}
                    alt={String(data.name)}
                  />
                  <span className="font-semibold text-gray-700 text-base">
                    {data.name}
                  </span>
                  {authToken ? (
                    subscriptionStatusMap[data.newsletter_id] ? (
                      <button
                        disabled={loadingStates[data.newsletter_id]}
                        className="p-2 rounded-xl border border-gray-200 bg-gray-200 text-gray-400 cursor-pointer text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] hover:shadow-md transition-all duration-200"
                        onClick={() =>
                          handleNewsLetterUnSelected(
                            data.newsletter_id,
                            data.from_name
                          )
                        }
                      >
                        {loadingStates[data.newsletter_id] ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "구독해제"
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={loadingStates[data.newsletter_id]}
                        className="p-2 rounded-xl border border-customPurple text-customPurple text-xs font-bold cursor-pointer bg-subscribebutton disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] hover:shadow-md transition-all duration-200"
                        onClick={() =>
                          handleNewsLetterSelected(
                            data.newsletter_id,
                            data.from_name
                          )
                        }
                      >
                        {loadingStates[data.newsletter_id] ? (
                          <div className="w-4 h-4 border-2 border-customPurple border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "구독하기"
                        )}
                      </button>
                    )
                  ) : (
                    ""
                  )}
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {new Date(data.updated_at).toLocaleDateString("ko-KR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <p className="my-4 text-left text-2xl font-bold text-gray-800">{data.subject}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-5 mt-5">
        <Symbol />
        <div
          className="border border-purple-100/50 rounded-2xl bg-gradient-to-br from-white via-purple-50/20 to-white w-[650px] shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-purple-50/50 to-white border-b border-purple-100/50">
            <p className="font-extrabold text-gray-800">메일포켓이 요약한 내용이에요</p>
            <div className="flex gap-2">
              <UrlShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"URL 복사하기"}
                containerstyle={
                  "p-2 h-[36px] bg-gradient-to-br from-gray-100 to-gray-200 flex gap-1 rounded-xl hover:shadow-md transition-all duration-200 active:scale-95"
                }
                imgstyle={"w-5 h-5"}
              />
              <KakaoShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"카카오톡으로 공유하기"}
                containerstyle={
                  "share-node py-2 px-2 bg-kakaoBgColor flex items-center justify-center gap-1 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
                }
                imgstyle={"w-5 h-5"}
              />
            </div>
          </div>
          {summaryNewsLetterData.map((data) => (
            <div key={data.id}>
              <div
                className={`p-4 flex flex-col items-start text-left transition-all duration-300 ${
                  expandedSummaries[data.id]
                    ? "min-h-[280px]"
                    : "h-[280px] overflow-hidden"
                } custom-scrollbar`}
              >
                {data.summary_list ? (
                  <div className="space-y-4 w-full text-left">
                    {Object.entries(data.summary_list).map(([key, value], index) => (
                      <div
                        key={key}
                        className="p-4 bg-gradient-to-br from-purple-50/40 to-white rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-200 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mt-2"></div>
                          <div className="flex-1 text-left">
                            <p className="font-extrabold text-gray-800 mb-2 text-base text-left">{key}</p>
                            <span className="text-sm text-gray-600 font-medium leading-relaxed text-left block">
                              {String(value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 font-semibold">
                      요약 데이터가 없습니다
                    </p>
                  </div>
                )}
              </div>

              {/* Expand/Collapse Button */}
              <div
                className="p-3 cursor-pointer text-center bg-gradient-to-r from-purple-50/30 to-white border-t border-purple-100/50 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-white transition-all duration-200 active:scale-98"
                onClick={() => toggleSummaryExpansion(data.id)}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base text-customPurple font-bold">
                    {expandedSummaries[data.id] ? "닫기" : "펼치기"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-customPurple transition-transform duration-200 ${
                      expandedSummaries[data.id] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MySummary = ({ summaryNewsLetterData, isLoadingDetail }: SummaryProps) => {
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<
    Record<number, boolean>
  >({});
  const [expandedSummaries, setExpandedSummaries] = useState<
    Record<number, boolean>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const authToken = Token();

  const handleNewsLetterSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageSubscribe(newsletterId);
      if (response.status === 201) {
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: false,
        }));
        sendEventToAmplitude("select article", {
          "article name": newslettername,
        });
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  const handleNewsLetterUnSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageUnSubscribe(newsletterId);
      if (response.status === 204) {
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: true,
        }));
        sendEventToAmplitude("unselect article", {
        "article name": newslettername,
      });
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  const toggleSummaryExpansion = (summaryId: number) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [summaryId]: !prevState[summaryId],
    }));
  };

  return (
    <div>
      <div>
        {isLoadingDetail ? (
          <div className="border-b border-gray-200 flex mt-8 flex-col pb-3 animate-fadeIn">
            <div className="">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
                  <Skeleton className="h-[20px] w-[140px] rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                  <Skeleton className="h-[32px] w-[80px] rounded-xl bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100" />
                </div>
                <Skeleton className="h-[16px] w-[200px] rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              </div>
            </div>
            <div >
              <Skeleton className="h-[32px] w-[90%] rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
            </div>
          </div>
        ) : (
          summaryNewsLetterData.map((data) => (
            <div key={data.id} className="border-b border-gray-200 flex mt-8 flex-col pb-6 bg-gradient-to-br from-white to-purple-50/20 rounded-xl p-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      src={`images/${data.name}.png`}
                      alt={String(data.name)}
                    />
                    <span className="font-semibold text-gray-700 text-base">
                      {data.name}
                    </span>
                    {authToken ? (
                      subscriptionStatusMap[data.newsletter_id] ? (
                        <button
                          disabled={loadingStates[data.newsletter_id]}
                          className="p-2 rounded-xl border border-customPurple text-customPurple text-xs font-bold cursor-pointer bg-subscribebutton disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] hover:shadow-md transition-all duration-200"
                          onClick={() =>
                            handleNewsLetterSelected(
                              data.newsletter_id,
                              data.from_name
                            )
                          }
                        >
                          {loadingStates[data.newsletter_id] ? (
                            <div className="w-4 h-4 border-2 border-customPurple border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "구독하기"
                          )}
                        </button>
                      ) : (
                        <button
                          disabled={loadingStates[data.newsletter_id]}
                          className="p-2 rounded-xl border border-gray-200 bg-gray-200 text-gray-400 cursor-pointer text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] hover:shadow-md transition-all duration-200"
                          onClick={() => handleNewsLetterUnSelected(data.newsletter_id, data.from_name)}
                        >
                          {loadingStates[data.newsletter_id] ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "구독해제"
                          )}
                        </button>
                      )
                    ) : (
                      ""
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-400">
                    {new Date(data.updated_at).toLocaleDateString("ko-KR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <p className="my-4 text-left text-2xl font-bold text-gray-800">{data.subject}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center gap-5 mt-5">
        <Symbol />
        <div
          className="border border-purple-100/50 rounded-2xl bg-gradient-to-br from-white via-purple-50/20 to-white w-[650px] shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-purple-50/50 to-white border-b border-purple-100/50">
            <p className="font-extrabold text-gray-800">메일포켓이 요약한 내용이에요</p>
            <div className="flex gap-2">
              <UrlShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"URL 복사하기"}
                containerstyle={
                  "p-2 h-[36px] bg-gradient-to-br from-gray-100 to-gray-200 flex gap-1 rounded-xl hover:shadow-md transition-all duration-200 active:scale-95"
                }
                imgstyle={"w-5 h-5"}
              />
              <KakaoShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"카카오톡으로 공유하기"}
                containerstyle={
                  "share-node py-2 px-2 bg-kakaoBgColor flex items-center justify-center gap-1 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
                }
                imgstyle={"w-5 h-5"}
              />
            </div>
          </div>
          {isLoadingDetail ? (
            <>
              <div className="p-5 flex flex-col items-start text-start border-b border-gray-200 min-h-[280px] bg-gradient-to-br from-gray-50/50 to-white">
                <div className="space-y-5 w-full">
                  {/* 첫 번째 요약 섹션 */}
                  <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50/30 to-white rounded-xl border border-purple-100/50">
                    <Skeleton className="h-[20px] w-[48%] rounded-lg bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200" />
                    <div className="space-y-2 pl-2">
                      <Skeleton className="h-[16px] w-full rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                      <Skeleton className="h-[16px] w-[96%] rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                      <Skeleton className="h-[16px] w-[91%] rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    </div>
                  </div>
                  {/* 두 번째 요약 섹션 */}
                  <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50/30 to-white rounded-xl border border-purple-100/50">
                    <Skeleton className="h-[20px] w-[52%] rounded-lg bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200" />
                    <div className="space-y-2 pl-2">
                      <Skeleton className="h-[16px] w-full rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                      <Skeleton className="h-[16px] w-[94%] rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    </div>
                  </div>
                  {/* 세 번째 요약 섹션 */}
                  <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50/30 to-white rounded-xl border border-purple-100/50">
                    <Skeleton className="h-[20px] w-[42%] rounded-lg bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200" />
                    <div className="space-y-2 pl-2">
                      <Skeleton className="h-[16px] w-full rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                      <Skeleton className="h-[16px] w-[93%] rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                      <Skeleton className="h-[16px] w-[88%] rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 cursor-pointer text-center border-t border-gray-200 bg-gray-50/50">
                <Skeleton className="h-[28px] w-[80px] mx-auto rounded-lg bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200" />
              </div>
            </>
          ) : (
            <>
              {summaryNewsLetterData.map((data) => (
                <div key={data.id}>
                  <div
                    className={`p-4 flex flex-col items-start text-left transition-all duration-300 ${
                      expandedSummaries[data.id]
                        ? "min-h-[280px]"
                        : "h-[280px] overflow-hidden"
                    } custom-scrollbar`}
                  >
                    {data.summary_list ? (
                      <div className="space-y-4 w-full text-left">
                        {Object.entries(data.summary_list).map(([key, value], index) => (
                          <div
                            key={key}
                            className="p-4 bg-gradient-to-br from-purple-50/40 to-white rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-200 text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mt-2"></div>
                              <div className="flex-1 text-left">
                                <p className="font-extrabold text-gray-800 mb-2 text-base text-left">{key}</p>
                                <span className="text-sm text-gray-600 font-medium leading-relaxed text-left block">
                                  {String(value)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 text-center">
                        <p className="text-sm text-gray-500 font-semibold">
                          요약 데이터가 없습니다
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  <div
                    className="p-3 cursor-pointer text-center bg-gradient-to-r from-purple-50/30 to-white border-t border-purple-100/50 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-white transition-all duration-200 active:scale-98"
                    onClick={() => toggleSummaryExpansion(data.id)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-base text-customPurple font-bold">
                        {expandedSummaries[data.id] ? "닫기" : "펼치기"}
                      </span>
                      <svg
                        className={`w-5 h-5 text-customPurple transition-transform duration-200 ${
                          expandedSummaries[data.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

