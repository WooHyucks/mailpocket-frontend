import Cookies from 'js-cookie'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { postSignUpData, Token } from '../../api/api'
import { isMobile } from '../../App'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import { AmplitudeSetUserId, sendEventToAmplitude } from '../Amplitude'
import { GoogleLogin, KakaoLogin, NaverLogin } from '../Oauth/SocialPlatformLogin'
import SignIn from './SignIn'


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
  const navigate = useNavigate();
  const authToken = Token();
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

    if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      const isValid = passwordRegex.test(value);
      setIsPasswordValid(isValid);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await postSignUpData(formData);
      if (response.status === 201) {
        Cookies.set("authToken", response.data, {
          expires: 30,
        });
        await AmplitudeSetUserId()
        sendEventToAmplitude("complete sign up", "")
        isMobile ? navigate("/mobilemypage") : navigate("/");
      }
    } catch (error) {
      alert("아이디 및 비밀번호를 확인해주세요.");
    }
  };

  const handleOpenModal = () => {
    setSignInOpenModal(true)
    setSignUpOpenModal(false)
  }

  useEffect(() => {
    if (isPasswordValid) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [isPasswordValid]);

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
            <div className='authcontainer-submit_box my-4'>
              <input className='authcontainer-submit_data placeholder-gray-500  placeholder:font-bold'
                type="text"
                name="identifier"
                placeholder=' 아이디'
                value={formData.identifier}
                onChange={handleInputChange}
              />
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
            <button className='basecontainer-submitdata' type="submit" disabled={notAllow}>
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