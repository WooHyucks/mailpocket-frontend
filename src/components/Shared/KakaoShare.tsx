import { useEffect } from "react";
import { SummaryNewsLetterDataType } from "../../pages/ReadPage";

function cutStringToByteLimit(str: string, limit: any) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });

  let encoded = encoder.encode(str);
  if (encoded.length <= limit) {
    return str;
  }

  let cutIndex = limit;
  while (cutIndex > 0 && (encoded[cutIndex] & 0xC0) === 0x80) {
    cutIndex--;
  }

  const cutEncoded = encoded.slice(0, cutIndex);
  try {
    let cutString = decoder.decode(cutEncoded);
    cutString += '...';
    return cutString;
  } catch (e) {
    console.error('Error decoding:', e);
    return '';
  }
}

type KakaoShareProps = {
  summaryNewsLetterData?: SummaryNewsLetterDataType[];
  text?: string;
  containerstyle: string;
  imgstyle: string;
}

const KakaoShare = ({ summaryNewsLetterData, text, containerstyle, imgstyle }: KakaoShareProps) => {
  useEffect(() => {
    initKakao();
  }, []);

  const initKakao = () => {
    //@ts-ignore
    if (!window.Kakao.isInitialized()) {
      //@ts-ignore
      window.Kakao.init("09f25cccf0a9707d66c323f542cbdd41");
    }
  };

  const shareKakaoLink = () => {
    if (summaryNewsLetterData && summaryNewsLetterData.length > 0) {
      const firstNewsLetter = summaryNewsLetterData[0];
      const firstNewsLetterLink = firstNewsLetter.read_link;
      const fullText = summaryNewsLetterData.map(data => data.share_text).join('\n\n');
      const textToSend = cutStringToByteLimit(fullText, 1100);
      //@ts-ignore
      window.Kakao.Link.sendDefault({
        objectType: "text",
        text: `${firstNewsLetter.from_name}의 뉴스레터 요약 결과입니다.\n\n${textToSend}`,
        link: {
          webUrl: firstNewsLetterLink,
          mobileWebUrl: firstNewsLetterLink
        },
      });
    }
  };

  return (
    <div>
      <div className={containerstyle} onClick={shareKakaoLink}>
        <img className={imgstyle} src="/images/kakao.png" alt="카카오톡 공유" />
        <span className="font-extrabold text-sm">{text}</span>
      </div>
    </div>
  );
};

export default KakaoShare;
