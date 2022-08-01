import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useUserContext } from "../components/UserContext";

const handleRequest = (config: AxiosRequestConfig) => {
  console.log('in handleRequest')
  const accessToken = sessionStorage.getItem("accessToken")
  if (config.headers)
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
};

const handleRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.log('in handleRequestError')
  return Promise.reject(error);
};

const handleResponse = (response: AxiosResponse): AxiosResponse => {
  console.log('in handleResponse')
  return response;
};

const handleResponseError = async (
  error: AxiosError
): Promise<AxiosError | undefined> => {
  console.log('in handleResponseError')
  if (error.status !== '401' && error.message !== "Unauthorized")
    return Promise.reject(error);
  console.log('going to refresh token')
  const { refreshToken, userData, updateAccessToken } = useUserContext();
  try {
    const refreshResponse = await axios.post(`/token/`, {
      token: refreshToken,
      user_id: userData.user_id,
    });
    const newToken = refreshResponse.data.accessToken;
    updateAccessToken(newToken);
    sessionStorage.setItem("accessToken", newToken);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const interceptorSetup = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(handleRequest, handleRequestError);
  instance.interceptors.response.use(handleResponse, handleResponseError);
  return instance;
};

