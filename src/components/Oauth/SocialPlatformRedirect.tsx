import { sendAccessToken } from "./SocialRedirectApi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GooglesRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = queryParams.get("access_token");
    if (accessToken) {
      sendAccessToken(
        accessToken,
        "https://api.mailpocket.store/user/google-login",
        "google",
        navigate
      );
    }
  }, []);

  return <></>;
};

const NaverRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("code");
    if (accessToken) {
      sendAccessToken(
        accessToken,
        "https://api.mailpocket.store/user/naver-login",
        "naver",
        navigate
      );
    }
  }, []);

  return <></>;
};

const KakaoRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("code");

    if (accessToken) {
      sendAccessToken(
        accessToken,
        "https://api.mailpocket.store/user/kakao-login",
        "kakao",
        navigate
      );
    }
  }, []);

  return <></>;
};

export { KakaoRedirect, NaverRedirect, GooglesRedirect };
