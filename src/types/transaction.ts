import type { Customer } from './customer';
import type { Product } from './product';

export interface TransactionItem {
    id: number;
    transaction_id: number;
    product_id: number;
    price: number;
    quantity: number;
    subtotal: number;
    product?: Product;
}

export interface Transaction {
    id: number;
    code: string;
    customer_id: number;
    subtotal: number;
    tax: number;
    total: number;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    items?: TransactionItem[];
}
