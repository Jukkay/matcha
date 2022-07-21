import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useUserContext } from "../components/UserContext";

export const API_URL = 'http://localhost:4000'
const handleRequest = (config: AxiosRequestConfig) => {
  const { token } = useUserContext();
  if (config.headers)
    config.headers["Authorization"] = `Bearer ${token.accessToken}`;
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
  const { tokens, userData, updateTokens } = useUserContext();
  try {
    const refreshResponse = await axios.post(`${API_URL}/token/`, {
      token: tokens.refreshToken,
      user: userData,
    });
    const { newTokens } = refreshResponse.data.tokens;
    updateTokens(newTokens);
    sessionStorage.setItem("tokens", JSON.stringify(newTokens));
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
