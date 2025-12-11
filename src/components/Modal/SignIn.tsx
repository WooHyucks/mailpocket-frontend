import Cookies from 'js-cookie'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../api/Auth';
import { isMobile } from '../../App'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import { AmplitudeSetUserId, sendEventToAmplitude } from '../Amplitude'
import { GoogleLogin, KakaoLogin, NaverLogin } from '../Oauth/SocialPlatformLogin'
import SignUp from './SignUp'
import { useToast } from "../Toast";

interface SignInModalType {
  setAuthOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignIn = ({ setAuthOpenModal }: SignInModalType) => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  })
  const [notAllow, setNotAllow] = useState(true);
  const [signUpOpenModal, setSignUpOpenModal] = useState(false)
  const showToast = useToast();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref, () => {
    setAuthOpenModal(false);
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  };

  const handleOpenModal = () => {
    setSignUpOpenModal(true)
  }

  useEffect(() => {
    sendEventToAmplitude('view sign in', '');
  }, []);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const identifierTrim = formData.identifier.trim();
      const fullEmail = identifierTrim.endsWith("@mailpocket.shop")
        ? identifierTrim
        : `${identifierTrim}@mailpocket.shop`;

      const response = await authApi.postSignInData({
        ...formData,
        identifier: fullEmail,
      });
      if (response.status === 200 || response.status === 201) {
        const token = typeof response.data === 'string' ? response.data.trim() : response.data;
        Cookies.set("authToken", token, {
          expires: 30,
        });
        await AmplitudeSetUserId(queryClient)
        sendEventToAmplitude("complete sign in", "")
        isMobile ? navigate("/mobilemypage") : navigate("/");
      }
    } catch (error) {
      showToast("아이디 및 비밀번호를 확인해주세요.", { type: "error" });
    }
  };


  useEffect(() => {
    const hasId = formData.identifier.trim().length > 0;
    const hasPw = formData.password.length > 0;
    if (hasId && hasPw) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [formData]);

  return (
    <div className='text-center mx-auto max-w-900 h-auto'>
      <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-10">
        <div ref={ref}
          className='py-3 px-7 rounded-lg relative flex justify-center flex-col max-h-400 w-[430px] bg-white'>
          <div
            className="absolute top-1 right-3 cursor-pointer text-2xl"
            onClick={() => setAuthOpenModal(false)}
          >
            X
          </div>
          <form className='authcontainer-submit ' onSubmit={handleSubmit}>
            <div>
              <p className='authcontainer-submit_title'>
                뉴스레터 3줄 요약
              </p>
              <p className='text-gray-400  text-base font-semibold'>
                긴 내용도 지루하지 않게
              </p>
            </div>
            <div className='flex flex-col justify-center items-centerf gap-5  w-full mt-6'>
              <KakaoLogin />
              {navigator.userAgent.includes("KAKAOTALK") ? null : <GoogleLogin />}
              <NaverLogin />
            </div>
            <div className='mt-4 mb-1 text-gray-400  text-xs  font-semibold'>또는</div>
            <div className='my-4'>
              <div className="flex items-center gap-1">
                <input
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-customPurple focus:border-customPurple text-sm placeholder-gray-500 placeholder:font-semibold"
                  type="text"
                  name="identifier"
                  placeholder="아이디"
                  value={formData.identifier}
                  onChange={handleInputChange}
                />
                <div className="px-3 py-3 rounded-lg bg-gray-100 text-sm font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  @mailpocket.shop
                </div>
              </div>

            </div>

            <div className='authcontainer-submit_box'>
              <input className='authcontainer-submit_data  placeholder-gray-500  placeholder:font-bold'
                type="password"
                name="password"
                placeholder=' 비밀번호'
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <button className='basecontainer-submitdata' type="submit" disabled={notAllow}>
              로그인
            </button>
          </form>
          <div className='mb-7'>
            <span className='auth-guidecoment'>아이디가 없으신가요?</span>
            <span className='auth-link cursor-pointer' onClick={handleOpenModal}>10초만에 가입하기</span>
          </div>
          {signUpOpenModal && (
            <SignUp setAuthOpenModal={setAuthOpenModal} setSignUpOpenModal={setSignUpOpenModal} />
            // <SlackGuideModal
            //   setOpenModal={setOpenModal}
            //   handlePostNewsLetterData={handlePostNewsLetterData}
            //   subscribelength={subscribelength}
            // />
          )}
        </div>
      </div>
    </div>
  )
}

export default SignIn



