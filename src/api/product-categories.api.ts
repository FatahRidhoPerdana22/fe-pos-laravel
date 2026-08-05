import api from './axios';

export const getCategories = (
    params?: { page?: number; search?: string; limit?: number },
    options?: { skipGlobalLoading?: boolean },
) => {
    return api.get('/product-categories', { params, ...options });
};

export const getCategory = (id: number) => api.get(`/product-categories/${id}`);

export const createCategory = (payload: { name: string; description?: string }) =>
    api.post('/product-categories', payload);

export const uploadCategoryImage = (id: number, formData: FormData) =>
    api.post(`/product-categories/${id}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

export const updateCategory = (id: number, payload: { name: string; description?: string }) =>
    api.put(`/product-categories/${id}`, payload);

export const deleteCategories = (id: number) => api.delete(`/product-categories/${id}`);
