import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useUserContext } from "../components/UserContext";

const handleRequest = (config: AxiosRequestConfig) => {
  const accessToken = sessionStorage.getItem("accessToken")
  console.log(config)
  if (config.headers)
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
};

const handleRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

const handleResponse = (response: AxiosResponse): AxiosResponse => {
  return response;
};

const handleResponseError = async (
  error: AxiosError
): Promise<AxiosError | undefined> => {
  if (error.status !== "401" && error.message !== "Unauthorized")
    return Promise.reject(error);
  const { refreshToken, userData, updateAccessToken } = useUserContext();
  try {
    const refreshResponse = await axios.post(`/token/`, {
      token: refreshToken,
      user_id: userData.user_id,
    });
    const newToken = refreshResponse.data.accessToken;
    updateAccessToken(newToken);
    sessionStorage.setItem("accessToken", newToken);
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};

export const interceptorSetup = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(handleRequest, handleRequestError);
  instance.interceptors.response.use(handleResponse, handleResponseError);
  return instance;
};

