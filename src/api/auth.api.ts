import api from './axios';

export const loginApi = (payload: { email: string; password: string }) =>
    api.post('/login', payload);

export const meApi = () => {
    return api.get('/me');
};

export const logoutApi = () => {
    api.post('/logout');
};
