import Cookies from 'js-cookie'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { postSignInData, Token } from '../../api/api'
import { isMobile } from '../../App'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import { AmplitudeSetUserId, sendEventToAmplitude } from '../Amplitude'
import { GoogleLogin, KakaoLogin, NaverLogin } from '../Oauth/SocialPlatformLogin'
import SignUp from './SignUp'

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
      const response = await postSignInData(formData);
      if (response.status === 201) {
        Cookies.set("authToken", response.data, {
          expires: 30,
        });
        await AmplitudeSetUserId()
        sendEventToAmplitude("complete sign in", "")
        isMobile ? navigate("/mobilemypage") : navigate("/");
      }
    } catch (error) {
      alert("아이디 및 비밀번호를 확인해주세요.");
    }
  };


  useEffect(() => {
    if (formData.identifier.length > 0 && formData.password.length > 0) {
      setNotAllow(false);
      return;
    }
    setNotAllow(true);
  }, [formData]);

  return (
    <div className='text-center mx-auto max-w-900 h-auto'>
      <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center">
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
            <div className='authcontainer-submit_box my-4'>
              <input className='authcontainer-submit_data  placeholder-gray-500  placeholder:font-bold'
                type="text"
                name="identifier"
                value={formData.identifier}
                placeholder=' 아이디'
                onChange={handleInputChange}
              />
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



