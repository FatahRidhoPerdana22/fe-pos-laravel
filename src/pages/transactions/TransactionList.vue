<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import {
    Button,
    DataTable,
    Column,
    Select,
    InputText,
    IconField,
} from 'primevue';
import { useTransactionStore } from '@/stores/transaction.store';
import { storeToRefs } from 'pinia';
import { useDebounceFn } from '@vueuse/core';

/* GET & Pagination */
const transactionStore = useTransactionStore();
const { fetch, setLimit, setPage, setSearch, nextPage, prevPage } = transactionStore;

const { items, loading, limit, currentPage, totalPages, search } =
    storeToRefs(transactionStore);

/* Live Search */
const onSearch = useDebounceFn(() => {
    setSearch(search.value);
}, 500);

watch(search, () => {
    onSearch();
});

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (val: string) => {
    if (!val) return '';
    return new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

onMounted(() => {
    fetch();
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <div class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">Transaction History</h1>
                <p class="text-surface-500 text-sm">View and query historical POS invoice records</p>
            </div>
            <Button asChild v-slot="slotProps" raised>
                <RouterLink :to="{ name: 'pos' }" :class="slotProps.class">
                    <i class="pi pi-shopping-cart" /> Go to Cashier
                </RouterLink>
            </Button>
        </div>

        <!-- Table -->
        <div class="border-surface-200 overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
            <div class="flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row">
                <IconField iconPosition="left" class="relative w-full md:w-80">
                    <div class="text-surface-400 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <i class="pi pi-search"></i>
                    </div>
                    <InputText v-model="search" placeholder="Search by transaction code..." class="w-full pl-10!" />
                </IconField>
            </div>
            <DataTable
                :value="items"
                :loading="loading"
                dataKey="id"
                class="clean-table"
                :rowHover="true"
            >
                <Column field="no" header="No" />
                <Column field="code" header="Transaction Code" class="text-primary-700 font-bold" sortable />
                <Column field="customer.name" header="Customer" class="text-surface-900 font-medium" sortable />
                <Column field="created_at" header="Date & Time" sortable>
                    <template #body="{ data }">
                        <span class="text-surface-600 text-sm font-medium">{{ formatDate(data.created_at) }}</span>
                    </template>
                </Column>
                <Column field="total" header="Total Paid" sortable>
                    <template #body="{ data }">
                        <span class="text-surface-900 font-extrabold text-base">{{ formatCurrency(data.total) }}</span>
                    </template>
                </Column>
                <Column header="Actions">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <RouterLink :to="{ name: 'transactions-detail', params: { id: data.id } }">
                                <Button icon="pi pi-eye" severity="info" size="small" label="View Invoice" class="p-button-sm font-semibold" />
                            </RouterLink>
                        </div>
                    </template>
                </Column>
            </DataTable>
            <div class="border-surface-200 flex items-center justify-between gap-4 border-t px-4 py-4">
                <div class="text-surface-500 flex items-center gap-2">
                    <span class="text-surface-500 text-sm"> Rows per page: </span>
                    <Select
                        :model-value="limit"
                        :options="[5, 10, 20, 30, 40]"
                        @update:model-value="setLimit"
                    />
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-surface-600 text-sm font-medium">
                        {{ currentPage }} of {{ totalPages }}
                    </span>

                    <div class="flex gap-1">
                        <Button
                            @click="prevPage()"
                            icon="pi pi-chevron-left"
                            text
                            rounded
                            severity="secondary"
                            :disabled="currentPage === 1"
                            class="border-surface-500! hover:bg-surface-300! h-9! w-9! border!"
                        />
                        <Button
                            @click="nextPage()"
                            icon="pi pi-chevron-right"
                            text
                            rounded
                            severity="secondary"
                            :disabled="currentPage === totalPages"
                            class="border-surface-500! hover:bg-surface-300! h-9! w-9! border!"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
