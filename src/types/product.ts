import type { ProductCategory } from './product-category';

export interface Product {
    id: number;
    product_category_id: number;
    name: string;
    price: number;
    stock: number;
    image: string | null;
    created_at: string;
    updated_at: string;
    category?: ProductCategory;
}
