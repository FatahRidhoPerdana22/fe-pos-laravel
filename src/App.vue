<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toast } from 'primevue';

import { useLoadingStore } from '@/stores/loading';
import ProgressSpinner from 'primevue/progressspinner';

const loadingStore = useLoadingStore();
</script>

<template>
    <div
        v-if="loadingStore.isLoading"
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
    >
        <div class="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-xl">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            <span class="text-surface-600 text-sm font-medium">Memproses data...</span>
        </div>
    </div>
    <Toast />
    <RouterView />
</template>

<style scoped></style>
