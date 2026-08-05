<script setup lang="ts">
import { createProduct, getProduct, updateProduct, uploadProductImage } from '@/api/products.api';
import { getCategories } from '@/api/product-categories.api';
import router from '@/router';
import { Button, FileUpload, InputText, InputNumber, Select, Message, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();

const productId = computed<number | null>(() => (route.params.id ? Number(route.params.id) : null));

const isEdit = computed(() => !!productId.value);

const loading = ref(false);
const error = ref<Record<string, string[]>>({});

const form = ref({
    id: 0,
    product_category_id: null as number | null,
    name: '',
    price: 0,
    stock: 0,
});

const categoryOptions = ref<{ label: string; value: number }[]>([]);

const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const onFileSelect = (event: { files: File[] }) => {
    const file = event.files[0];

    if (!file) return;

    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
};

const fetchCategories = async () => {
    try {
        const res = await getCategories({ limit: 100 });
        const items = res.data.data.items;
        categoryOptions.value = items.map((item: any) => ({
            label: item.name,
            value: item.id,
        }));
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
};

const submit = async () => {
    loading.value = true;
    error.value = {};

    try {
        const payload = {
            product_category_id: form.value.product_category_id!,
            name: form.value.name,
            price: form.value.price,
            stock: form.value.stock,
        };

        if (isEdit.value) {
            await updateProduct(form.value.id, payload);
        } else {
            const res = await createProduct(payload);
            form.value.id = res.data.data.id;
        }

        if (selectedFile.value) {
            const fd = new FormData();
            fd.append('image', selectedFile.value);

            await uploadProductImage(form.value.id, fd);
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit.value ? 'Product updated successfully' : 'Product created successfully',
            life: 3000,
        });

        router.push({ name: 'products' });
    } catch (err: any) {
        if (err.response?.status === 422) {
            error.value = err.response?.data.errors ?? {};

            return;
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.response?.data.message,
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await fetchCategories();

    if (!isEdit.value) return;

    loading.value = true;

    try {
        const res = await getProduct(productId.value!);
        const data = res.data.data;

        form.value.id = data.id;
        form.value.product_category_id = data.category?.id;
        form.value.name = data.name;
        form.value.price = data.price;
        form.value.stock = data.stock;
        imagePreview.value = data.image ?? '';
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load product',
            life: 3000,
        });
    }
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <div class="mb-8 flex items-center justify-between">
            <div class="">
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">
                    <span v-if="isEdit">Edit Product</span>
                    <span v-else>Create Product</span>
                </h1>
                <span v-if="isEdit">
                    <p class="text-surface-500 text-sm">Update product details</p>
                </span>
                <span v-else>
                    <p class="text-surface-500 text-sm">Add a new product</p>
                </span>
            </div>
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'products' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left" /> Back
                </RouterLink>
            </Button>
        </div>

        <div class="border-surface-200 overflow-hidden rounded-2xl border bg-white">
            <form @submit.prevent="submit">
                <div class="grid grid-cols-1 gap-8 p-6 md:grid-cols-12 md:gap-12 md:p-8">
                    <div class="flex flex-col gap-4 md:col-span-4">
                        <label class="text-surface-900 text-sm font-semibold">Product Image</label>
                        <div
                            class="bg-surface-50 border-surface-200 group hover:border-primary-500 relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
                        >
                            <img
                                v-if="imagePreview"
                                :src="imagePreview"
                                class="h-full w-full object-cover"
                            />

                            <div v-else class="text-surface-400 flex flex-col items-center gap-2">
                                <i class="pi pi-image text-4xl opacity-50"></i>
                                <span class="text-sm font-medium">No Image Selected</span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <FileUpload
                                mode="basic"
                                @select="onFileSelect"
                                :auto="false"
                                accept="image/*"
                                :maxFileSize="2000000"
                                chooseLabel="Choose Image"
                                class="w-full"
                            />
                            <small class="text-surface-500 text-center text-xs">
                                Max Size: 2MB, Formats: JPG, PNG
                            </small>
                        </div>
                    </div>
                    <div class="mt-1.5 flex flex-col gap-6 md:col-span-8">
                        <div class="group flex flex-col gap-2">
                            <label
                                for="product_category_id"
                                class="text-surface-700 text-sm font-medium"
                            >
                                Category
                            </label>

                            <Select
                                id="product_category_id"
                                v-model="form.product_category_id"
                                :options="categoryOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select a category"
                                filter
                                filterPlaceholder="Search category..."
                                resetFilterOnHide
                                class="w-full"
                                :invalid="!!error.product_category_id"
                            />
                            <Message
                                v-if="error.product_category_id"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ error.product_category_id[0] }}</Message
                            >
                        </div>
                        <div class="group flex flex-col gap-2">
                            <label for="name" class="text-surface-700 text-sm font-medium">
                                Product Name
                            </label>

                            <InputText
                                type="text"
                                id="name"
                                v-model="form.name"
                                placeholder="Enter product name"
                                class="bg-surface-50! focus:bg-white!"
                                fluid
                                :invalid="!!error.name"
                            />
                            <Message
                                v-if="error.name"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ error.name[0] }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-4 sm:flex-row">
                            <!-- Field Price -->
                            <div class="group flex flex-1 flex-col gap-2">
                                <label for="price" class="text-surface-700 text-sm font-medium">
                                    Price
                                </label>

                                <InputNumber
                                    id="price"
                                    v-model="form.price"
                                    mode="currency"
                                    currency="IDR"
                                    locale="id-ID"
                                    class="bg-surface-50! focus:bg-white!"
                                    fluid
                                    :invalid="!!error.price"
                                />
                                <Message
                                    v-if="error.price"
                                    severity="error"
                                    size="small"
                                    variant="simple"
                                    >{{ error.price[0] }}</Message
                                >
                            </div>

                            <!-- Field Stock -->
                            <div class="group flex flex-1 flex-col gap-2">
                                <label for="stock" class="text-surface-700 text-sm font-medium">
                                    Stock
                                </label>

                                <InputNumber
                                    id="stock"
                                    v-model="form.stock"
                                    :min="0"
                                    class="bg-surface-50! focus:bg-white!"
                                    fluid
                                    :invalid="!!error.stock"
                                />
                                <Message
                                    v-if="error.stock"
                                    severity="error"
                                    size="small"
                                    variant="simple"
                                    >{{ error.stock[0] }}</Message
                                >
                            </div>
                        </div>
                        <div class="border-surface-100 mt-auto flex justify-end border-t pt-4">
                            <div class="flex gap-3">
                                <Button
                                    label="Cancel"
                                    severity="danger"
                                    @click="router.back()"
                                ></Button>
                                <Button type="submit" label="Save" icon="pi pi-check"></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
