import { SocialLoginForm } from "./SocialLoginForm";

const KakaoLogin = () => {
  const kakaoProps = {
    alt: "Kakao",
    src: "/images/kakao.png",
    socialLoginUrl:
      "https://kauth.kakao.com/oauth/authorize?client_id=f898615d1b15529653e04549bd5203b7&redirect_uri=https://mailpocket.store/kakao-oauth-redirect&response_type=code",
    type: "kakao",
    style: "bg-kakaoBgColor h-11 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center rounded-lg",
    title: "카카오 계정으로 계속하기",
    titleStyle: "text-xs  font-extrabold"
  };

  return <SocialLoginForm {...kakaoProps} />;
};

const NaverLogin = () => {
  const naverProps = {
    alt: "Naver",
    src: "/images/naver.png",
    socialLoginUrl:
      "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=Q9vH3BUxoFpZea90R2g3&redirect_uri=https://mailpocket.store/naver-oauth-redirect",
    type: "naver",
    style: "bg-naverBgColor h-11 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center rounded-lg",
    title: "네이버 계정으로 계속하기",
    titleStyle: "text-xs text-white  font-extrabold"

  };

  return <SocialLoginForm {...naverProps} />;
};

const GoogleLogin = () => {
  const googleProps = {
    alt: "google",
    src: "/images/google.png",
    socialLoginUrl:
      "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile&client_id=470039216193-568hnttd1011ddmc5j22nqia9rcjm1ah.apps.googleusercontent.com&redirect_uri=https://mailpocket.store/google-oauth-redirect",
    type: "google",
    style: "border border-1 h-11 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center rounded-lg",
    title: "구글 계정으로 계속하기",
    titleStyle: "text-xs  font-extrabold"
  };

  return <SocialLoginForm {...googleProps} />;
};

export { KakaoLogin, NaverLogin, GoogleLogin };
