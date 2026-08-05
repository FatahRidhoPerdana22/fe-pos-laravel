<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getTransactions } from '@/api/transactions.api';
import { getProducts } from '@/api/products.api';
import { getCustomers } from '@/api/customers.api';
import { Button, DataTable, Column } from 'primevue';

const loading = ref(true);
const totalSales = ref(0);
const totalTransactionsCount = ref(0);
const totalProductsCount = ref(0);
const totalCustomersCount = ref(0);
const recentTransactions = ref<any[]>([]);
const recentProducts = ref<any[]>([]);

const fetchDashboardStats = async () => {
    loading.value = true;
    try {
        // Fetch transactions
        const trxRes = await getTransactions({ limit: 5 });
        recentTransactions.value = trxRes.data.data.items;
        totalTransactionsCount.value = trxRes.data.data.pagination.total;

        // Fetch larger limit transactions to compute rough sales aggregate
        const allTrxRes = await getTransactions({ limit: 100 });
        totalSales.value = allTrxRes.data.data.items.reduce((sum: number, trx: any) => sum + Number(trx.total), 0);

        // Fetch products count
        const prodRes = await getProducts({ limit: 5 });
        recentProducts.value = prodRes.data.data.items;
        totalProductsCount.value = prodRes.data.data.pagination.total;

        // Fetch customers count
        const custRes = await getCustomers({ limit: 5 });
        totalCustomersCount.value = custRes.data.data.pagination.total;
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (val: string) => {
    if (!val) return '';
    return new Date(val).toLocaleDateString('id-ID', { dateStyle: 'medium' });
};

onMounted(() => {
    fetchDashboardStats();
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">Dashboard</h1>
                <p class="text-surface-500 text-sm">Welcome back! Here is a summary of the checkout statistics.</p>
            </div>
            <Button asChild v-slot="slotProps" raised>
                <RouterLink :to="{ name: 'pos' }" :class="slotProps.class">
                    <i class="pi pi-shopping-cart" /> Open Cashier / POS
                </RouterLink>
            </Button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-surface-200 shadow-sm">
            <div class="flex flex-col items-center gap-3">
                <i class="pi pi-spin pi-spinner text-primary-600 text-4xl"></i>
                <span class="text-surface-500 font-medium">Gathering statistics...</span>
            </div>
        </div>

        <div v-else class="flex flex-col gap-8">
            <!-- Stats Cards Grid -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Card 1: Total Revenue -->
                <div class="border-surface-200 relative flex items-center justify-between overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-2">
                        <span class="text-surface-500 text-xs font-semibold uppercase tracking-wider">Total Sales (Recent)</span>
                        <span class="text-primary-800 text-2xl font-black">{{ formatCurrency(totalSales) }}</span>
                    </div>
                    <div class="bg-emerald-50 text-emerald-600 flex h-12 w-12 items-center justify-center rounded-xl">
                        <i class="pi pi-money-bill text-xl"></i>
                    </div>
                </div>

                <!-- Card 2: Transactions -->
                <div class="border-surface-200 relative flex items-center justify-between overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-2">
                        <span class="text-surface-500 text-xs font-semibold uppercase tracking-wider">Total Transactions</span>
                        <span class="text-surface-900 text-2xl font-black">{{ totalTransactionsCount }} orders</span>
                    </div>
                    <div class="bg-sky-50 text-sky-600 flex h-12 w-12 items-center justify-center rounded-xl">
                        <i class="pi pi-shopping-bag text-xl"></i>
                    </div>
                </div>

                <!-- Card 3: Products -->
                <div class="border-surface-200 relative flex items-center justify-between overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-2">
                        <span class="text-surface-500 text-xs font-semibold uppercase tracking-wider">Active Products</span>
                        <span class="text-surface-900 text-2xl font-black">{{ totalProductsCount }} items</span>
                    </div>
                    <div class="bg-indigo-50 text-indigo-600 flex h-12 w-12 items-center justify-center rounded-xl">
                        <i class="pi pi-box text-xl"></i>
                    </div>
                </div>

                <!-- Card 4: Customers -->
                <div class="border-surface-200 relative flex items-center justify-between overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                    <div class="flex flex-col gap-2">
                        <span class="text-surface-500 text-xs font-semibold uppercase tracking-wider">Registered Clients</span>
                        <span class="text-surface-900 text-2xl font-black">{{ totalCustomersCount }} clients</span>
                    </div>
                    <div class="bg-purple-50 text-purple-600 flex h-12 w-12 items-center justify-center rounded-xl">
                        <i class="pi pi-users text-xl"></i>
                    </div>
                </div>
            </div>

            <!-- Detailed Lists Split Section -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <!-- Left: Recent Transactions -->
                <div class="border-surface-200 rounded-xl border bg-white p-5 shadow-sm lg:col-span-8">
                    <div class="mb-4 flex items-center justify-between">
                        <h3 class="text-surface-900 text-base font-bold">Recent Checkout Orders</h3>
                        <RouterLink :to="{ name: 'transactions' }" class="text-primary-600 hover:text-primary-700 text-xs font-bold">
                            View All <i class="pi pi-angle-right" />
                        </RouterLink>
                    </div>
                    
                    <DataTable :value="recentTransactions" class="clean-table" :rowHover="true">
                        <Column field="code" header="Code" class="text-primary-700 font-bold" />
                        <Column field="customer.name" header="Customer" class="text-surface-800 font-medium" />
                        <Column field="created_at" header="Date">
                            <template #body="{ data }">
                                {{ formatDate(data.created_at) }}
                            </template>
                        </Column>
                        <Column field="total" header="Total">
                            <template #body="{ data }">
                                <span class="font-extrabold text-surface-900">{{ formatCurrency(data.total) }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <!-- Right: Recent Products Added -->
                <div class="border-surface-200 rounded-xl border bg-white p-5 shadow-sm lg:col-span-4">
                    <div class="mb-4 flex items-center justify-between">
                        <h3 class="text-surface-900 text-base font-bold">Latest Products</h3>
                        <RouterLink :to="{ name: 'products' }" class="text-primary-600 hover:text-primary-700 text-xs font-bold">
                            View All <i class="pi pi-angle-right" />
                        </RouterLink>
                    </div>
                    
                    <div class="flex flex-col gap-4">
                        <div v-for="prod in recentProducts" :key="prod.id" class="flex items-center gap-3">
                            <img
                                :src="prod.image || 'http://localhost:8000/storage/no-image.jpg'"
                                :alt="prod.name"
                                class="bg-surface-50 h-10 w-10 rounded-md object-cover"
                            />
                            <div class="flex-1 min-w-0">
                                <h4 class="text-surface-900 text-xs font-bold truncate">{{ prod.name }}</h4>
                                <span class="text-surface-400 text-[10px]">{{ prod.category?.name }}</span>
                            </div>
                            <span class="text-primary-700 text-xs font-extrabold">{{ formatCurrency(prod.price) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
