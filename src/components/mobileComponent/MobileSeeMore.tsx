import React from 'react'
import { Link } from 'react-router-dom'

const MobileSeeMore = () => {
  return (
    <div className='sticky top-0 z-10'>
      <div className='border-b flex items-center justify-center bg-white p-3'>
        <span className='text-sm text-gray-400 font-bold'>수백개 넘는 뉴스레터, 골라서 3줄 요약 받아보실래요?</span>
        <Link className="font-extrabold text-sm underline ml-2 text-customPurple" to="/landingpage">알아보기</Link>
      </div>
    </div>

  )
}

export default MobileSeeMore