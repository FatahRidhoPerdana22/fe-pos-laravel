import { getProducts } from '@/api/products.api';
import type { Product } from '@/types/product';
import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
    state: () => ({
        items: [] as Product[],
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            from: 0,
            to: 0,
        },
        page: 1,
        search: '',
        limit: 10,
        categoryFilter: null as number | null,
        loading: false,
    }),

    getters: {
        currentPage: (state) => state.pagination.current_page || 1,
        totalPages: (state) => state.pagination.last_page || 1,
    },

    actions: {
        async fetch() {
            this.loading = true;
            try {
                const res = await getProducts(
                    {
                        page: this.page,
                        search: this.search,
                        limit: this.limit,
                        product_category_id: this.categoryFilter,
                    },
                    { skipGlobalLoading: true },
                );

                let rawItems = res.data.data.items || [];

                if (this.categoryFilter) {
                    rawItems = rawItems.filter(
                        (item: any) =>
                            Number(item.product_category_id) === Number(this.categoryFilter) ||
                            (item.category &&
                                Number(item.category.id) === Number(this.categoryFilter)),
                    );
                }

                this.items = rawItems.map((item: any, index: number) => ({
                    ...item,
                    no: (this.page - 1) * this.limit + index + 1,
                }));

                this.pagination = res.data.data.pagination;
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                this.loading = false;
            }
        },

        setPage(page: number) {
            this.page = page;
            this.fetch();
        },

        setSearch(search: string) {
            this.search = search;
            this.page = 1;
            this.fetch();
        },

        setLimit(limit: number) {
            this.limit = limit;
            this.page = 1;
            this.fetch();
        },

        setCategoryFilter(categoryId: number | null) {
            this.categoryFilter = categoryId ? Number(categoryId) : null;
            this.page = 1;
            this.fetch();
        },

        nextPage() {
            if (this.page < this.pagination.last_page) {
                this.page++;
                this.fetch();
            }
        },

        prevPage() {
            if (this.page > 1) {
                this.page--;
                this.fetch();
            }
        },
    },
});
