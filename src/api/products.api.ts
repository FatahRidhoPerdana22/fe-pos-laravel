import api from './axios';

export const getProducts = (
    params?: {
        page?: number;
        search?: string;
        limit?: number;
        product_category_id?: number | null;
    },
    options?: { skipGlobalLoading?: boolean },
) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
        if (params.page) cleanParams.page = params.page;
        if (params.limit) cleanParams.limit = params.limit;
        if (params.search) cleanParams.search = params.search;
        if (params.product_category_id)
            cleanParams.product_category_id = params.product_category_id;
    }
    return api.get('/products', { params: cleanParams, ...options });
};

export const getProduct = (id: number) => api.get(`/products/${id}`);

export const createProduct = (payload: {
    product_category_id: number;
    name: string;
    price: number;
    stock: number;
}) => api.post('/products', payload);

export const uploadProductImage = (id: number, formData: FormData) =>
    api.post(`/products/${id}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

export const updateProduct = (
    id: number,
    payload: { product_category_id: number; name: string; price: number; stock: number },
) => api.put(`/products/${id}`, payload);

export const deleteProduct = (id: number) => api.delete(`/products/${id}`);
