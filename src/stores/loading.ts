import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
    const isLoading = ref(false);

    const show = () => {
        isLoading.value = true;
    };
    const hide = () => {
        isLoading.value = false;
    };

    return { isLoading, show, hide };
});
