import React, { useEffect, useState } from "react";
import KakaoShare from "./Shared/KakaoShare";
import Symbol from "./Symbol";
import UrlShare from "./Shared/UrlShare";
import { SummaryNewsLetterDataType } from "../pages/ReadPage";
import { readPageSubscribe, readPageUnSubscribe, Token } from "../api/api";
import { sendEventToAmplitude } from "./Amplitude";

export interface SubscribeNewsLetterDataType {
  id: number;
  name: string;
  category: string;
}

interface SummaryProps {
  summaryNewsLetterData: SummaryNewsLetterDataType[];
  newslettersubscribe?: SubscribeNewsLetterDataType[];
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
    try {
      const response = await readPageSubscribe(newsletterId);
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
    }
  };

  const handleNewsLetterUnSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    try {
      const response = await readPageUnSubscribe(newsletterId);
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
          <div key={data.id} className="border-b flex mt-8 flex-col">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    className="w-8"
                    src={`images/${data.newsletter_id}.png`}
                    alt={String(data.newsletter_id)}
                  />
                  <span className="font-semibold text-gray-600">
                    {data.from_name}
                  </span>
                  {authToken ? (
                    subscriptionStatusMap[data.newsletter_id] ? (
                      <span
                        className="p-2 rounded-xl border border-gray-200 bg-gray-200 text-gray-400 cursor-pointer text-xs font-bold"
                        onClick={() =>
                          handleNewsLetterUnSelected(
                            data.newsletter_id,
                            data.from_name
                          )
                        }
                      >
                        구독해제
                      </span>
                    ) : (
                      <span
                        className="p-2 rounded-xl border border-customPurple text-customPurple text-xs font-bold cursor-pointer bg-subscribebutton"
                        onClick={() =>
                          handleNewsLetterSelected(
                            data.newsletter_id,
                            data.from_name
                          )
                        }
                      >
                        구독하기
                      </span>
                    )
                  ) : (
                    ""
                  )}
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {new Date(data.date).toLocaleDateString("ko-KR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <p className="my-4 text-left text-2xl font-bold">{data.subject}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-5 mt-5">
        <Symbol />
        <div
          className="border rounded-lg bg-white w-[650px]"
          style={{ boxShadow: "1px 2px lightgrey" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-extrabold">메일포켓이 요약한 내용이에요</p>
            <div className="flex gap-3">
              <UrlShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"URL 복사하기"}
                containerstyle={
                  "p-2 w-full h-[36px] bg-gray-200 flex gap-1 rounded-lg hover:scale-110 transition-transform"
                }
                imgstyle={"w-6"}
              />
              <KakaoShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"카카오톡으로 공유하기"}
                containerstyle={
                  "py-2 px-2 bg-kakaoBgColor flex items-center justify-center gap-1 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                }
                imgstyle={"w-6"}
              />
            </div>
          </div>
          {summaryNewsLetterData.map((data) => (
            <div
              key={data.id}
              className={`p-3 flex flex-col items-start text-start  border-b h-[280px] ${
                expandedSummaries[data.id]
                  ? "h-auto"
                  : "h-[280px] overflow-hidden"
              } custom-scrollbar`}
            >
              {data.summary_list ? (
                Object.entries(data.summary_list).map(([key, value]) => (
                  <div className="my-1" key={key}>
                    <div className="flex flex-col">
                      <p className="my-1 font-extrabold">{key}</p>
                      <span className="text-sm text-gray-500 font-semibold">
                        {value}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="mt-2 text-sm text-gray-500 font-semibold">
                  요약 데이터가 없습니다
                </p>
              )}
            </div>
          ))}
          {summaryNewsLetterData.map((data) => (
            <div
              key={data.id}
              className="p-3 cursor-pointer text-center"
              onClick={() => toggleSummaryExpansion(data.id)}
            >
              <span className="text-lg text-customPurple font-bold">
                {expandedSummaries[data.id] ? "닫기" : "펼치기"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MySummary = ({ summaryNewsLetterData }: SummaryProps) => {
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<
    Record<number, boolean>
  >({});
  const [expandedSummaries, setExpandedSummaries] = useState<
    Record<number, boolean>
  >({});
  const authToken = Token();

  const handleNewsLetterSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    try {
      const response = await readPageSubscribe(newsletterId);
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
    }
  };

  const handleNewsLetterUnSelected = async (
    newsletterId: number,
    newslettername: string
  ) => {
    try {
      const response = await readPageUnSubscribe(newsletterId);
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
          <div key={data.id} className="border-b flex mt-8 flex-col">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    className="w-8"
                    src={`images/${data.newsletter_id}.png`}
                    alt={String(data.newsletter_id)}
                  />
                  <span className="font-semibold text-gray-600">
                    {data.from_name}
                  </span>
                  {authToken ? (
                    subscriptionStatusMap[data.newsletter_id] ? (
                      <span
                        className="p-2 rounded-xl border border-customPurple text-customPurple text-xs font-bold cursor-pointer bg-subscribebutton"
                        onClick={() =>
                          handleNewsLetterSelected(
                            data.newsletter_id,
                            data.from_name
                          )
                        }
                      >
                        구독하기
                      </span>
                    ) : (
                      <span className='p-2 rounded-xl border border-gray-200 bg-gray-200 text-gray-400 cursor-pointer text-xs font-bold' onClick={() => handleNewsLetterUnSelected(data.newsletter_id, data.from_name)}>구독해제</span>
                    )
                  ) : (
                    ""
                  )}
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {new Date(data.date).toLocaleDateString("ko-KR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <p className="my-4 text-left text-2xl font-bold">{data.subject}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-5 mt-5">
        <Symbol />
        <div
          className="border rounded-lg bg-white w-[650px]"
          style={{ boxShadow: "1px 2px lightgrey" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-extrabold">메일포켓이 요약한 내용이에요</p>
            <div className="flex gap-3">
              <UrlShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"URL 복사하기"}
                containerstyle={
                  "p-2 h-[36px] w-full bg-gray-200 flex gap-1 rounded-lg hover:scale-110 transition-transform"
                }
                imgstyle={"w-6"}
              />
              <KakaoShare
                summaryNewsLetterData={summaryNewsLetterData}
                text={"카카오톡으로 공유하기"}
                containerstyle={
                  "share-node py-2 px-2 bg-kakaoBgColor flex items-center justify-center gap-1 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                }
                imgstyle={"w-6"}
              />
            </div>
          </div>
          {summaryNewsLetterData.map((data) => (
            <div
              key={data.id}
              className={`p-3 flex flex-col items-start text-start  border-b h-[280px] ${
                expandedSummaries[data.id]
                  ? "h-auto"
                  : "h-[280px] overflow-hidden"
              } custom-scrollbar`}
            >
              {data.summary_list ? (
                Object.entries(data.summary_list).map(([key, value]) => (
                  <div className="my-1" key={key}>
                    <div className="flex flex-col">
                      <p className="my-1 font-extrabold">{key}</p>
                      <span className="text-sm text-gray-500 font-semibold">
                        {value}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="mt-2 text-sm text-gray-500 font-semibold">
                  요약 데이터가 없습니다
                </p>
              )}
            </div>
          ))}

          {summaryNewsLetterData.map((data) => (
            <div
              key={data.id}
              className="p-3 cursor-pointer text-center"
              onClick={() => toggleSummaryExpansion(data.id)}
            >
              <span className="text-lg text-customPurple font-bold">
                {expandedSummaries[data.id] ? "닫기" : "펼치기"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
