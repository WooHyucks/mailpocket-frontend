import axiosInstance from "../axiosInstance";
import { PostAuthDataType } from "./types";

export const authApi = {
  getUserData: () => {
    return axiosInstance.get("/user");
  },

  postUserData: () => {
    return axiosInstance.post("/user");
  },

  postSignInData: (data: PostAuthDataType) => {
    return axiosInstance.post("/user/sign-in", data);
  },

  postSignUpData: (data: PostAuthDataType) => {
    return axiosInstance.post("/user/sign-up", data);
  },
};

