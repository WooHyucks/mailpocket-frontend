import * as amplitude from "@amplitude/analytics-browser";
import { Token } from "../api/utils";
import { authApi } from "../api/Auth";
import { QUERY_KEYS } from "../queries/queryKeys";

const amplitudeApiKey = "d6e91c2b0e6fdb035d5087cbd79c5cab";

const devAmplitudeApiKey = "a64d3e4d62617b1eca2b9ab4864cb072";

const ampKey =
  process.env.NODE_ENV === "development" ? devAmplitudeApiKey : amplitudeApiKey;

export const initializeAmplitude = async () => {
  return amplitude.init(ampKey, {
    defaultTracking: {
      attribution: true,
      pageViews: false,
      sessions: true,
      formInteractions: false,
      fileDownloads: false,
    },
  });
};

export const AmplitudeSetUserId = async (queryClient?: any) => {
  const authToken = Token();
  try {
    if (authToken) {
      let userInfo;
      if (queryClient) {
        userInfo = await queryClient.fetchQuery({
          queryKey: [QUERY_KEYS.USER],
          queryFn: () => authApi.getUserData().then((response) => response.data),
          staleTime: 1000 * 60 * 5,
        });
      } else {
        const response = await authApi.getUserData();
        userInfo = response.data;
      }
      return amplitude.setUserId(
        userInfo.identifier
          ? userInfo.identifier
          : `${userInfo.platform}_${userInfo.id}`
      );
    }
  } catch (error) {
    console.error("Amplitude 초기화 중 오류 발생:", error);
  }
};

export const AmplitudeResetUserId = async () => {
  try {
    amplitude.reset();
  } catch (error) {
    console.error("Amplitude 초기화 중 오류 발생:", error);
  }
};

export const sendEventToAmplitude = async (
  eventName: string,
  properties: any
) => {
  try {
    // if (process.env.NODE_ENV === "development") {
    //   console.log(`${eventName}: ${JSON.stringify(properties || {})}`);
    // }
    amplitude.track(eventName, properties);
  } catch (error) {
    console.error("Amplitude 초기화 중 오류 발생:", error);
  }
};
