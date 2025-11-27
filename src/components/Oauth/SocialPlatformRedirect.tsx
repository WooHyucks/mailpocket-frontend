import { sendAccessToken } from "./SocialRedirectApi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const GooglesRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = queryParams.get("access_token");
    if (accessToken) {
      sendAccessToken(
        accessToken,
        "https://api.mailpocket.shop/user/google-login",
        "google",
        navigate,
        queryClient
      );
    }
  }, [navigate, queryClient]);

  return <></>;
};

const NaverRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("code");
    if (accessToken) {
      sendAccessToken(
        accessToken,
        "https://api.mailpocket.shop/user/naver-login",
        "naver",
        navigate,
        queryClient
      );
    }
  }, [navigate, queryClient]);

  return <></>;
};

const KakaoRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("code");

    if (accessToken) {
      sendAccessToken(
        accessToken,
        "https://api.mailpocket.shop/user/kakao-login",
        "kakao",
        navigate,
        queryClient
      );
    }
  }, [navigate, queryClient]);

  return <></>;
};

export { KakaoRedirect, NaverRedirect, GooglesRedirect };
