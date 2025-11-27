import axiosInstance from "../axiosInstance";
import { SlackTokenType } from "./types";

export const channelApi = {
  postSlackToken: (data: SlackTokenType) => {
    return axiosInstance.post("/channel", data);
  },

  getSlackToken: (data: any) => {
    return axiosInstance.get(`/${data}`);
  },

  getChannelData: (query: string) => {
    return axiosInstance.get(query);
  },

  deleteChannelData: (data: number) => {
    return axiosInstance.delete(`/channel/${data}`);
  },
};
