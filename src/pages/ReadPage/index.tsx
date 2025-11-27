import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { decodedToken, Token } from "../../api/utils";
import { isMobile } from "../../App";
import { sendEventToAmplitude } from "../../components/Amplitude";
import PageLoding from "../../components/PageLoding";
import { Summary } from "../../components/Summary";
import { SummaryItem } from "../../api/newsletter/types";
import { isSameDay, format } from "date-fns";
import { Sheet } from "../../components/BottomSheet/BottomSheet";
import SignIn from "../../components/Modal/SignIn";
import { useReadMailData, useSubscribeData } from "../../queries/newsletter";

export interface SummaryNewsLetterDataType {
  id: number;
  name: string;
  s3_object_key: string;
  subject: string;
  read_link: string;
  summary_list: SummaryItem;
  created_at: string;
  newsletter_id: number;
  date: string;
  updated_at: string;
  from_name: string;
  html_body: string;
  share_text?: string;
}

const ReadPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mail = searchParams.get("mail");
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [authOpenModal, setAuthOpenModal] = useState(false);

  const { data: readmaildataItem } = useReadMailData(mail, !!mail);
  const readmaildata = readmaildataItem ? [readmaildataItem] : [];
  const { data: newslettersubscribe = [] } = useSubscribeData(
    "/newsletter?&subscribe_status=subscribed&sort_type=recent",
    !!authToken && authTokenDecode !== false
  );

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

  useEffect(() => {
    if (readmaildataItem) {
      sendEventToAmplitude("view article detail", {
        "article name": readmaildataItem.from_name,
        "post name": readmaildataItem.subject,
      });
    }
  }, [readmaildataItem]);

  return (
    <div className="bg-gradient-to-br from-purple-50/30 via-white to-purple-50/20 overflow-scroll h-[100vh]" ref={mainRef}>
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
      <div className="flex flex-col items-center justify-center pb-[80px] md:pb-20 px-4 md:px-2">
        <Summary
          summaryNewsLetterData={readmaildata}
          newslettersubscribe={newslettersubscribe}
        />
        <div className="w-full max-w-[730px] mt-10 md:mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-customPurple to-purple-600 rounded-full"></div>
            <p className="font-extrabold text-lg md:text-base text-gray-800">본문</p>
          </div>
        </div>
        <div className="w-full max-w-[730px] mt-2 prose prose-lg md:prose-base">
          {readmaildata.map((data) => {
            return data.html_body !== null ? (
              <div 
                key={data.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-4"
                dangerouslySetInnerHTML={{ __html: data.html_body }} 
              />
            ) : (
              <PageLoding />
            );
          })}
        </div>
        <div className="flex justify-center items-center fixed bottom-0 w-full h-[80px] md:h-[60px] mt-10">
          <div className="w-full max-w-[730px] h-[80px] md:h-[60px] border-t border-gray-200 absolute top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-end pr-4 md:pr-2">
            <img
              className="w-[180px] md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity"
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
