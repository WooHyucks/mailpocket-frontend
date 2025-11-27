import Cookies from "js-cookie";
import React, {
  ReactComponentElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { decodedToken, Token } from "../../api/utils";
import { channelApi } from "../../api/channel";
import { useSubscribeData, useMail, useMailDetail } from "../../queries/newsletter";
import { newsletterApi } from "../../api/newsletter";
import { QUERY_KEYS } from "../../queries/queryKeys";
import {
  AmplitudeResetUserId,
  sendEventToAmplitude,
} from "../../components/Amplitude";

import "../MyPage/hideScroll.css";
import { Link } from "react-router-dom";

import { SettingModal } from "../../components/Modal/SettingModal";
import {
  SubscribeNewsLetterDataType,
  MySummary,
} from "../../components/Summary";
import { SummaryNewsLetterDataType } from "../ReadPage";
import PageLoding from "../../components/PageLoding";
import { isMobile } from "../../App";
import { Sheet } from "../../components/BottomSheet/BottomSheet";
import { Skeleton } from "../../components/ui/skeleton";
import { format, isSameDay } from "date-fns";
import useScrollController from "../../hooks/useScrollController";
import useSaveLastViewDate from "../../hooks/useSaveLastVIewDate";

export type ChannelDataType = {
  id: number;
  team_name: string;
  team_icon: string;
  name: string;
};

interface MailType {
  detailmail: SummaryNewsLetterDataType[];
  newsLetters: SubscribeNewsLetterDataType[];
  activeMail?: number;
}

const MyPage = () => {
  const [mail, setMail] = useState({});
  const [loadFlag, setLoadFlag] = useState(false);
  const [activeTab, setActiveTab] = useState<number | undefined>();
  const [activeMail, setActiveMail] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [detailmail, setDetailMail] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const navigate = useNavigate();
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const queryClient = useQueryClient();
  
  const { data: newsLetters = [], isLoading: isLoadingNewsLetters } = useSubscribeData(
    "/newsletter?&subscribe_status=subscribed&sort_type=recent",
    !!authToken && authTokenDecode !== false
  );


  useEffect(() => {
    if (isMobile) {
      navigate("/mobilemypage");
    }
  }, [isMobile]);

  useEffect(() => {
    if (!authToken || authTokenDecode === false) {
      navigate("/landingpage");
    } else {
      sendEventToAmplitude("view my page", "");
      // 로딩이 완료된 후에만 체크
      if (!isLoadingNewsLetters) {
        if (newsLetters.length > 0) {
          setActiveTab(newsLetters[0].id);
        } else if (newsLetters.length === 0) {
          window.alert("구독중인 뉴스레터가 없습니다.");
          navigate("/subscribe");
        }
      }
    }
  }, [authToken, navigate, newsLetters, isLoadingNewsLetters]);

  const handleMail = async (id: any) => {
    const data = await queryClient.fetchQuery({
      queryKey: [QUERY_KEYS.NEWSLETTER_DETAIL, id],
      queryFn: () => newsletterApi.getMail(id).then((response) => response.data),
      staleTime: 1000 * 60 * 5,
    });
    return data;
  };

  const handleLogOut = async () => {
    Cookies.remove("authToken");
    await AmplitudeResetUserId();
    navigate("/landingpage");
  };

  const itemClick = async (id: any) => {
    let responseMail = await handleMail(id);
    sendEventToAmplitude("view article detail", {
      "article name": responseMail.name,
      "post name": responseMail.mails[0].subject,
    });
    setActiveTab(id);
    setMail(responseMail);
  };

  const handleGetMailDetailData = async (s3_object_key: string) => {
    setIsLoadingDetail(true);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: [QUERY_KEYS.NEWSLETTER_DETAIL, s3_object_key],
        queryFn: () => newsletterApi.getMailDetail(s3_object_key).then((response) => response.data),
        staleTime: 1000 * 60 * 5,
      });
      setDetailMail([data]);
    } catch (error) {
      console.log("Api 데이터 불러오기 실패", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="bg-whitesmoke h-screen">
      <div className="text-center mx-auto max-w-[1300px] h-auto bg-white">
        {/* 마이페이지 요소들의 display 요소 설정 */}
        <div className="flex relative">
          <NavBar
            newsLetters={newsLetters}
            onClick={itemClick}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogOut={handleLogOut}
            setOpenModal={setOpenModal}
            isLoading={isLoadingNewsLetters}
          ></NavBar>
          <List
            mail={mail}
            setMail={setMail}
            handleMail={handleMail}
            newsLetters={newsLetters}
            activeMail={activeMail}
            setActiveMail={setActiveMail}
            handleGetMailDetailData={handleGetMailDetailData}
            isLoading={isLoadingNewsLetters}
          ></List>
          <Main
            detailmail={detailmail}
            newsLetters={newsLetters}
            activeMail={activeMail}
            isLoadingDetail={isLoadingDetail}
            isLoading={isLoadingNewsLetters}
          ></Main>
        </div>
      </div>
      {openModal === true ? (
        <SettingModal
          setOpenModal={setOpenModal}
          openModal={openModal}
          newsLetters={newsLetters}
        ></SettingModal>
      ) : (
        ""
      )}
    </div>
  );
};

const NavBar = ({
  newsLetters,
  onClick,
  activeTab,
  setActiveTab,
  handleLogOut,
  setOpenModal,
  isLoading,
}: any) => {
  return (
    <div
      className="flex flex-col sticky top-0 z-1 flex-[7%] border-r border-gray-200 bg-gradient-to-b from-white to-gray-50/30 shadow-lg h-screen min-w-[100px] justify-between"
    >
      <div className="pt-3 overflow-auto hideScroll custom-scrollbar">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="px-3 py-4 border-b border-gray-200">
                <Skeleton className="w-[42px] h-[42px] mx-auto mb-2 rounded-full" />
                <Skeleton className="h-[14px] w-[60px] mx-auto mt-2" />
              </div>
            ))}
          </>
        ) : (
          newsLetters.map((newsLetter: any) => {
            return (
              <Item
                key={newsLetter.id}
                index={newsLetter.id}
                name={newsLetter.name}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onClick={onClick}
              ></Item>
            );
          })
        )}
      </div>
      <div className="bg-white border-t border-gray-200">
        <div className="">
          <ChangeButton></ChangeButton>
          <Option setOpenModal={setOpenModal}></Option>
        </div>
        <div className="border-t border-gray-200">
          <Authentication handleLogOut={handleLogOut}></Authentication>
        </div>
      </div>
    </div>
  );
};

const Authentication = ({ handleLogOut }: any) => {
  return (
    <div className="py-3 px-5">
      <span
        onClick={handleLogOut}
        className="cursor-pointer font-bold text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
      >
        로그아웃
      </span>
    </div>
  );
};

const Item = ({ index, name, onClick, activeTab, setActiveTab }: any) => {
  const isActive = index === activeTab;
  return (
    <div
      className={`px-3 py-4 border-b border-gray-200 cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-purple-50 to-purple-100/50"
          : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-white"
      }`}
      onClick={() => {
        onClick(index);
      }}
    >
      <div className="mt-2 w-auto">
        <img
          className={`mx-auto size-[42px] rounded-full object-cover transition-all duration-200 ${
            isActive ? "ring-2 ring-purple-400 shadow-md" : "hover:shadow-sm"
          }`}
          src={"images/" + name + ".png"}
          alt=""
        />
      </div>

      <div className="mt-3">
        {isActive ? (
          <div className="text-center">
            <div className="border-t-2 border-solid border-purple-500 rounded-sm my-2"></div>
            <div className="text-xs font-bold text-purple-700 mt-1">{name}</div>
          </div>
        ) : (
          <div className="break-keep break-words text-xs mt-2 mb-2 text-center font-bold text-gray-600 hover:text-gray-800 transition-colors">
            {name}
          </div>
        )}
      </div>
    </div>
  );
};

// Item이랑 합치면 되는데 시간 없으니깐 나중에 합치기
const ChangeButton = () => {
  return (
    <Link to="/subscribe">
      <div className="mt-4 px-5 cursor-pointer group">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 size-[42px] mx-auto rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
          <img
            className="mx-auto p-[10px] h-full"
            src="images/add.png"
            alt=""
          />
        </div>
        <div className="text-xs mb-5 mt-2 text-center font-bold text-gray-600 group-hover:text-gray-800 transition-colors">
          변경
        </div>
      </div>
    </Link>
  );
};

const Option = ({ setOpenModal }: any) => {
  return (
    <div
      onClick={() => {
        setOpenModal(true);
      }}
      className="mt-2 px-5 cursor-pointer group"
    >
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 size-[42px] mx-auto rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
        <img
          className="mx-auto size-[20px] h-full"
          src="images/setting.svg"
          alt=""
        />
      </div>

      <div className="text-xs mb-5 mt-2 text-center font-bold text-gray-600 group-hover:text-gray-800 transition-colors">
        설정
      </div>
    </div>
  );
};

const List = ({
  mail,
  setMail,
  handleMail,
  newsLetters,
  activeMail,
  setActiveMail,
  handleGetMailDetailData,
  isLoading,
}: any) => {
  const [isMailDataLoading, setIsMailDataLoading] = useState(false);

  useEffect(() => {
    if (newsLetters.length > 0) {
      setIsMailDataLoading(true);
      let data = handleMail(newsLetters[0].id);
      data.then((result: any) => {
        setMail(result);
        setIsMailDataLoading(false);
        sendEventToAmplitude("view article detail", {
          "article name": result.name,
          "post name": result.mails[0].subject,
        });
      });
    }
  }, [newsLetters]);

  useEffect(() => {
    if (
      Object.keys(mail).length !== 0 &&
      mail.constructor === Object &&
      mail.mails[0]
    ) {
      setActiveMail(mail.mails[0].id);
    }
  }, [mail]);

  useEffect(() => {
    if (mail.mails) {
      handleGetMailDetailData(mail.mails[0].s3_object_key);
    }
  }, [mail]);

  const isMailLoading = isLoading || isMailDataLoading || !mail.mails || mail.mails.length === 0;

  return (
    <div className="max-w-[310px] sticky top-0 z-2 flex-[24%] border-r border-gray-200 flex flex-col bg-gradient-to-b from-white to-gray-50/30 shadow-lg h-screen">
      <div className="min-h-[inherit] overflow-auto hideScroll custom-scrollbar">
        <ListItem item={<Header></Header>}></ListItem>
        {isMailLoading ? (
          <>
            {[...Array(5)].map((_, index) => (
              <ListItem
                key={index}
                item={
                  <Column
                    isLoading={true}
                    handleGetMailDetailData={handleGetMailDetailData}
                  />
                }
              />
            ))}
          </>
        ) : (
          mail.mails?.map((item: any) => {
            return (
              <ListItem
                key={item.id}
                activeMail={activeMail}
                id={item.id}
                subeject={item.subject}
                mail={mail}
                setActiveMail={setActiveMail}
                item={
                  <Column
                    handleGetMailDetailData={handleGetMailDetailData}
                    key={item.id}
                    subject={item.subject}
                    s3_object_key={item.s3_object_key}
                    name={mail.name}
                    recv_at={item.recv_at}
                    isLoading={false}
                  ></Column>
                }
              ></ListItem>
            );
          })
        )}
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="flex items-center gap-[15px] min-h-[inherit]">
      <div className="text-[30px] font-[800]">Pockets</div>
    </div>
  );
};

const ListItem = ({
  item,
  activeMail,
  id,
  subeject,
  mail,
  setActiveMail,
}: any) => {
  const isActive = id === activeMail && activeMail;
  return (
    <div
      onClick={() => {
        if (id) {
          setActiveMail(id);
          sendEventToAmplitude("view article detail", {
            "article name": mail.name,
            "post name": subeject,
          });
        }
      }}
      className={`min-h-[100px] border-b border-gray-200 cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-br from-purple-50 to-purple-100/50 border-l-4 border-l-purple-500"
          : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
      }`}
    >
      <div className="px-5 py-4 focus:bg-slate-100 min-h-[inherit]">{item}</div>
    </div>
  );
};

const Column = ({
  subject,
  name,
  recv_at,
  s3_object_key,
  handleGetMailDetailData,
  isLoading = false,
}: any) => {
  if (isLoading) {
    return (
      <div className="text-[16px] font-bold text-left">
        <div className="py-[12px] px-[20px]">
          <div className="mr-[15px]">
            <Skeleton className="h-[20px] w-full mb-[8px]" />
            <Skeleton className="h-[16px] w-[120px] mb-[10px]" />
          </div>
          <Skeleton className="h-[14px] w-[150px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="text-base font-bold text-left">
      <div
        className="py-2 cursor-pointer group"
        onClick={() => handleGetMailDetailData(s3_object_key)}
      >
        <div className="mb-2">
          <div className="text-gray-700 break-keep font-semibold leading-snug group-hover:text-gray-900 transition-colors">
            {subject}
          </div>
          <div className="text-gray-500 text-sm mt-2 font-medium">{name}</div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="text-gray-400 text-xs font-medium">
            {new Date(recv_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Main = ({ detailmail, newsLetters, activeMail, isLoadingDetail, isLoading }: any) => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeMail]);

  return (
    <div
      className="flex-[70%] h-[100vh] overflow-auto custom-scrollbar"
      ref={mainRef}
    >
      <div className="max-w-[700px] mx-auto mt-[30px]">
        <div>
          {isLoading ? (
            <div className="flex flex-col gap-[10px] font-bold border-b-[1px] border-b-#E8E8E8 pb-[30px]">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-[40px] w-[200px]" />
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-[80%]" />
                <Skeleton className="h-[20px] w-[90%]" />
              </div>
              <div className="mt-10 space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>
          ) : (
            <MainHeader
              detailmail={detailmail}
              newsLetters={newsLetters}
              isLoadingDetail={isLoadingDetail}
            ></MainHeader>
          )}
        </div>
      </div>
    </div>
  );
};

const MainHeader = ({ detailmail, newsLetters, isLoadingDetail }: any) => {
  return (
    <div className="flex flex-col gap-[10px] font-bold border-b-[1px] border-b-#E8E8E8 pb-[30px]">
      <MySummary
        summaryNewsLetterData={detailmail}
        newslettersubscribe={newsLetters}
        isLoadingDetail={isLoadingDetail}
      />

      {isLoadingDetail ? (
        <div className="mt-10 space-y-3">
          <Skeleton className="h-[20px] w-full" />
          <Skeleton className="h-[20px] w-[95%]" />
          <Skeleton className="h-[20px] w-[90%]" />
          <Skeleton className="h-[200px] w-full mt-4" />
          <Skeleton className="h-[20px] w-full" />
          <Skeleton className="h-[20px] w-[85%]" />
          <Skeleton className="h-[200px] w-full mt-4" />
        </div>
      ) : (
        detailmail.map((data: any) => {
          return data.html_body !== null ? (
            <div
              key={data.id}
              className="mt-10"
              dangerouslySetInnerHTML={{ __html: data.html_body }}
            />
          ) : (
            <PageLoding />
          );
        })
      )}
    </div>
  );
};
export default MyPage;
