import axios from 'axios';
import { interceptorSetup, API_URL } from './interceptor';

export const api = interceptorSetup(
	axios.create({
		baseURL: API_URL,
		headers: { 'Content-Type': 'application/json'}
	})
);
