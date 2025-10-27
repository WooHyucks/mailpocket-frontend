import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  decodedToken,
  getMyPageNewsLetterDetail,
  getMyPageSubscribeData,
  Token,
} from "../../api/api";
import { sendEventToAmplitude } from "../../components/Amplitude";
import { MobileMyPageNav } from "../../components/mobileComponent/MobileNav";
import MobileSummary from "../../components/mobileComponent/MobileSummary";
import PageLoding from "../../components/PageLoding";
import { NewsLetterDataType, SummaryItem } from "../../pages/SubscribePage";

export interface NavNewsLetterDataType {
  id: number;
  s3_object_key: string;
  subject: string;
  read_link: string;
  summary_list: SummaryItem;
  newsletter_id: number;
  date: string;
  from_name: string;
  from_email: string;
  html_body: string;
}

const MobileMyPage = () => {
  const [myNewsLetter, setMyNewsLetter] = useState<NewsLetterDataType[]>([]);
  const [myNewsLetterDetailKey, setMyNewsLetterDetailKey] = useState("");
  const [myNewsLetterDetail, setMyNewsLetterDetail] = useState<NavNewsLetterDataType[]>([]);
  const [selectedItem, setSelectedItem] = useState(0);
  const [activeMail, setActiveMail] = useState(0);
  const navigate = useNavigate();
  const authToken = Token();
  const authTokenDecode = decodedToken();
  const mainRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeMail]);



  useEffect(() => {
    if (!authToken || authTokenDecode === false) {
      navigate("/landingpage");
    } else {
      sendEventToAmplitude("view my page", "");
    }
  }, [authToken, navigate]);

  const handlegetData = async () => {
    try {
      const responseNewsLetterList = await getMyPageSubscribeData(
        "/newsletter?&subscribe_status=subscribed&sort_type=recent"
      );
      setMyNewsLetter(responseNewsLetterList.data);
      if (responseNewsLetterList.data.length > 0) {
        const responseNewsLetterDetail = await getMyPageNewsLetterDetail(myNewsLetterDetailKey ? `/mail?key=${myNewsLetterDetailKey}` : `/newsletter/${responseNewsLetterList.data[0].id}/last-mail`);
        setMyNewsLetterDetail([responseNewsLetterDetail.data]);
        sendEventToAmplitude("view article detail", {
          "article name": responseNewsLetterDetail.data.from_name,
          "post name": responseNewsLetterDetail.data.subject,
        });
      } else {
        window.alert("구독중인 뉴스레터가 없습니다.");
        navigate("/mobileSubscribe");
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패", error);
    }
  };

  useEffect(() => {
    handlegetData();
  }, [myNewsLetterDetailKey]);

  return (
    <div className="h-[100vh] overflow-auto custom-scrollbar" ref={mainRef}>
      <MobileMyPageNav
        MayPageNavNewsLetterData={myNewsLetterDetail}
        mynewsletter={myNewsLetter}
        onSelectItem={setSelectedItem}
        selectItemId={selectedItem}
        setMyNewsLetterDetailKey={setMyNewsLetterDetailKey}
        setActiveMail={setActiveMail}
        activeMail={activeMail}
      />
      <div className="mx-3 h-full" ref={mainRef}>
        <MobileSummary summaryNewsLetterData={myNewsLetterDetail} />
        {myNewsLetterDetail.map((data) => {
          return data.html_body !== null ? (
            <div
              className="mt-10 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: data.html_body }}
            />
          ) : (
            <PageLoding />
          );
        })}
      </div>
    </div>
  );
};

export default MobileMyPage;
