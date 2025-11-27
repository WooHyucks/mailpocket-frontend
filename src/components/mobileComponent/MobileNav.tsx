import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsletterApi } from "../../api/newsletter";
import { Token } from "../../api/utils";
import { NavNewsLetterDataType } from "../../mobile/MobileMyPage";
import { SummaryNewsLetterDataType } from "../../pages/ReadPage";
import { NewsLetterDataType } from "../../api/newsletter/types";
import { sendEventToAmplitude } from "../Amplitude";
import MobileMenu from "../Modal/MobileMenu";
import { SubscribeNewsLetterDataType } from "../Summary";
import { Skeleton } from "../ui/skeleton";

interface ReadNavNewsLetterDataType {
  ReadNavNewsLetterData: SummaryNewsLetterDataType[];
  newslettersubscribe: SubscribeNewsLetterDataType[];
}

export const MobileReadNav = ({
  ReadNavNewsLetterData,
  newslettersubscribe,
}: ReadNavNewsLetterDataType) => {
  const authToken = Token();
  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substring(0, n) + "..." : str;
  };
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<
    Record<number, boolean>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (newslettersubscribe) {
      const newslettersubscribed = newslettersubscribe.map((data) => data.id);
      const newSubscriptionStatusMap: Record<number, boolean> = {};
      ReadNavNewsLetterData.forEach((data) => {
        const isSubscribed = newslettersubscribed.includes(data.newsletter_id);
        newSubscriptionStatusMap[data.newsletter_id] = isSubscribed;
      });
      setSubscriptionStatusMap(newSubscriptionStatusMap);
    }
  }, [newslettersubscribe, ReadNavNewsLetterData]);

  const handleNewsLetterSelected = async (newsletterId: number) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageSubscribe(newsletterId);
      if (response.status === 201) {
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: true,
        }));
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  const handleNewsLetterUnSelected = async (newsletterId: number) => {
    setLoadingStates((prev) => ({ ...prev, [newsletterId]: true }));
    try {
      const response = await newsletterApi.readPageUnSubscribe(newsletterId);
      if (response.status === 204) {
        setSubscriptionStatusMap((prevMap) => ({
          ...prevMap,
          [newsletterId]: false,
        }));
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [newsletterId]: false }));
    }
  };

  return (
    <div>
      {ReadNavNewsLetterData.map((data) => (
        <div
          key={data.id}
          className={`bg-white p-3 flex items-center justify-center gap-4 mb-4 ${authToken ? "" : "mb-4"
            }`}
        >
          <div className="flex items-center justify-center gap-3">
            <img
              className="w-8"
              src={`/images/${data.name}.png`}
              alt={String(data.name)}
            />
            <span className="text-sm font-semibold">
              {truncate(data.subject, 18)}
            </span>
          </div>
          {authToken ? (
            subscriptionStatusMap[data.newsletter_id] ? (
              <button
                disabled={loadingStates[data.newsletter_id]}
                className="p-2 rounded-xl border border-gray-200 bg-gray-200 text-gray-400 cursor-pointer text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
                onClick={() => handleNewsLetterUnSelected(data.newsletter_id)}
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
                className="p-2 rounded-xl border border-customPurple text-customPurple text-xs font-bold cursor-pointer bg-subscribebutton disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
                onClick={() => handleNewsLetterSelected(data.newsletter_id)}
              >
                {loadingStates[data.newsletter_id] ? (
                  <div className="w-4 h-4 border-2 border-customPurple border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "구독하기"
                )}
              </button>
            )
          ) : (
            <Link
              className="text-sm border rounded-2xl py-2 px-3 bg-gray-100 font-semibold text-gray-500"
              to="/landingpage"
            >
              구독하기
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

interface MobileMyPageNavType {
  MayPageNavNewsLetterData: NavNewsLetterDataType[];
  mynewsletter: NewsLetterDataType[];
  onSelectItem: React.Dispatch<React.SetStateAction<number>>;
  selectItemId: number;
  setMyNewsLetterDetailKey: React.Dispatch<React.SetStateAction<string>>;
  activeMail: number
  setActiveMail: React.Dispatch<React.SetStateAction<number>>;
  isLoading?: boolean;
}

export const MobileMyPageNav = ({
  MayPageNavNewsLetterData,
  mynewsletter,
  onSelectItem,
  selectItemId,
  setMyNewsLetterDetailKey,
  activeMail,
  setActiveMail,
  isLoading = false,
}: MobileMyPageNavType) => {
  const [openModal, setOpenModal] = useState(false);
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState<Record<number, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substring(0, n) + "..." : str;
  };

  useEffect(() => {
    if (mynewsletter) {
      const newslettersubscribed = mynewsletter.map((data) => data.id);
      const newSubscriptionStatusMap: Record<number, boolean> = {};
      newslettersubscribed.forEach((id) => {
        newSubscriptionStatusMap[id] = true;
      });
      setSubscriptionStatusMap(newSubscriptionStatusMap);
    }
  }, [mynewsletter]);

  const handleModalOpen = () => {
    setOpenModal(true);
  };

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

  return (
    <div className=" sticky top-0 z-10">
      {isLoading ? (
        <div className="bg-white border-b p-3 flex items-center justify-around gap-4 mb-3">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="flex items-center justify-center gap-2 flex-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      ) : (
        <>
          {MayPageNavNewsLetterData.map((data) => (
            <div
              key={data.newsletter_id}
              className="bg-white border-b p-3 flex items-center justify-around gap-4 mb-3"
            >
              <img
                className="w-5 cursor-pointer"
                src="/images/menu.png"
                alt="menu"
                onClick={handleModalOpen}
              />
              <div className="flex items-center justify-center gap-2">
                <img
                  className="w-8"
                  src={`/images/${data.name}.png`}
                  alt={String(data.name)}
                />
                <span className="text-sm font-semibold">
                  {truncate(data.subject, 16)}
                </span>
              </div>
              {subscriptionStatusMap[data.newsletter_id] ? (
                <button
                  disabled={loadingStates[data.newsletter_id]}
                  className="p-2 rounded-xl border border-gray-200 bg-gray-200 text-gray-400 cursor-pointer text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
                  onClick={() =>
                    handleNewsLetterUnSelected(data.newsletter_id, data.from_name)
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
                  className="p-2 rounded-xl border border-customPurple text-customPurple text-xs font-bold cursor-pointer bg-subscribebutton disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
                  onClick={() =>
                    handleNewsLetterSelected(data.newsletter_id, data.from_name)
                  }
                >
                  {loadingStates[data.newsletter_id] ? (
                    <div className="w-4 h-4 border-2 border-customPurple border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "구독하기"
                  )}
                </button>
              )}
            </div>
          ))}
        </>
      )}
      {openModal && (
        <MobileMenu
          setOpenModal={setOpenModal}
          mynewsletter={mynewsletter}
          onSelectItem={onSelectItem}
          selectItemId={selectItemId}
          setMyNewsLetterDetailKey={setMyNewsLetterDetailKey}
          activeMail={activeMail}
          setActiveMail={setActiveMail}
        />
      )}
    </div>
  );
};
