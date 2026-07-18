import api from './axios';

export const getCategories = (params?: { page?: number; search?: string; limit?: number }) => {
    return api.get('/product-categories', { params });
};

export const deleteCategories = (id: number) => api.delete(`/product-categories/${id}`);
