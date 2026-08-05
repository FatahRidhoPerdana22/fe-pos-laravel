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
    useConfirm,
    ConfirmDialog,
} from 'primevue';
import { useCustomerStore } from '@/stores/customer.store';
import { storeToRefs } from 'pinia';
import { useDebounceFn } from '@vueuse/core';
import { deleteCustomer } from '@/api/customers.api';
import { useToast } from 'primevue/usetoast';

/* GET & Pagination */
const customerStore = useCustomerStore();
const { fetch, setLimit, setPage, setSearch, nextPage, prevPage } = customerStore;

const { items, loading, limit, currentPage, totalPages, search } =
    storeToRefs(customerStore);

/* Live Search */
const onSearch = useDebounceFn(() => {
    setSearch(search.value);
}, 500);

watch(search, () => {
    onSearch();
});

/* Confirm & Notification Delete */
const toast = useToast();
const confirm = useConfirm();

const confirmDelete = (id: number) => {
    confirm.require({
        message: 'Are you sure you want to delete this customer?',
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger',
        },
        accept: async () => {
            try {
                await deleteCustomer(id);
                toast.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Customer removed successfully',
                    life: 3000,
                });
                fetch();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to Remove Customer',
                    life: 3000,
                });
            }
        },
    });
};

onMounted(() => {
    fetch();
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <div class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">Customers</h1>
                <p class="text-surface-500 text-sm">The list here shows all registered customers</p>
            </div>
            <Button asChild v-slot="slotProps" raised>
                <RouterLink :to="{ name: 'customers-create' }" :class="slotProps.class">
                    <i class="pi pi-plus" /> Add New Customer
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
                    <InputText v-model="search" placeholder="Search..." class="w-full pl-10!" />
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
                <Column field="name" header="Name" class="text-surface-900 font-semibold text-base" sortable />
                <Column field="phone" header="Phone Number" class="text-surface-600 font-medium" />
                <Column header="Actions">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <RouterLink :to="{ name: 'customers-edit', params: { id: data.id } }">
                                <Button icon="pi pi-pencil" severity="warn" size="small" />
                            </RouterLink>
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                size="small"
                                @click="confirmDelete(data.id)"
                            />
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

    <ConfirmDialog />
</template>
