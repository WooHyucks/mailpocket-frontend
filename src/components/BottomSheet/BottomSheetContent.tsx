import { Link } from "react-router-dom";
import { sendEventToAmplitude } from "../Amplitude";

export const BottomSheetContent = ({ setOpen, data }: any) => {
  return (
    <>
      <div className="flex flex-col max-w-80 mx-auto">
        <div>
          <div className="mb-2">
            <span className="text-xl font-extrabold">세상의 모든 뉴스레터</span>
          </div>
          <div className="mb-2">
            <span className="text-xl font-extrabold">
              3줄 요약으로 가볍게 읽기, 어떠세요?
            </span>
          </div>
          <div>
            <span className="font-bold text-[#666666]">
              쌓여가는 메일함, 시간을 줄여드릴게요
            </span>
          </div>
        </div>
        <div className="size-[100px] my-8 mx-auto">
          <img src="/images/MailpocketSymbol.png" alt="" />
        </div>
        <div className="flex flex-col mb-4">
          <div className="">
            <Link
              className="outline-none"
              to="/landingpage"
              // onClick={() => {
              //   sendEventToAmplitude("view suggest service", {
              //     "article name": `${data.from_name}`,
              //     "post name": `${data.subject}`,
              //   });
              // }}
            >
              <button className="bg-[#8F36FF] text-[#FFFFFF] w-full p-[15px] rounded-md font-semibold">
                알아보기
              </button>
            </Link>
          </div>

          <button
            onClick={() => {
              setOpen(false);
            }}
            className=" w-full p-[15px] rounded-md font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
};
