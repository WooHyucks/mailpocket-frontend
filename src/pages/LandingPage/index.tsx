import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/Auth';
import { sendEventToAmplitude } from '../../components/Amplitude';

const LandingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // 랜딩 진입 시 토큰/캐시 정리
    Cookies.remove("authToken");
    queryClient.clear();
    sendEventToAmplitude('view landing page', '');
  }, [queryClient]);

  const handlePostUserData = async () => {
    try {
      const responseUserData = await authApi.postUserData();
      if (responseUserData.status === 201 || responseUserData.status === 200) {
        const token = typeof responseUserData.data === 'string' ? responseUserData.data.trim() : responseUserData.data;
        Cookies.set("authToken", token, {
          expires: 30,
        });
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    }
  }

  const handleAmplitudeData = async () => {
    try {
      await handlePostUserData();
      sendEventToAmplitude("click start in landing page", '');
      const authToken = Cookies.get("authToken");
      if (authToken) {
        navigate("/subscribe");
      } else {
        console.log("토큰이 아직 발급되지 않았습니다.");
      }
    } catch (error) {
      console.log("Api 데이터 불러오기 실패");
    }
  }

  return (
    <div className='bg-gradient-to-b from-white via-purple-50/30 to-white flex flex-col items-center justify-center min-h-screen'>
      {/* Header */}
      <div className="sticky z-10 top-0 flex items-center justify-between w-full bg-white/80 backdrop-blur-md shadow-sm">
        <img 
          className="h-6 m-4 bg-white md:w-[90px] md:mt-[10px] md:ml-[10px] md:h-[20px] cursor-pointer transition-opacity hover:opacity-80"
          src="/images/MailpocketLogo.png"
          alt="Logo"
          onClick={() => (window.location.href = "/")}
        />
      </div>

      {/* Main Content */}
      <div className='flex items-center justify-center w-full max-w-[900px] px-[50px] md:px-[20px] h-full'>
        <div className='w-full mt-12 md:mt-8'>
          {/* Hero Section */}
          <div className='text-center mb-16 md:mb-12'>
            <div className='flex justify-center mb-6'>
              <img 
                className='w-[80px] md:w-[70px] animate-bounce drop-shadow-lg' 
                src="/images/MailpocketSymbol.png" 
                alt="MailpocketSymbol" 
              />
            </div>
            <img className='w-[250px] md:w-[150px] mx-auto' src="/images/MailpocketLogo.png" alt="MailpocketLogo" />
            <p className='text-gray-600 text-lg md:text-base font-semibold mt-3'>
              뉴스레터 3줄 요약
            </p>
          </div>

          {/* Features Section */}
          <div className='mb-20 md:mb-16'>
            <h2 className='font-extrabold text-3xl md:text-2xl mb-12 md:mb-8 text-center'>
              메일 포켓을 사용하면 이런 게 좋아요!
            </h2>
            
            {/* Feature 1 */}
            <div className='mb-12 md:mb-10 p-6 md:p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition-all duration-300'>
              <div className='flex items-start gap-4 md:gap-3'>
                <div className='w-10 h-10 md:w-8 md:h-8 bg-gradient-to-br from-customPurple to-purple-600 flex items-center justify-center rounded-full shadow-md flex-shrink-0'>
                  <span className='text-white font-bold text-lg md:text-sm'>1</span>
                </div>
                <div className='flex-1'>
                  <p className='text-xl md:text-base font-extrabold text-gray-800 mb-3'>
                    매일 쏟아지는 뉴스레터를 3줄 요약해서 슬랙에 보내드려요.
                  </p>
                  <div className='text-base md:text-sm text-gray-600 leading-relaxed space-y-1'>
                    <p>눈으로만 훑어보세요. 재미 있는 뉴스라면 조금 더 자세히 보고,</p>
                    <p>슬랙의 save item을 사용하면 나중에 읽을 수도 있어요.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className='mb-12 md:mb-10 p-6 md:p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition-all duration-300'>
              <div className='flex items-start gap-4 md:gap-3'>
                <div className='w-10 h-10 md:w-8 md:h-8 bg-gradient-to-br from-customPurple to-purple-600 flex items-center justify-center rounded-xl shadow-md flex-shrink-0'>
                  <span className='text-white font-bold text-lg md:text-sm'>2</span>
                </div>
                <div className='flex-1'>
                  <p className='text-xl md:text-base font-extrabold text-gray-800 mb-3'>
                    메일함에 일회성 메일이 쌓이는걸 방지할 수 있어요.
                  </p>
                  <div className='text-base md:text-sm text-gray-600 leading-relaxed space-y-1'>
                    <p>뉴스레터 때문에 메일함이 항상 999+ 개 이상 쌓여 있고, 중요 메일 놓쳐본적 많으시죠?</p>
                    <p>뉴스레터는 메일 포켓이 받고, 슬랙으로 요약해서 슝-🚀 보내 드릴게요.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className='mb-16 md:mb-12'>
            <div className='text-center mb-8'>
              <div className='inline-block px-6 py-3 rounded-full bg-gradient-to-r from-customPurple/10 to-purple-100 border border-purple-200'>
                <span className='font-semibold text-customPurple text-base md:text-sm'>
                  메일포켓을 미리 알아볼까요?
                </span>
              </div>
            </div>

            {/* Subscribe Preview - 텍스트 왼쪽, 이미지 오른쪽 */}
            <div className='mb-16 md:mb-12 flex lg:flex-row items-center gap-8 md:gap-6'>
              <div className='flex-1 w-full lg:w-auto'>
                <h2 className='font-extrabold text-2xl md:text-xl mb-6 text-gray-800'>
                  다양한 뉴스레터가 여러분을 기다리고 있어요!
                </h2>
                <div className='text-base md:text-sm text-gray-600 leading-relaxed space-y-3'>
                  <p>메일포켓은 IT, 시사, 재테크를 비롯한 다양한 분야의 뉴스레터를 품고 있어요.</p>
                  <p>여러 주제에서 벌어지고 있는 흥미로운 이야기와 혁신적인 소식들을 하나둘씩 열어보면 어떨까요?</p>
                  <p>여러분의 궁금증을 해소할 최신 소식과 유용한 정보들이 여기 기다리고 있어요!</p>
                </div>
              </div>
              <div className='flex-1 w-full lg:w-auto'>
                <div className='rounded-2xl overflow-hidden shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300'>
                  <img 
                    className='w-full' 
                    src="/images/subscribeimg.png" 
                    alt="subscribeimg" 
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className='my-12 border-t-2 border-gradient-to-r from-transparent via-purple-200 to-transparent'></div>

            {/* Summary Preview - 이미지 왼쪽, 텍스트 오른쪽 */}
            <div className='flex  lg:flex-row items-center gap-8 md:gap-6'>
              <div className='flex-1 w-full lg:w-auto order-1 lg:order-1'>
                <div className='rounded-2xl overflow-hidden shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300'>
                  <img 
                    className='w-full' 
                    src="/images/summaryimg.png" 
                    alt="summaryimg" 
                  />
                </div>
              </div>
              <div className='flex-1 w-full lg:w-auto order-2 lg:order-2'>
                <h2 className='font-extrabold text-2xl md:text-xl mb-6 text-gray-800'>
                  요약된 뉴스소식을 슬랙 채널에서 만나보세요 🔥
                </h2>
                <div className='text-base md:text-sm text-gray-600 leading-relaxed space-y-3'>
                  <p>메일함에서 벗어나 더 편리한 슬랙 채널에서 정보를 확인하고</p>
                  <p>여러분의 의견을 채널에 있는 멤버들과 공유할 수 있어요!</p>
                  <p>MailPocket은 여러 채널을 지원하며 각 주제에 맞는 내용을 정리해서 제공해드려요</p>
                  <p>부담 없이 다양한 주제의 뉴스레터를 추가해주세요!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        className="flex items-center justify-center fixed bottom-5 cursor-pointer left-0 right-0 mx-auto bg-gradient-to-r from-customPurple to-purple-600 hover:from-purple-600 hover:to-customPurple w-[88%] max-w-[630px] h-[52px] md:h-[48px] rounded-xl animate-fadeIn z-10 shadow-2xl text-base md:text-sm text-white font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
        onClick={handleAmplitudeData}
      >
        메일포켓 이용하기
      </button>
    </div>
  );
}

export default LandingPage;
