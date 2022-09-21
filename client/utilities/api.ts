import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from 'axios';

interface RetryRequest extends AxiosResponse {
	_retry: boolean;
}

// Initialize basic axios connection
export const API = axios.create({
	baseURL: 'http://localhost:4000',
	headers: { 'Content-Type': 'application/json' },
});

// Intercept requests and add access token to header
const handleRequest = (config: AxiosRequestConfig) => {
	try {
		const accessToken = sessionStorage.getItem('accessToken');
		if (config.headers)
		config.headers['Authorization'] = `Bearer ${accessToken}`;
		return config;
	} catch (err) {
		console.error(err)
	}
};

// Intercept request errors
const handleRequestError = (error: AxiosError): Promise<AxiosError> => {
	return Promise.reject(error);
};

// Intercept reponses
const handleResponse = (response: AxiosResponse): AxiosResponse => {
	return response;
};

// Intercept reponse errors and update access token if 401
const handleResponseError = async (error: AxiosError) => {
		const config = error.config as RetryRequest;
		const refreshToken = sessionStorage.getItem('refreshToken');
		// Refresh access token
		// _retry property is added to filter double requests
		if (error?.response?.status === 401 && !config._retry) {
			config._retry = true;
			const userData = sessionStorage.getItem('userData');
			let user_id;
			if (userData) {
				const data = JSON.parse(userData);
				user_id = data.user_id;
			} else {
				user_id = '';
			}
			const refreshResponse = await API.post('/token', {
				token: refreshToken,
				user_id: user_id,
			});
			const newToken = refreshResponse.data.accessToken;
			sessionStorage.setItem('accessToken', newToken);
			config.headers['Authorization'] = `Bearer ${newToken}`;
			return API(config);
		}
		return Promise.reject(error);
};

// Add interceptors to axios instance
export const addInterceptors = (instance: AxiosInstance): AxiosInstance => {
	instance.interceptors.request.use(handleRequest, handleRequestError);
	instance.interceptors.response.use(handleResponse, handleResponseError);
	return instance;
};

// Initialize axios connection with interceptors
export const authAPI = addInterceptors(
	axios.create({
		baseURL: 'http://localhost:4000',
		headers: { 'Content-Type': 'application/json' },
	})
);
