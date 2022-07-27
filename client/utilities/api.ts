import axios from 'axios';
import { interceptorSetup } from './interceptor';

export const api = interceptorSetup(
	axios.create({
		baseURL: 'http://localhost:4000',
		headers: { 'Content-Type': 'application/json'}
	})
);
