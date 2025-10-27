import React, { useEffect, useState, useRef } from "react";
import { MobileReadNav } from "../../components/mobileComponent/MobileNav";
import MobileSeeMore from "../../components/mobileComponent/MobileSeeMore";
import MobileSummary from "../../components/mobileComponent/MobileSummary";
import { useLocation } from "react-router-dom";
import { decodedToken, getReadMailData, getSubscribeData, Token } from "../../api/api";
import { sendEventToAmplitude } from "../../components/Amplitude";
import { SummaryItem } from "../../pages/SubscribePage";
import PageLoding from "../../components/PageLoding";
import { SubscribeNewsLetterDataType } from "../../components/Summary";
import { isSameDay, format } from "date-fns";
import { Sheet } from "../../components/BottomSheet/BottomSheet";

export interface readmaildataType {
  id: number;
  s3_object_key: string;
  subject: string;
  read_link: string;
  summary_list: SummaryItem;
  newsletter_id: number;
  recv_at: null;
  date: string;
  from_name: string;
  from_email: string;
  html_body: string;
}

const MobileReadPage = () => {
  const [readmaildata, setReadMailData] = useState<readmaildataType[]>([]);
  const [newslettersubscribe, setNewsLettersubscribe] = useState<
    SubscribeNewsLetterDataType[]
  >([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mail = searchParams.get("mail");
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const mainRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
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
    if (!authToken) {
      const timer = setInterval(() => {
        mainRef?.current?.addEventListener("scroll", bottomSheetSetter);
      }, 2000);

      return () => {
        clearInterval(timer);
        mainRef?.current?.removeEventListener("scroll", bottomSheetSetter);
      };
    }
  }, []);

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
    <div className="overflow-auto h-[100vh] custom-scrollbar" ref={mainRef}>
      {!authToken || authTokenDecode === false ? <MobileSeeMore /> : ""}
      <MobileReadNav
        ReadNavNewsLetterData={readmaildata}
        newslettersubscribe={newslettersubscribe}
      />
      <div className="mt-1 mx-3">
        <MobileSummary summaryNewsLetterData={readmaildata} />
      </div>

      <div className="mt-5 mx-3">
        {readmaildata.map((data) => {
          return data.html_body !== null ? (
            <div dangerouslySetInnerHTML={{ __html: data.html_body }} />
          ) : (
            <PageLoding />
          );
        })}
      </div>
      <Sheet open={open} setOpen={setOpen} mailData={readmaildata}></Sheet>
    </div>
  );
};

export default MobileReadPage;
