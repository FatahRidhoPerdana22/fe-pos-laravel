<script setup lang="ts">
import { createCustomer, getCustomer, updateCustomer } from '@/api/customers.api';
import { useRouter } from 'vue-router';
import { Button, InputText, Message, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const customerId = computed<number | null>(() =>
    route.params.id ? Number(route.params.id) : null,
);

const isEdit = computed(() => !!customerId.value);

const loading = ref(false);
const error = ref<Record<string, string[]>>({});

const form = ref({
    name: '',
    phone: '',
});

const submit = async () => {
    loading.value = true;
    error.value = {};

    try {
        let finalId = customerId.value;

        if (isEdit.value && finalId) {
            await updateCustomer(finalId, form.value);
        } else {
            await createCustomer(form.value);
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit.value ? 'Customer updated successfully' : 'Customer created successfully',
            life: 3000,
        });

        await router.push({ name: 'customers' });
        return;
    } catch (err: any) {
        if (err.response?.status === 422) {
            error.value = err.response?.data.errors ?? {};
            return;
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.response?.data.message || 'Operation failed',
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
        const res = await getCustomer(customerId.value!);
        const data = res.data.data;

        form.value.name = data.name;
        form.value.phone = data.phone;
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load customer details',
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <div class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">
                    <span v-if="isEdit">Edit Customer</span>
                    <span v-else>Register Customer</span>
                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">Update customer details</span>
                    <span v-else>Add a new customer to the database</span>
                </p>
            </div>
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'customers' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left" /> Back
                </RouterLink>
            </Button>
        </div>

        <div class="border-surface-200 overflow-hidden rounded-2xl border bg-white max-w-2xl mx-auto">
            <form @submit.prevent="submit">
                <div class="flex flex-col gap-6 p-6 md:p-8">
                    <div class="group flex flex-col gap-2">
                        <label for="name" class="text-surface-700 text-sm font-medium">
                            Customer Name
                        </label>
                        <InputText
                            type="text"
                            id="name"
                            v-model="form.name"
                            placeholder="Enter customer name"
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
                        <label for="phone" class="text-surface-700 text-sm font-medium">
                            Phone Number
                        </label>
                        <InputText
                            type="text"
                            id="phone"
                            v-model="form.phone"
                            placeholder="Enter phone number (e.g. 081234567890)"
                            class="bg-surface-50! focus:bg-white!"
                            fluid
                            :invalid="!!error.phone"
                        />
                        <Message
                            v-if="error.phone"
                            severity="error"
                            size="small"
                            variant="simple"
                            >{{ error.phone[0] }}</Message
                        >
                    </div>

                    <div class="border-surface-100 mt-4 flex justify-end border-t pt-4">
                        <div class="flex gap-3">
                            <Button
                                label="Cancel"
                                severity="danger"
                                @click="router.back()"
                            />
                            <Button type="submit" label="Save" icon="pi pi-check" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
