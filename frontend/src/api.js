import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)


export const login = async (credentials) => {
    const response = await api.post('/api/token/', credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/api/user/register/', userData);
    return response.data;
};

export const passwordReset = async (email) => {
    const response = await api.post('/api/password-reset/', { email });
    return response.data;
};

export const resetPasswordConfirm = async (uid, token, new_password) => {
    const response = await api.post('/api/password-reset-confirm/', {
        uid: uid,
        token: token,
        new_password: new_password
    });
    return response.data;
};

export default api