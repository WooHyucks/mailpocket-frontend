import axios from "axios";
import Cookies from "js-cookie";
import { NavigateFunction } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { AmplitudeSetUserId, sendEventToAmplitude } from "../Amplitude";


export const sendAccessToken = async (accessToken: string, apiUrl: string, type: string, navigate: NavigateFunction, queryClient?: QueryClient) => {
  try {
    const response = await axios.post(apiUrl, { token: accessToken });
    if (response.status === 201 || response.status === 200) {
      const token = typeof response.data === 'string' ? response.data.trim() : response.data;
      Cookies.set("authToken", token, { expires: 30 });
      await AmplitudeSetUserId(queryClient)
      sendEventToAmplitude("complete 3rd party sign in", { "provider type": type })
      navigate("/");
    } else {
      console.log("APi 서버로 전송하는 중 오류가 발생했습니다.");
    }
  } catch (error) {
    console.log("Api 데이터 보내기 실패");
  }
};
