import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewsLetterDataType } from "../../pages/SubscribePage";
import { AmplitudeResetUserId } from "../Amplitude";
import { Link } from "react-router-dom";
import { SettingModal } from "./settingModalForMobile";
import { getMyPageNewsLetterDetails } from "../../api/api";
import { useQuery } from "@tanstack/react-query";
import PageLoding from "../PageLoding";

interface MobileMenuType {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  mynewsletter: NewsLetterDataType[];
  onSelectItem: React.Dispatch<React.SetStateAction<number>>;
  selectItemId: number | string;
  setMyNewsLetterDetailKey: React.Dispatch<React.SetStateAction<string>>;
  activeMail: number;
  setActiveMail: React.Dispatch<React.SetStateAction<number>>;
}

export type MenuNewsletterDetailType = {
  id: number;
  recv_at: string;
  s3_object_key: string;
  subject: string;
};

export type MenuNewsletterType = {
  category_id: number;
  id: number;
  mail: any;
  mails: MenuNewsletterDetailType[];
  name: string;
};

interface MenuNewsletterDetailsType {
  newsletterDetails: MenuNewsletterDetailType[];
  isAnimating: boolean;
  setMyNewsLetterDetailKey: React.Dispatch<React.SetStateAction<string>>;
  setActiveMail: React.Dispatch<React.SetStateAction<number>>;
  activeMail: number;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu = ({
  setOpenModal,
  mynewsletter,
  onSelectItem,
  selectItemId,
  setMyNewsLetterDetailKey,
  activeMail,
  setActiveMail,
}: MobileMenuType) => {
  const [ModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | string>(selectItemId ? selectItemId : mynewsletter[0].id);
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(true);
  const activeNewsletterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeNewsletterRef.current) {
      activeNewsletterRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [selectedItem]);

  const handleLogOut = async () => {
    Cookies.remove("authToken");
    await AmplitudeResetUserId();
    navigate("/landingpage");
  };

  useEffect(() => {
    if (!isAnimating) {
      setTimeout(() => {
        setOpenModal(false);
      }, 1000);
    }
  }, [isAnimating, setOpenModal]);

  const handleItemClick = (id: number) => {
    onSelectItem(id);
    setSelectedItem(id);
  };

  const { isLoading, data: newsletterData, error } = useQuery<MenuNewsletterType, Error>({
    queryKey: ['newsletter', selectedItem],
    queryFn: () => getMyPageNewsLetterDetails(selectedItem.toString())
  });

  const newsletterDetails = newsletterData?.mails || [];

  return (
    <div>
      <div className={`absolute top-0 inset-0 z-10 ${isAnimating ? 'animate-list-slide-to-right' : 'animate-list-slide-to-left'}`}>
        <div className="h-screen fixed">
          <div className="flex h-screen">
            <div className="bg-white flex flex-col w-fit justify-between">
              <div className="subscribe-scrollbar flex flex-col items-center overflow-y-auto">
                <div className="cursor-pointer text-lg px-6 py-4 border-b sticky top-0 bg-white">
                  <span className="font-semibold text-gray-600" onClick={() => { setIsAnimating(false) }}>
                    닫기
                  </span>
                </div>
                {mynewsletter.map((data) => (
                  <div key={data.id}>
                    <div
                      className={`h-auto gap-4 text-center text-[13px] break-words break-keep border-b px-2 py-3 flex flex-col items-center justify-center`}
                      ref={data.id === selectedItem ? activeNewsletterRef : null}
                      onClick={() => {
                        handleItemClick(data.id);
                      }}
                    >
                      <img
                        className="w-[35px]"
                        src={`/images/${data.id}.png`}
                        alt={String(data.id)}
                      />
                      <span
                        className={`font-semibold w-[65px] pb-2 ${selectedItem === data.id ? "border-customPurple border-solid border-b-4" : ""}`}
                      >
                        {data.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="">
                <div className="flex flex-col">
                  <div className="flex flex-col gap-5">
                    <ChangeButton />
                    <div
                      onClick={() => {
                        setModalOpen(true);
                      }}
                      className="bg-[#EEEEEE] size-[42px] mx-auto rounded-xl px-[10px] cursor-pointer mb-5"
                    >
                      <img
                        className="mx-auto w-[200px] h-full"
                        src="images/setting.svg"
                        alt="settings"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-gray-100 w-full text-center border-t py-3">
                    <span className="text-gray-500 font-semibold" onClick={handleLogOut}>
                      로그아웃
                    </span>
                  </div>
                  {ModalOpen && (
                    <SettingModal
                      setOpenModal={setModalOpen}
                      newsLetters={mynewsletter}
                    />
                  )}
                </div>
              </div>
            </div>
            {Array.isArray(newsletterDetails) && (
              <NewsletterDetails
                setIsAnimating={setIsAnimating}
                activeMail={activeMail}
                setActiveMail={setActiveMail}
                newsletterDetails={newsletterDetails}
                isAnimating={isAnimating}
                setMyNewsLetterDetailKey={setMyNewsLetterDetailKey}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChangeButton = () => {
  return (
    <Link to="/mobilesubscribe">
      <div className="mt-[15px] px-[19px] cursor-pointer">
        <div className="bg-[#EEEEEE] size-[42px] mx-auto rounded-xl">
          <img
            className="mx-auto p-[10px] h-full"
            src="images/add.png"
            alt="add"
          />
        </div>
      </div>
    </Link>
  );
};

const NewsletterDetails = ({
  setIsAnimating,
  activeMail,
  newsletterDetails,
  isAnimating,
  setActiveMail,
  setMyNewsLetterDetailKey
}: MenuNewsletterDetailsType) => {
  const activeMailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeMail && newsletterDetails.length > 0) {
      setActiveMail(newsletterDetails[0].id);
    }
  }, [activeMail, newsletterDetails, setActiveMail]);

  useEffect(() => {
    if (activeMailRef.current) {
      activeMailRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [activeMail]);

  return (
    <div className={`w-[70vw] border-x border-x-1 border-gray-200 rounded-r-lg bg-white overflow-auto hideScroll ${isAnimating ? 'animate-details-slide-to-right' : 'animate-details-slide-to-left'}`}>
      <p className="cursor-pointer text-lg px-4 py-4 border-b font-bold sticky top-0 bg-white">Pockets</p>
      <div>
        {newsletterDetails.map((data) => (
          <div
            key={data.id}
            ref={data.id === activeMail ? activeMailRef : null}
            className={`p-3 h-[120px] border-b flex flex-col justify-around ${data.id === activeMail ? "bg-[#FAF7FE]" : ""}`}
            onClick={() => {
              setActiveMail(data.id);
              setMyNewsLetterDetailKey(data.s3_object_key);
              setIsAnimating(false);
            }}
          >
            <p>{data.subject}</p>
            <p className="text-sm text-[#D3D0D5]">
              {new Date(data.recv_at).toLocaleDateString("ko-KR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
