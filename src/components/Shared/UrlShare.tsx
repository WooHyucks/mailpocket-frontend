import { SummaryNewsLetterDataType } from "../../pages/ReadPage";
import { useToast } from "../Toast";

type UrlShareType = {
  text?: string;
  containerstyle: string;
  imgstyle: string;
  summaryNewsLetterData: SummaryNewsLetterDataType[];
};


const UrlShare = ({ summaryNewsLetterData, text, containerstyle, imgstyle }: UrlShareType) => {
  const showToast = useToast();
  const getApiDataCopy = async () => {
    try {
      const readLinks = summaryNewsLetterData?.map((data) => data.read_link);
      const fromName = summaryNewsLetterData?.map((data) => data.from_name);
      const summaryList = summaryNewsLetterData?.map((data) => data.share_text);
      const combinedValues = [...fromName ,'\t' , ...summaryList,'\t' , ...readLinks];
      const textToCopy = combinedValues.join("\n");
      await navigator.clipboard.writeText(textToCopy);
      console.log(summaryNewsLetterData);
      showToast("텍스트가 클립보드에 복사되었습니다.", { type: "success" });
    } catch (error) {
      console.error("클립보드 복사 실패");
    }
  };


  return (
    <div>
      <div className={containerstyle} onClick={getApiDataCopy}>
        <img className={imgstyle} src="/images/url.svg" alt="url" />
        <button className="font-extrabold text-sm">{text}</button>
      </div>
    </div>
  );
};

export default UrlShare;
