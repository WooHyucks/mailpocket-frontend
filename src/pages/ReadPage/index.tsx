import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { decodedToken, getReadMailData, getSubscribeData, Token } from "../../api/api";
import { isMobile } from "../../App";
import { sendEventToAmplitude } from "../../components/Amplitude";
import PageLoding from "../../components/PageLoding";
import { SubscribeNewsLetterDataType, Summary } from "../../components/Summary";
import { SummaryItem } from "../SubscribePage";
import { isSameDay, format } from "date-fns";
import { Sheet } from "../../components/BottomSheet/BottomSheet";
import SignUp from "../../components/Modal/SignUp";
import SignIn from "../../components/Modal/SignIn";

export interface SummaryNewsLetterDataType {
  id: number;
  s3_object_key: string;
  subject: string;
  read_link: string;
  summary_list: SummaryItem;
  newsletter_id: number;
  date: string;
  from_name: string;
  html_body: string;
  share_text?: string;
}

const ReadPage = () => {
  const [readmaildata, setReadMailData] = useState<SummaryNewsLetterDataType[]>(
    []
  );
  const [newslettersubscribe, setNewsLettersubscribe] = useState<SubscribeNewsLetterDataType[]>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mail = searchParams.get("mail");
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [authOpenModal, setAuthOpenModal] = useState(false);

  const bottomSheetSetter = () => {
    const container = mainRef.current;
    const today: string = format(new Date(), "yyyy-MM-dd");
    let lastDate: string | null = localStorage.getItem("lastDate");
    let scrollPosition;
    if (!container) return;
    if (
      container?.scrollTop /
      (container?.scrollHeight - container?.clientHeight) >=
      0.2
    ) {
      scrollPosition = true;
    }
    if (!lastDate) {
      localStorage.setItem("lastDate", "0000-00-00");
    } else if (lastDate) {
      if (!isSameDay(today, lastDate) && scrollPosition) {
        localStorage.setItem("lastDate", today);
        lastDate = today;
        setOpen(true);
      }
    }
  };

  useEffect(() => {
    if (!authToken || authTokenDecode === false) {
      const timer = setInterval(() => {
        mainRef?.current?.addEventListener("scroll", bottomSheetSetter);
      }, 2000);

      return () => {
        clearInterval(timer);
        mainRef?.current?.removeEventListener("scroll", bottomSheetSetter);
      };
    }
  }, []);

  useEffect(() => {
    if (isMobile) {
      navigate(`/mobileread?mail=${mail}`);
    }
  }, [isMobile]);

  const handleModalOpen = () => {
    setAuthOpenModal(true);
  };

  const handleGetNewsLetterData = async () => {
    try {
      const responesSubscribe = await getSubscribeData(
        "/newsletter?&subscribe_status=subscribed&sort_type=recent"
      );
      setNewsLettersubscribe(responesSubscribe.data);
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    }
  };

  const handleGetData = async () => {
    try {
      const response = await getReadMailData(mail);
      setReadMailData([response.data]);
      sendEventToAmplitude("view article detail", {
        "article name": response.data.from_name,
        "post name": response.data.subject,
      });
    } catch (error) {
      console.log("Api 데이터 불러오기 실패", error);
    }
  };

  useEffect(() => {
    handleGetData();
    handleGetNewsLetterData();
  }, [location]);

  return (
    <div className="bg-white overflow-scroll h-[100vh]" ref={mainRef}>
      {!authToken || authTokenDecode === false ? (
        <div
          className="flex sticky top-0 z-10 bg-white items-center justify-between border-b p-4 "
          ref={mainRef}
        >
          <img
            className="h-6 md:w-[90px] md:mt-[10px] md:ml-[10px] md:h-[20px]"
            src="/images/MailpocketLogo.png"
            alt="Logo"
            onClick={() => (window.location.href = "/landingpage")}
          />
          <div className="flex md:flex-col md:items-end md:mr-2">
            <span className="text-base font-extrabold">
              수백개 넘는 뉴스레터, 골라서 3줄 요약 받아보실래요?
            </span>
            <Link
              className="font-extrabold text-base underline ml-2 text-customPurple"
              to="/landingpage"
            >
              메일포켓 알아보기
            </Link>
          </div>
          <span
            className="font-extrabold mr-4 text-base text-customPurple"
            onClick={handleModalOpen}
          >
            로그인하기
          </span>
        </div>
      ) : (
        ""
      )}
      <div className="flex flex-col items-center justify-center pb-[80px]">
        <Summary
          summaryNewsLetterData={readmaildata}
          newslettersubscribe={newslettersubscribe}
        />
        <div className="border-b w-[730px] mt-10">
          <p className="font-bold text-lg p-3 text-gray-500">본문</p>
        </div>
        <div className="mt-2">
          {readmaildata.map((data) => {
            return data.html_body !== null ? (
              <div dangerouslySetInnerHTML={{ __html: data.html_body }} />
            ) : (
              <PageLoding />
            );
          })}
        </div>
        <div className="flex justify-center items-center fixed bottom-0  h-[80px]  mt-10">
          <div className="w-[730px] h-[80px] border-t absolute top-0 bg-white z-10">
            <img
              className="w-[180px] absolute top-4 right-0 cursor-pointer"
              src="/images/MailpocketLogo.png"
              alt="MailpocketLogo"
              onClick={() => (window.location.href = "/landingpage")}
            />
          </div>
        </div>
      </div>
      <Sheet open={open} setOpen={setOpen} mailData={readmaildata}></Sheet>
      {
        authOpenModal && (
          <SignIn setAuthOpenModal={setAuthOpenModal} />
        )
      }
    </div>
  );
};

export default ReadPage;
