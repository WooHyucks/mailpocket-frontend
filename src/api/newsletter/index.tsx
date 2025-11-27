import axiosInstance from "../axiosInstance";
import { Params, PostSubscribeType } from "./types";

export const newsletterApi = {
  getNewsletterData: (query: string, params: Params) => {
    return axiosInstance.get(query, {
      params: params,
    });
  },

  getSubscribeData: (query: string) => {
    return axiosInstance.get(query);
  },

  putSubscribe: (data: PostSubscribeType) => {
    return axiosInstance.put("/newsletter/subscribe", data);
  },

  readPageSubscribe: (newsletterId: number) => {
    return axiosInstance.post(`/newsletter/${newsletterId}/subscribe`);
  },

  readPageUnSubscribe: (newsletterId: number) => {
    return axiosInstance.delete(`/newsletter/${newsletterId}/subscribe`);
  },

  getMail: (newsletter_id: any) => {
    return axiosInstance.get(`/newsletter/${newsletter_id}/mail`);
  },

  getMailDetail: (s3_object_key: string) => {
    return axiosInstance.get(`/mail?key=${s3_object_key}`);
  },

  getReadMailData: (data: string | null) => {
    return axiosInstance.get(`/mail?key=${data}`);
  },

  getMyPageNewsLetterDetails: async (query: string) => {
    try {
      const responseNewsLetterDetail = await axiosInstance.get(`/newsletter/${query}/mail`);
      return responseNewsLetterDetail.data;
    } catch (error) {
      console.error('Error fetching newsletter detail:', error);
      throw error;
    }
  },

  getMyPageNewsLetterDetail: (query: string) => {
    return axiosInstance.get(query);
  },

  getMyPageSubscribeData: (query: string) => {
    return axiosInstance.get(query);
  },
};
