
import { useState } from 'react';
import { SummaryNewsLetterDataType } from '../../pages/ReadPage';
import KakaoShare from '../Shared/KakaoShare'
import UrlShare from '../Shared/UrlShare'


interface SummaryProps {
  summaryNewsLetterData: SummaryNewsLetterDataType[]

}


const MobileSummary = ({ summaryNewsLetterData }: SummaryProps) => {
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});


  const toggleSummaryExpansion = (summaryId: number) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [summaryId]: !prevState[summaryId],
    }));
  };

  return (
    <div className="w-full px-3">
      <div className="max-w-full mx-auto">
        <div className="bg-gradient-to-br from-white via-purple-50/20 to-white rounded-2xl border border-purple-100/50 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-purple-50/50 to-white border-b border-purple-100/50">
            <div className="flex items-center gap-2">
              <img 
                className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform" 
                src="/images/MailpocketSymbol.png" 
                alt="MailpocketSymbol" 
                onClick={() => (window.location.href = "/mobilemypage")} 
              />
              <p className="font-extrabold text-gray-800 text-base">메일포켓이 요약한 내용이에요</p>
            </div>
            <div className="flex gap-2">
              <UrlShare 
                summaryNewsLetterData={summaryNewsLetterData} 
                text={""} 
                containerstyle={"py-2 px-2 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-md transition-all duration-200 active:scale-95"} 
                imgstyle={'w-5 h-5'} 
              />
              <KakaoShare 
                summaryNewsLetterData={summaryNewsLetterData} 
                text={""} 
                containerstyle={"py-2 px-2 h-10 bg-kakaoBgColor rounded-xl hover:shadow-md transition-all duration-200 active:scale-95"} 
                imgstyle={'w-5 h-5'} 
              />
            </div>
          </div>
          
          {/* Summary Content */}
          {summaryNewsLetterData.map((data) => (
            <div key={data.id}>
              <div className={`p-4 flex flex-col items-start transition-all duration-300 ${expandedSummaries[data.id] ? 'min-h-[280px]' : 'h-[280px] overflow-hidden'} custom-scrollbar`}>
                {data.summary_list ? (
                  <div className="space-y-4 w-full">
                    {Object.entries(data.summary_list).map(([key, value], index) => (
                      <div 
                        key={key} 
                        className="p-4 bg-gradient-to-br from-purple-50/40 to-white rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mt-2"></div>
                          <div className="flex-1">
                            <p className="font-extrabold text-gray-800 mb-2 text-base">{key}</p>
                            <span className="text-sm text-gray-600 font-medium leading-relaxed">{String(value)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 font-semibold">요약 데이터가 없습니다</p>
                  </div>
                )}
              </div>
              
              {/* Expand/Collapse Button */}
              <div 
                className="p-3 cursor-pointer text-center bg-gradient-to-r from-purple-50/30 to-white border-t border-purple-100/50 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-white transition-all duration-200 active:scale-98"
                onClick={() => toggleSummaryExpansion(data.id)}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base text-customPurple font-bold">
                    {expandedSummaries[data.id] ? '닫기' : '펼치기'}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-customPurple transition-transform duration-200 ${expandedSummaries[data.id] ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}

export default MobileSummary