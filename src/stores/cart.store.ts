import { createTransaction } from '@/api/transactions.api';
import type { Product } from '@/types/product';
import { defineStore } from 'pinia';

export interface CartItem {
    product: Product;
    quantity: number;
}

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [] as CartItem[],
        customerId: null as number | null,
        loading: false,
    }),

    getters: {
        subtotal: (state) => {
            return state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        },
        tax: (state) => {
            return (
                state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) *
                0.11
            );
        },
        total(): number {
            return this.subtotal + this.tax;
        },
        itemCount: (state) => {
            return state.items.reduce((sum, item) => sum + item.quantity, 0);
        },
    },

    actions: {
        setCustomerId(id: number | null) {
            this.customerId = id;
        },

        addToCart(product: Product, quantity = 1) {
            const existing = this.items.find((item) => item.product.id === product.id);
            if (existing) {
                if (existing.quantity + quantity > product.stock) {
                    throw new Error(`Stok produk tidak mencukupi. Tersedia: ${product.stock}`);
                }
                existing.quantity += quantity;
            } else {
                if (quantity > product.stock) {
                    throw new Error(`Stok produk tidak mencukupi. Tersedia: ${product.stock}`);
                }
                this.items.push({ product, quantity });
            }
        },

        updateQuantity(productId: number, quantity: number) {
            const existing = this.items.find((item) => item.product.id === productId);
            if (existing) {
                if (quantity > existing.product.stock) {
                    throw new Error(
                        `Stok produk tidak mencukupi. Tersedia: ${existing.product.stock}`,
                    );
                }
                if (quantity <= 0) {
                    this.removeFromCart(productId);
                } else {
                    existing.quantity = quantity;
                }
            }
        },

        removeFromCart(productId: number) {
            this.items = this.items.filter((item) => item.product.id !== productId);
        },

        clearCart() {
            this.items = [];
            this.customerId = null;
        },

        async checkout() {
            if (!this.customerId) {
                throw new Error('Pilih customer terlebih dahulu');
            }
            if (this.items.length === 0) {
                throw new Error('Keranjang belanja kosong');
            }

            this.loading = true;
            try {
                const payload = {
                    customer_id: this.customerId,
                    items: this.items.map((item) => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                    })),
                };

                const res = await createTransaction(payload);
                this.clearCart();
                return res.data.data;
            } finally {
                this.loading = false;
            }
        },
    },
});
