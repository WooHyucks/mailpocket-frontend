import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import MyPage from "./pages/MyPage";
import MobileReadPage from "./mobile/MobileReadPage";
import Subscribe from "./pages/SubscribePage";
import RedirectMypage from "./components/RedirectMypage";
import ReadPage from "./pages/ReadPage";
import LandingPage from "./pages/LandingPage";
import { useEffect, useState } from "react";
import {
  AmplitudeSetUserId,
  initializeAmplitude,
} from "./components/Amplitude";
import PageLoding from "./components/PageLoding";
import { Token, getUserData } from "./api/api";
import {
  GooglesRedirect,
  KakaoRedirect,
  NaverRedirect,
} from "./components/Oauth/SocialPlatformRedirect";
import MobileMyPage from "./mobile/MobileMyPage";
import MobileSubscribe from "./mobile/MobileSubscribe";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );


function App() {
  const [amplitudeInitialized, setAmplitudeInitialized] = useState(false);

  useEffect(() => {
    const initializeAndSetUserId = async () => {
      try {
        await initializeAmplitude();
        await AmplitudeSetUserId();
        setAmplitudeInitialized(true);
      } catch (error) {
        console.error("Error in initialization:", error);
      }
    };

    initializeAndSetUserId();
  }, []);



  return (
    <div className={amplitudeInitialized ? "" : "flex justify-center"}>
      {amplitudeInitialized ? (
        <>
          <Router>
            <Routes>
              <Route index element={<MyPage />} />
              <Route path="/kakao-oauth-redirect" element={<KakaoRedirect />} />
              <Route path="/naver-oauth-redirect" element={<NaverRedirect />} />
              <Route
                path="/google-oauth-redirect"
                element={<GooglesRedirect />}
              />
              <Route path="/slack-oauth" element={<RedirectMypage />} />
              <Route path="/read" element={<ReadPage />} />
              <Route path="/landingpage" element={<LandingPage />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/mobileread" element={<MobileReadPage />} />
              <Route path="/mobilemypage" index element={<MobileMyPage />} />
              <Route path="/mobileSubscribe" element={<MobileSubscribe />} />
            </Routes>
          </Router>
          <ReactQueryDevtools initialIsOpen={true} />
        </>
      ) : (
        <PageLoding />
      )}
    </div>
  );
}

export default App;
