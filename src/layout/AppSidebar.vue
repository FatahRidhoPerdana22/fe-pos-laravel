<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { Dialog, Button } from 'primevue';

const authStore = useAuthStore();
const router = useRouter();
const { user } = authStore;

const logoutDialog = ref(false);

const handleLogout = async () => {
    logoutDialog.value = false;
    await authStore.logout();
    router.push('/login');
};

const route = useRoute();
const menuItems = ref([
    {
        label: 'General',
        items: [{ icon: 'pi pi-th-large', to: '/', label: 'Dashboard' }],
    },
]);
</script>

<template>
    <div
        class="border-surface-200 fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-white transition-all duration-300"
    >
        <div class="border-surface-100 flex h-20 items-center border-b px-8">
            <div
                class="bg-primary-600 mr-3 flex h-8 w-8 items-center justify-center rounded-lg text-white"
            >
                <i class="pi pi-bolt text-lg"></i>
            </div>
            <span class="text-surface-900 text-xl font-bold">APP POS</span>
        </div>
        <!-- Menu -->
        <div class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
            <div v-for="(section, i) in menuItems" :key="i">
                <div
                    class="text-surface-400 mb-3 px-3 text-xs font-semibold tracking-wider uppercase"
                >
                    {{ section.label }}
                </div>
                <div class="flex flex-col gap-1">
                    <router-link
                        v-for="(item, j) in section.items"
                        :to="item.to"
                        :key="j"
                        class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200"
                        :class="[
                            route.path === item.to
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-surface-900 hover:bg-surface-100',
                        ]"
                    >
                        <i :class="[item.icon, 'text-lg']"></i>
                        <span class="text-sm font-medium">{{ item.label }}</span>
                    </router-link>
                </div>
            </div>
        </div>
        <!-- User Profile -->
        <div class="border-surface-200 border-t p-4">
            <div class="flex items-center gap-3">
                <div
                    class="bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full text-white"
                >
                    <i class="pi pi-user text-lg"></i>
                </div>
                <div>
                    <p class="text-surface-900 font-medium">{{ user?.name }}</p>
                    <p class="text-surface-500 text-sm">administrator</p>
                </div>
                <div
                    class="text-surface-400 hover:bg-surface-300 ml-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:text-white"
                    @click="logoutDialog = true"
                >
                    <i class="pi pi-sign-out text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <Dialog
        v-model:visible="logoutDialog"
        modal
        :draggable="false"
        :showHeader="false"
        class="p-dialog-custom overflow-hidden rounded-2xl"
        :style="{ width: '28rem' }"
    >
        <div class="flex flex-col gap-6 p-6">
            <div class="flex flex-col items-center gap-5 pt-4 text-center">
                <div
                    class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/70 text-red-600 ring-8 ring-red-50/50"
                >
                    <i class="pi pi-exclamation-triangle text-4xl"></i>
                </div>
                <div>
                    <h3 class="text-surface-900 text-xl font-bold">Konfirmasi Logout</h3>
                    <p class="text-surface-600 mt-1.5 text-sm">
                        Sesi Anda akan segera berakhir. Pastikan semua pekerjaan Anda telah
                        tersimpan sebelum keluar.
                    </p>
                </div>
            </div>

            <div class="bg-surface-50 border-surface-200 rounded-xl border p-4 text-center">
                <span class="text-surface-500 text-sm font-medium">
                    Apakah Anda yakin ingin keluar dari akun ini?
                </span>
            </div>

            <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-center">
                <Button
                    type="button"
                    icon="pi pi-times"
                    label="Batal"
                    severity="secondary"
                    class="sm:flex-1"
                    size="small"
                    @click="logoutDialog = false"
                    raised
                />
                <Button
                    type="button"
                    icon="pi pi-check"
                    label="Ya, Keluar Sesi"
                    class="sm:flex-1"
                    size="small"
                    @click="handleLogout"
                    raised
                />
            </div>
        </div>
    </Dialog>
</template>
