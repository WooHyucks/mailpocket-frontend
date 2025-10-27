import React, { useEffect, useState } from "react";
import { getChannelData, deleteChannelData } from "../../api/api";
import { Link } from "react-router-dom";
import { sendEventToAmplitude } from "../Amplitude";

export const SettingModal = ({ setOpenModal, newsLetters, openModal }: any) => {
  const [channels, setChannels] = useState([]);
  useEffect(() => {
    let channelData = getChannelData("/channel");
    channelData.then((result: any) => {
      setChannels(result.data);
    });
  }, [openModal]);
  return (
    <div className="w-full h-full fixed top-0">
      <div className="h-full bg-black bg-opacity-35">
        <div className="w-[400px] h-[500px] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg">
          <span
            onClick={() => {
              setOpenModal(false);
            }}
            className="fixed top-3 right-5 cursor-pointer"
          >
            <img src="/images/close.svg" alt="" className="size-6" />
          </span>
          <div className="p-[40px] m-2 h-full">
            <div className="flex flex-col h-full">
              <div className="flex flex-col gap-2 text-[20px] font-extrabold">
                <div>{newsLetters.length}개의 뉴스레터 소식을</div>
                <div>{channels.length}개의 채널에 전달하고 있어요.</div>
              </div>
              <div className="pt-[30px] overflow-hidden h-full ">
                <div className="flex overflow-auto h-full items-start gap-[15px] flex-col custom-scrollbar ">
                  {channels.map((channel: any) => {
                    return (
                      <>
                        <div className="w-full p-1">
                          <div className="flex items-center w-full">
                            <div className="flex-[10%]">
                              <img src={channel.team_icon} alt="" />
                            </div>

                            <div className="flex flex-col flex-[80%] pl-[20px]">
                              <span className="font-extrabold">
                                {channel.name}
                              </span>
                              <span className="font-bold text-[#666666]">
                                {channel.team_name} 워크스페이스
                              </span>
                            </div>
                            <div
                              className="flex-[10%] cursor-pointer"
                              onClick={async () => {
                                await deleteChannelData(channel.id);
                                let channelData = await getChannelData(
                                  "/channel"
                                );
                                setChannels(channelData.data);
                              }}
                            >
                              <img src="images/archive.svg" alt="as" />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>
              <div className="">
                <Link onClick={() => sendEventToAmplitude("click add destination", "")} to="https://slack.com/oauth/v2/authorize?client_id=6427346365504.6466397212374&scope=incoming-webhook,team:read&user_scope=">
                  <button className="bg-[#8F36FF] text-[#FFFFFF] w-full p-[15px] rounded-md font-semibold">
                    채널 추가하기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
