import { sendAccessToken } from "./SocialRedirectApi";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../Toast";

type ProviderType = "google" | "naver" | "kakao";

interface ConsentProps {
  provider: ProviderType;
  apiUrl: string;
  token: string;
  navigate: ReturnType<typeof useNavigate>;
  queryClient: ReturnType<typeof useQueryClient>;
}

const ProviderLabel: Record<ProviderType, string> = {
  google: "Google",
  naver: "Naver",
  kakao: "Kakao",
};

const OauthConsent = ({ provider, apiUrl, token, navigate, queryClient }: ConsentProps) => {
  const [localPart, setLocalPart] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const isValidEmail = useMemo(() => localPart.trim().length > 0, [localPart]);
  const disabled = loading || !agree || !isValidEmail;

  const handleSubmit = async () => {
    if (!agree) {
      showToast("동의가 필요합니다.", { type: "error" });
      return;
    }
    if (!isValidEmail) {
      showToast("메일포켓 전용 이메일을 입력해주세요.", { type: "error" });
      return;
    }
    try {
      setLoading(true);
      await sendAccessToken(token, apiUrl, provider, navigate, queryClient);
    } catch (error) {
      showToast("로그인 처리 중 오류가 발생했습니다.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-customPurple">Mailpocket · OAuth</p>
          <h1 className="text-xl font-extrabold text-gray-900">
            {ProviderLabel[provider]} 로그인 동의
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            메일포켓 전용 이메일을 사용하며, 뉴스레터 구독·수신을 대신 처리하는 것에 동의해주세요.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">전용 이메일</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded-2xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-customPurple focus:border-customPurple text-sm"
              placeholder="username"
              value={localPart}
              onChange={(e) => setLocalPart(e.target.value)}
            />
            <div className="px-3 py-2 rounded-2xl bg-gray-100 text-sm font-semibold text-gray-700 border border-gray-200">
              @mailpocket.shop
            </div>
          </div>
          <p className="text-xs text-gray-500">메일포켓 전용 도메인만 가입에 사용할 수 있어요.</p>
        </div>

        <div className="flex items-start gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
          <input
            id="oauth-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-customPurple focus:ring-customPurple"
          />
          <label htmlFor="oauth-agree" className="text-sm text-gray-700 leading-relaxed">
            메일포켓이 제 전용 이메일을 사용해 뉴스레터 구독·수신을 대신 처리해주는 것에 동의합니다.
            <br />
            <span className="text-gray-500">(모든 구독은 언제든지 취소할 수 있어요.)</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
            onClick={() => navigate("/landingpage")}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-customPurple to-purple-600 text-white text-sm font-bold shadow-md hover:from-purple-600 hover:to-customPurple transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={disabled}
          >
            {loading ? "처리 중..." : "동의하고 진행"}
          </button>
        </div>
      </div>
    </div>
  );
};

const GooglesRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = queryParams.get("access_token");
    if (accessToken) {
      setToken(accessToken);
    } else {
      navigate("/landingpage");
    }
  }, [navigate, queryClient]);

  if (!token) return null;
  return (
    <OauthConsent
      provider="google"
      apiUrl="https://api.mailpocket.shop/user/google-login"
      token={token}
      navigate={navigate}
      queryClient={queryClient}
    />
  );
};

const NaverRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("code");
    if (accessToken) {
      setToken(accessToken);
    } else {
      navigate("/landingpage");
    }
  }, [navigate, queryClient]);

  if (!token) return null;
  return (
    <OauthConsent
      provider="naver"
      apiUrl="https://api.mailpocket.shop/user/naver-login"
      token={token}
      navigate={navigate}
      queryClient={queryClient}
    />
  );
};

const KakaoRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("code");

    if (accessToken) {
      setToken(accessToken);
    } else {
      navigate("/landingpage");
    }
  }, [navigate, queryClient]);

  if (!token) return null;
  return (
    <OauthConsent
      provider="kakao"
      apiUrl="https://api.mailpocket.shop/user/kakao-login"
      token={token}
      navigate={navigate}
      queryClient={queryClient}
    />
  );
};

export { KakaoRedirect, NaverRedirect, GooglesRedirect };
