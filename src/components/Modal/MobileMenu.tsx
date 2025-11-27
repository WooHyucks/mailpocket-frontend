import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewsLetterDataType } from "../../api/newsletter/types";
import { AmplitudeResetUserId } from "../Amplitude";
import { Link } from "react-router-dom";
import { SettingModal } from "./settingModalForMobile";
import { newsletterApi } from "../../api/newsletter";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";

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
  const [selectedItem, setSelectedItem] = useState<number | string | undefined>(
    selectItemId || (mynewsletter && mynewsletter.length > 0 ? mynewsletter[0].id : undefined)
  );
  const navigate = useNavigate();
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

  const handleItemClick = (id: number) => {
    onSelectItem(id);
    setSelectedItem(id);
  };

  const { data: newsletterData, isLoading: isLoadingNewsletterDetails } = useQuery<MenuNewsletterType, Error>({
    queryKey: ['newsletter', selectedItem],
    queryFn: () => newsletterApi.getMyPageNewsLetterDetails(selectedItem!.toString()),
    enabled: !!selectedItem && typeof selectedItem !== 'undefined',
  });

  const newsletterDetails = newsletterData?.mails || [];

  if (!mynewsletter || mynewsletter.length === 0) {
    return null;
  }

  return (
    <>
      <Sheet open={true} onOpenChange={(open: boolean) => {
        if (!open) {
          setOpenModal(false);
        }
      }}>
        <SheetContent side="left" className="w-[100vw] sm:w-[100vw] max-w-none p-0 flex flex-row bg-white">
          {/* 뉴스레터 섹션 */}
          <div className="w-[35%] sm:w-[200px] flex flex-col border-r border-gray-200 bg-white">
            <div className="px-4 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-800">뉴스레터</h2>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto subscribe-scrollbar px-2 py-3">
                {mynewsletter.map((data) => (
                  <div
                    key={data.id}
                    ref={data.id === selectedItem ? activeNewsletterRef : null}
                    onClick={() => {
                      handleItemClick(data.id);
                    }}
                    className={`
                      group relative mb-2 px-4 py-4 rounded-xl cursor-pointer transition-all duration-200
                      ${selectedItem === data.id 
                        ? "bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-md border-2 border-purple-200" 
                        : "bg-white hover:bg-gray-50 border border-gray-100 hover:border-purple-200/50 hover:shadow-sm"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className={`
                        relative p-2 rounded-full transition-all duration-200
                        ${selectedItem === data.id 
                          ? "bg-white shadow-lg ring-2 ring-purple-200" 
                          : "bg-gray-50 group-hover:bg-white group-hover:shadow-md"
                        }
                      `}>
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={`/images/${data.name}.png`}
                          alt={String(data.id)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/images/${data.id}.png`;
                          }}
                        />
                        {selectedItem === data.id && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-customPurple rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <span
                        className={`
                          text-center text-sm font-semibold break-words break-keep px-2
                          ${selectedItem === data.id 
                            ? "text-customPurple" 
                            : "text-gray-700 group-hover:text-gray-900"
                          }
                        `}
                      >
                        {data.name}
                      </span>
                      {selectedItem === data.id && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 bg-white">
                <div className="flex flex-col gap-4 py-4 px-3">
                  <ChangeButton />
                  <button
                    onClick={() => {
                      setModalOpen(true);
                    }}
                    className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 active:scale-95"
                  >
                    <img
                      className="w-6 h-6"
                      src="images/setting.svg"
                      alt="settings"
                    />
                  </button>
                </div>
                <div className="px-3 py-3 bg-white border-t border-gray-200">
                  <button
                    onClick={handleLogOut}
                    className="w-full py-2.5 px-4 text-center text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 active:scale-98"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 포켓 섹션 */}
          {selectedItem && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="px-6 py-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-bold text-gray-800">Pockets</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                {isLoadingNewsletterDetails ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm">
                        <Skeleton className="h-5 w-full mb-3 rounded-lg" />
                        <div className="flex items-center gap-2 mt-2">
                          <Skeleton className="w-1.5 h-1.5 rounded-full" />
                          <Skeleton className="h-4 w-40 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(newsletterDetails) && newsletterDetails.length > 0 ? (
                  newsletterDetails.map((data) => (
                    <div
                      key={data.id}
                      className={`
                        group mb-3 p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${data.id === activeMail 
                          ? "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 shadow-md" 
                          : "bg-white border-gray-200 hover:border-purple-200/50 hover:shadow-md hover:bg-gray-50/50"
                        }
                      `}
                      onClick={() => {
                        setActiveMail(data.id);
                        setMyNewsLetterDetailKey(data.s3_object_key);
                        setOpenModal(false);
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <p className={`
                          font-bold text-base leading-snug
                          ${data.id === activeMail ? "text-purple-900" : "text-gray-800 group-hover:text-gray-900"}
                        `}>
                          {data.subject}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(data.recv_at).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              weekday: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      {data.id === activeMail && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            선택됨
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm text-gray-500 font-medium text-center">
                      아직 포켓이 없습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {ModalOpen && (
            <SettingModal
              setOpenModal={setModalOpen}
              newsLetters={mynewsletter}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

const ChangeButton = () => {
  return (
    <Link to="/mobilesubscribe">
      <button className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
        <img
          className="w-6 h-6 filter brightness-0 invert"
          src="images/add.png"
          alt="add"
        />
      </button>
    </Link>
  );
};


export default MobileMenu;
