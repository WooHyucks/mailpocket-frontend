import Cookies from 'js-cookie'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../api/Auth';
import { isMobile } from '../../App'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import { AmplitudeSetUserId, sendEventToAmplitude } from '../Amplitude'
import { GoogleLogin, KakaoLogin, NaverLogin } from '../Oauth/SocialPlatformLogin'
import SignIn from './SignIn'
import { useToast } from "../Toast";


interface SignUpModalType {
  setAuthOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSignUpOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}


const SignUp = ({ setAuthOpenModal, setSignUpOpenModal }: SignUpModalType) => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const [notAllow, setNotAllow] = useState(true);
  const [signInOpenModal, setSignInOpenModal] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [agreeDelegation, setAgreeDelegation] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ref = useRef<HTMLDivElement | null>(null);
  const showToast = useToast();
  useOnClickOutside(ref, () => {
    setAuthOpenModal(false);
  });



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      const isValid = passwordRegex.test(value);
      setIsPasswordValid(isValid);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const identifierTrim = formData.identifier.trim();
    const fullEmail = `${identifierTrim}@mailpocket.shop`;
    const isMailpocketEmail = identifierTrim.length > 0;
    if (!agreeDelegation) {
      showToast("동의가 필요합니다.", { type: "error" });
      return;
    }
    if (!isMailpocketEmail) {
      showToast("메일포켓 전용 이메일(@mailpocket.shop)로만 가입 가능합니다.", { type: "error" });
      return;
    }

    try {
      const response = await authApi.postSignUpData({
        identifier: fullEmail,
        password: formData.password,
      });
      if (response.status === 201 || response.status === 200) {
        const token = typeof response.data === 'string' ? response.data.trim() : response.data;
        Cookies.set("authToken", token, {
          expires: 30,
        });
        await AmplitudeSetUserId(queryClient)
        sendEventToAmplitude("complete sign up", "")
        isMobile ? navigate("/mobilemypage") : navigate("/");
      }
    } catch (error) {
      showToast("아이디 및 비밀번호를 확인해주세요.", { type: "error" });
    }
  };

  const handleOpenModal = () => {
    setSignInOpenModal(true)
    setSignUpOpenModal(false)
  }

  useEffect(() => {
    const identifierTrim = formData.identifier.trim();
    const hasId = identifierTrim.length > 0;
    const isMailpocketEmail = hasId; // 로컬파트만 입력하면 전용 도메인 자동 부여
    const hasPw = formData.password.length > 0;
    if (isPasswordValid && agreeDelegation && isMailpocketEmail && hasId && hasPw) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [isPasswordValid, agreeDelegation, formData.identifier, formData.password]);

  useEffect(() => {
    sendEventToAmplitude('view sign up', '');
  }, []);



  return (
    <div className="z-10 absolute">
      <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
        <div ref={ref}
          className={`py-3 px-7 rounded-lg relative flex justify-center flex-col max-h-400 w-[430px] z-10 bg-white ${isMobile ? "" : "transition-all ease-in-out animate-fadeIn"}`}>
          <div
            className="absolute top-1 right-3 cursor-pointer text-2xl"
            onClick={() => setAuthOpenModal(false)}
          >
            X
          </div>
          <form className='authcontainer-submit' onSubmit={handleSubmit}>
            <div>
              <p className='authcontainer-submit_title'>
                10초 만에 가입하기
              </p>
              <p className='text-gray-400 text-base font-semibold'>
                긴 내용도 지루하지 않게, 뉴스레터 3줄 요약
              </p>
            </div>
            <div className='flex flex-col justify-center items-centerf gap-5  w-full mt-6'>
              <KakaoLogin />
              {navigator.userAgent.includes("KAKAOTALK") ? null : <GoogleLogin />}
              <NaverLogin />
            </div>
            <div className='mt-4 mb-1 text-gray-400  text-xs  font-semibold'>또는</div>
            <div className="my-4 space-y-2">
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
              <input className='authcontainer-submit_data placeholder-gray-500  placeholder:font-bold'
                type="password"
                name="password"
                placeholder=' 비밀번호'
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            {!isPasswordValid && formData.password.length > 0 && (
              <div className='mt-2 text-customPurple font-bold h-9  text-[13px] md:text-sm'>
                비밀번호는 소문자, 숫자, 특수문자를 포함 하고 최소 8자 이상 이어야
                합니다.
              </div>
            )}
            <div className="flex items-start gap-3 my-4 text-left rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
              <input
                id="agree-delegation"
                type="checkbox"
                checked={agreeDelegation}
                onChange={(e) => setAgreeDelegation(e.target.checked)}
                className="mt-[3px] h-4 w-4 rounded border-gray-300 text-customPurple focus:ring-customPurple"
              />
              <label htmlFor="agree-delegation" className="text-sm text-gray-800 leading-relaxed space-y-1">
                <span className="font-semibold">메일포켓이 전용 이메일을 사용해 뉴스레터 구독·수신을 대신 처리해주는 것에 동의합니다.</span>
                <div className="text-gray-500 text-xs">(모든 구독은 언제든지 취소할 수 있어요.)</div>
              </label>
            </div>
            <button
              className='basecontainer-submitdata disabled:opacity-60 disabled:cursor-not-allowed'
              type="submit"
              disabled={notAllow}
            >
              회원가입
            </button>
          </form>
          <div className='mb-7'>
            <span className='auth-guidecoment'>이미 아이디가 있으신가요?</span>
            <span className='auth-link cursor-pointer' onClick={handleOpenModal}>로그인 하기</span>
          </div>
          {signInOpenModal && (
            <SignIn setAuthOpenModal={setAuthOpenModal} />
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

export default SignUp