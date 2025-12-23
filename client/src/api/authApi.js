// api/authApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginApi = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const registerApi = async (userData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/register`,
            userData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
