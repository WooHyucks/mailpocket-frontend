import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "./Auth/types";

export const Token = () => Cookies.get("authToken");

export const decodedToken = () => {
  const authToken = Token();
  if (!authToken || authToken.trim() === '') {
    return false;
  }
  
  const tokenParts = authToken.trim().split('.');
  if (tokenParts.length !== 3) {
    console.error('유효하지 않은 토큰 형식입니다.');
    return false;
  }
  
  try {
    const decoded: DecodedToken = jwtDecode(authToken);
    return decoded.is_member;
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return false;
  }
}
