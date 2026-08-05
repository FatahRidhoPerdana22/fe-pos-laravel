import AppLayout from '@/layout/AppLayout.vue';
import Dashboard from '@/pages/Dashboard.vue';
import Login from '@/pages/auth/Login.vue';
import CategoryForm from '@/pages/product-categories/CategoryForm.vue';
import CategoryList from '@/pages/product-categories/CategoryList.vue';
import { useAuthStore } from '@/stores/auth.store';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { guest: true },
        },
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: Dashboard,
                },
                {
                    path: '/pos',
                    name: 'pos',
                    component: () => import('@/pages/pos/PosCashier.vue'),
                },
                {
                    path: '/product-categories',
                    name: 'product-categories',
                    component: CategoryList,
                },
                {
                    path: '/product-categories/create',
                    name: 'product-categories-create',
                    component: CategoryForm,
                },
                {
                    path: '/product-categories/:id/edit',
                    name: 'product-categories-edit',
                    component: CategoryForm,
                },
                {
                    path: '/products',
                    name: 'products',
                    component: () => import('@/pages/products/ProductList.vue'),
                },
                {
                    path: '/products/create',
                    name: 'products-create',
                    component: () => import('@/pages/products/ProductForm.vue'),
                },
                {
                    path: '/products/:id/edit',
                    name: 'products-edit',
                    component: () => import('@/pages/products/ProductForm.vue'),
                },
                {
                    path: '/customers',
                    name: 'customers',
                    component: () => import('@/pages/customers/CustomerList.vue'),
                },
                {
                    path: '/customers/create',
                    name: 'customers-create',
                    component: () => import('@/pages/customers/CustomerForm.vue'),
                },
                {
                    path: '/customers/:id/edit',
                    name: 'customers-edit',
                    component: () => import('@/pages/customers/CustomerForm.vue'),
                },
                {
                    path: '/transactions',
                    name: 'transactions',
                    component: () => import('@/pages/transactions/TransactionList.vue'),
                },
                {
                    path: '/transactions/:id',
                    name: 'transactions-detail',
                    component: () => import('@/pages/transactions/TransactionDetail.vue'),
                },
            ],
        },
    ],
});

router.beforeEach(async (to, from) => {
    const auth = useAuthStore();
    if (!!auth.isAuthenticated && !auth.user) {
        try {
            await auth.fetchUser();
        } catch {
            auth.logout();
            return '/login';
        }
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login';
    }

    if (to.meta.guest && auth.isAuthenticated) {
        return '/';
    }
});

export default router;
