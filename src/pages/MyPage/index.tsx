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
      className="flex flex-col sticky top-0 z-1  flex-[7%]  border-r-[1px] border-r-#E8E8E8 
    shadow-[1px_0px_5px_0px_#E8E8E8] h-screen min-w-[100px] justify-between"
    >
      <div className={`pt-[10px]  overflow-auto hideScroll`}>
        {isLoading ? (
          <>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="px-[10px] border-b-[1px] border-b-#E8E8E8 py-[15px]">
                <Skeleton className="w-[42px] h-[42px] mx-auto mb-[6px] rounded-full" />
                <Skeleton className="h-[14px] w-[60px] mx-auto mt-[6px]" />
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
      <div className="">
        <div className="">
          <ChangeButton></ChangeButton>
          <Option setOpenModal={setOpenModal}></Option>
        </div>
        <div className="border-t-[1px] border-t-#E8E8E8">
          <Authentication handleLogOut={handleLogOut}></Authentication>
        </div>
      </div>
    </div>
  );
};

const Authentication = ({ handleLogOut }: any) => {
  return (
    <div className="py-[12px]">
      <span
        onClick={handleLogOut}
        className="cursor-pointer font-extrabold underline"
      >
        로그아웃
      </span>
    </div>
  );
};

const Item = ({ index, name, onClick, activeTab, setActiveTab }: any) => {
  return (
    <div
      className={`px-[10px] border-b-[1px] border-b-#E8E8E8 h-[100px] cursor-pointer h-auto`}
      onClick={() => {
        onClick(index);
      }}
    >
      <div className="mt-[15px] w-auto">
        <img
          className="mx-auto size-[42px]"
          src={"images/" +  name + ".png"}
          alt=""
        />
      </div>

      <div>
        {index === activeTab ? (
          <div className="border-t-[4px] border-solid border-[#8B5CF6] rounded-sm my-[20px]"></div>
        ) : (
          <div className="break-keep break-words text-[13px] mt-[6px] mb-[15px] text-[14px] font-bold text-[#666666]">
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
      <div className="mt-[15px] px-[19px] cursor-pointer">
        <div className="bg-[#EEEEEE]  size-[42px] mx-auto rounded-xl">
          <img
            className="mx-auto p-[10px] h-full"
            src="images/add.png"
            alt=""
          />
        </div>
        <div className="text-[13px] mb-[20px] mt-[5px] h-[13px] text-[16px] font-bold text-[#666666]">
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
      className="mt-[15px] px-[19px] cursor-pointer "
    >
      <div className="bg-[#EEEEEE]  size-[42px] mx-auto rounded-xl">
        <img
          className="mx-auto size-[20px] h-full"
          src="images\setting.svg"
          alt=""
        />
      </div>

      <div className="text-[13px] mb-[20px] mt-[5px] h-[13px] text-[16px] font-bold text-[#666666]">
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
    <div className="max-w-[310px] sticky top-0 z-2  flex-[24%] border-r-[1px] border-r-#E8E8E8 flex flex-col shadow-[1px_0px_5px_0px_#E8E8E8] h-screen">
      <div className="min-h-[inherit] overflow-auto hideScroll">
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
      className={`min-h-[100px] border-b-[1px] border-b-#E8E8E8 cursor-pointer ${id === activeMail && activeMail ? "bg-[#FAF7FE]" : ""
        }`}
    >
      <div className="ml-[20px] focus:bg-slate-100 min-h-[inherit]">{item}</div>
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
    <div className="text-[16px] font-bold text-left">
      <div
        className="py-[12px]"
        onClick={() => handleGetMailDetailData(s3_object_key)}
      >
        <div className="mr-[15px]">
          <div className=" text-[#666666]  break-keep">{subject}</div>
          <div className=" text-[#8F8F8F] text-[14px] mt-[5px]">{name}</div>
        </div>
        <div className="text-[#D3D0D5] mt-[10px]">
          {new Date(recv_at).toLocaleDateString("ko-KR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
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
