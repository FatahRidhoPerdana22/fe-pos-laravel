<script setup lang="ts">
import {
    createCategory,
    getCategory,
    updateCategory,
    uploadCategoryImage,
} from '@/api/product-categories.api';
import router from '@/router';
import { Button, FileUpload, InputText, Message, useToast, Textarea } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();

const categoryId = computed<number | null>(() =>
    route.params.id ? Number(route.params.id) : null,
);

const isEdit = computed(() => !!categoryId.value);

const loading = ref(false);
const error = ref<Record<string, string[]>>({});

const form = ref({
    id: 0,
    name: '',
    description: '',
});

const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const onFileSelect = (event: { files: File[] }) => {
    const file = event.files[0];

    if (!file) return;

    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
};

const submit = async () => {
    loading.value = true;

    try {
        if (isEdit.value) {
            await updateCategory(form.value.id, form.value);
        } else {
            const res = await createCategory(form.value);
            form.value.id = res.data.data.id;
        }

        if (selectedFile.value) {
            const fd = new FormData();
            fd.append('image', selectedFile.value);

            await uploadCategoryImage(form.value.id, fd);
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit.value
                ? 'Category Updated successfully'
                : 'Category created successfully',
            life: 3000,
        });

        router.push({ name: 'product-categories' });
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
    if (!isEdit.value) return;

    loading.value = true;

    try {
        const res = await getCategory(categoryId.value!);
        const data = res.data.data;

        form.value.id = data.id;
        form.value.name = data.name;
        form.value.description = data.description ?? '';
        imagePreview.value = data.image ?? '';
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load category',
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
                    <span v-if="isEdit">Edit Category</span>
                    <span v-else>Create Category</span>
                </h1>
                <span v-if="isEdit">
                    <p class="text-surface-500 text-sm">update product category</p>
                </span>
                <span v-else>
                    <p class="text-surface-500 text-sm">Add a new product category</p>
                </span>
            </div>
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'product-categories' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left" /> Back
                </RouterLink>
            </Button>
        </div>

        <div class="border-surface-200 overflow-hidden rounded-2xl border bg-white">
            <form @submit.prevent="submit">
                <div class="grid grid-cols-1 gap-8 p-6 md:grid-cols-12 md:gap-12 md:p-8">
                    <div class="flex flex-col gap-4 md:col-span-4">
                        <label class="text-surface-900 text-sm font-semibold">Category Image</label>
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
                            <label for="name" class="text-surface-700 text-sm font-medium">
                                Category Name
                            </label>

                            <InputText
                                type="text"
                                id="name"
                                v-model="form.name"
                                placeholder="Enter your category name"
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
                        <div class="group flex flex-col gap-2">
                            <label for="description" class="text-surface-700 text-sm font-medium">
                                Description
                            </label>

                            <Textarea
                                type="text"
                                id="description"
                                v-model="form.description"
                                rows="10"
                                cols="60"
                                class="bg-surface-50! border-surface-300! rounded-lg border! focus:bg-white! focus:outline-emerald-300"
                            />
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
