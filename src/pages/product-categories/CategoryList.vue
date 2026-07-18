<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
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
/*import { RouterLink } from 'vue-router';*/
import { useProductCategoryStore } from '@/stores/product-category.store';
import { storeToRefs } from 'pinia';
import { useDebounceFn } from '@vueuse/core';
import { deleteCategories } from '@/api/product-categories.api';
import { detail, summary } from '@primeuix/themes/aura/toast';
import { useToast } from 'primevue/usetoast';

/* GET & Pagination */
const productCategoryStore = useProductCategoryStore();
const { fetch, setLimit, setPage, setSearch, nextPage, prevPage } = productCategoryStore;

const { items, loading, limit, currentPage, totalPages, search } =
    storeToRefs(productCategoryStore);
/* GET & Pagination */

/* Live Search */
const onSearch = useDebounceFn(() => {
    setSearch(search.value);
}, 500);

watch(search, () => {
    onSearch();
});
/* Live Search */

/* Confirm & Notifikasi Delete */
const toast = useToast();
const confirm = useConfirm();

const confirmDelete = (id: number) => {
    confirm.require({
        message: 'Are u sure want to delete this category ',
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
                await deleteCategories(id);
                toast.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Category Removed',
                    life: 3000,
                });
                fetch();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'error',
                    detail: 'Failed to Remove Category',
                    life: 3000,
                });
            }
        },
    });
};

/* Confirm & Notification Delete */

onMounted(() => {
    fetch();
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <div class="mb-8 flex items-center justify-between">
            <div class="">
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">Product Categories</h1>
                <p class="text-surface-500 text-sm">The list here shows all product categories</p>
            </div>
            <!--RouterLink :to>
                <Button label="Add Category" icon="pi pi-plus" size="small" />
            </!--RouterLink-->
        </div>

        <!-- Table -->
        <div class="border-surface-200 overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
            <div class="flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row">
                <IconField iconPosition="left" class="relative w-full md:w-80">
                    <div
                        class="text-surface-400 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                    >
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
                <Column field="image" header="Image">
                    <template #body="{ data }">
                        <img
                            :src="data.image || 'http://localhost:8000/storage/no-image.jpg'"
                            :alt="data.name"
                            class="bg-surface-100 h-20 w-20 rounded-lg object-cover"
                        />
                    </template>
                </Column>
                <Column field="name" header="Name" class="text-surface-900 font-medium" sortable />
                <Column field="description" header="Description" class="w-96" sortable>
                    <template #body="{ data }">
                        <span class="text-surface-900 text-xs font-normal">{{
                            data.description
                        }}</span>
                    </template>
                </Column>
                <Column header="Actions">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <Button icon="pi pi-pencil" severity="warn" size="small" />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                size="small"
                                @click="confirmDelete(data.id)"
                            />
                            <Button icon="pi pi-eye" severity="info" size="small" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            <div
                class="border-surface-200 flex items-center justify-between gap-4 border-t px-4 py-4"
            >
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
