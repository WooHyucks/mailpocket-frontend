import React, { useEffect, useState, useRef } from "react";
import { MobileReadNav } from "../../components/mobileComponent/MobileNav";
import MobileSeeMore from "../../components/mobileComponent/MobileSeeMore";
import MobileSummary from "../../components/mobileComponent/MobileSummary";
import { useLocation } from "react-router-dom";
import { decodedToken, Token } from "../../api/utils";
import { useReadMailData, useSubscribeData } from "../../queries/newsletter";
import { sendEventToAmplitude } from "../../components/Amplitude";
import { SummaryItem } from "../../api/newsletter/types";
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mail = searchParams.get("mail");
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const mainRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (readmaildataItem) {
      sendEventToAmplitude("view article detail", {
        "article name": readmaildataItem.from_name,
        "post name": readmaildataItem.subject,
      });
    }
  }, [readmaildataItem]);

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
