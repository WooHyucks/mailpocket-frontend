
import { useState } from 'react';
import { NavNewsLetterDataType } from '../../mobile/MobileMyPage';
import { SummaryNewsLetterDataType } from '../../pages/ReadPage';
import KakaoShare from '../Shared/KakaoShare'
import UrlShare from '../Shared/UrlShare'


interface SummaryProps {
  summaryNewsLetterData: SummaryNewsLetterDataType[]

}


const MobileSummary = ({ summaryNewsLetterData }: SummaryProps) => {
  const [newslettemoresee, setNewsLetteMoreSee] = useState(true);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});


  const toggleSummaryExpansion = (summaryId: number) => {
    setExpandedSummaries((prevState) => ({
      ...prevState,
      [summaryId]: !prevState[summaryId],
    }));
  };

  return (
    <div>
      <div className='flex justify-center gap-5'>
        <div className='border rounded-lg bg-white w-[650px]' style={{ boxShadow: "1px 2px lightgrey" }}>
          <div className='flex items-center justify-between px-2 py-3 border-b'>
            <div className='flex items-center'>
              <img className='w-10 mx-1' src="/images/MailpocketSymbol.png" alt="MailpocketSymbol" onClick={() => (window.location.href = "/mobilemypage")} />
              <p className='font-extrabold'>메일포켓이 요약한 내용이에요</p>
            </div>
            <div className='flex gap-3'>
              <UrlShare summaryNewsLetterData={summaryNewsLetterData} text={""} containerstyle={"py-2 px-2 h-10 bg-gray-200  rounded-lg"} imgstyle={'w-6'} />
              <KakaoShare summaryNewsLetterData={summaryNewsLetterData} text={""} containerstyle={"py-2 px-2 h-10 bg-kakaoBgColor rounded-lg"} imgstyle={'w-6'} />
            </div>
          </div>
          {summaryNewsLetterData.map((data) => (
            <div key={data.id} className={`p-3 flex flex-col items-start border-b h-[230px] ${expandedSummaries[data.id] ? 'h-auto' : 'overflow-hidden'} custom-scrollbar`}>
              {data.summary_list ? (
                Object.entries(data.summary_list).map(([key, value]) => (
                  <div className='my-2' key={key}>
                    <div className='flex flex-col'>
                      <p className='font-extrabold'>{key}</p>
                      <span className='mt-1 text-sm text-gray-500 font-semibold'>{value}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className='mt-2 text-sm text-gray-500 font-semibold'>요약 데이터가 없습니다</p>
              )}
            </div>
          ))}
          {summaryNewsLetterData.map((data) => (
            <div key={data.id} className='p-3 cursor-pointer text-center' onClick={() => toggleSummaryExpansion(data.id)}>
              <span className='text-lg text-customPurple font-bold'>
                {expandedSummaries[data.id] ? '닫기' : '펼치기'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}

export default MobileSummary