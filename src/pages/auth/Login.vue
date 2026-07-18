<script setup lang="ts">
import { ref } from 'vue';
import { InputText, Button } from 'primevue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth.store';
import Message from 'primevue/message';

const auth = useAuthStore();
const error = ref<string | null>(null);
const loading = ref(false);

const form = ref({
    email: '',
    password: '',
});

async function login() {
    error.value = null;

    if (!form.value.email || !form.value.password) {
        error.value = 'Email and password are required.';
        return;
    }

    loading.value = true;

    try {
        await auth.login(form.value.email, form.value.password);
        router.push({ name: 'dashboard' });
    } catch (err) {
        error.value = 'Login failed. Please check your credentials.';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="bg-surface-50 flex min-h-screen items-center justify-center px-4 py-10">
        <div class="w-full max-w-100">
            <div class="border-surface-200 rounded-2xl border bg-white p-8 shadow-xl">
                <!-- Header -->
                <div class="mb-8 text-center">
                    <div
                        class="bg-primary-600 shadow-primary-200 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                    >
                        <i class="pi pi-bolt text-2xl"></i>
                    </div>
                    <h1 class="text-surface-900 mb-2 text-2xl font-bold">Welcome Back</h1>
                    <p class="text-surface-500">Sign in to your account</p>
                </div>
                <!-- End Header -->

                <!-- Form -->
                <form @submit.prevent="login" class="flex flex-col gap-5">
                    <Message
                        class="rounded-lg bg-red-200 px-4 py-3 text-sm font-medium text-red-500"
                        v-if="error"
                        severity="error"
                        :closable="false"
                        >{{ error }}</Message
                    >
                    <!-- Email Input -->
                    <div class="group flex flex-col gap-2">
                        <label for="email" class="text-surface-700 text-sm font-medium">
                            Email <span class="text-red-500">*</span>
                        </label>

                        <InputText
                            type="text"
                            id="email"
                            v-model="form.email"
                            placeholder="Enter your email"
                            class="bg-surface-50! focus:!bg-white!"
                            fluid
                        />
                    </div>
                    <!-- Password Input -->
                    <div class="group flex flex-col gap-2">
                        <label for="password" class="text-surface-700 text-sm font-medium">
                            Password <span class="text-red-500">*</span>
                        </label>

                        <InputText
                            type="password"
                            id="password"
                            v-model="form.password"
                            placeholder="Enter your password"
                            class="bg-surface-50! focus:!bg-white!"
                            fluid
                        />
                    </div>
                    <Button
                        :loading="loading"
                        :disabled="loading"
                        loadingIcon="pi pi-spinner pi-spin text-lg"
                        type="submit"
                        label="Sign In"
                        class="bg-primary-600 hover:bg-primary-700 rounded-lg py-2 text-white transition-colors duration-200"
                        fluid
                    />
                </form>
                <!-- End Form -->
            </div>
        </div>
    </div>
</template>
