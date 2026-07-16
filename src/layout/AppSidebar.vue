<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const menuItems = ref([
    {
        label: "General",
        items: [{ icon: "pi pi-th-large", to: "/", label: "Dashboard" }],
    },
]);
</script>

<template>
    <div
        class="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200 flex flex-col z-50 transition-all duration-300"
    >
        <div class="h-20 flex items-center px-8 border-b border-surface-100">
            <div
                class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white mr-3"
            >
                <i class="pi pi-bolt text-lg"></i>
            </div>
            <span class="text-xl font-bold text-surface-900">APP POS</span>
        </div>
        <!-- Menu -->
        <div class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
            <div v-for="(section, i) in menuItems" :key="i">
                <div
                    class="text-xs font-semibold text-surface-400 mb-3 px-3 uppercase tracking-wider"
                >
                    {{ section.label }}
                </div>
                <div class="flex flex-col gap-1">
                    <router-link
                        v-for="(item, j) in section.items"
                        :to="item.to"
                        :key="index"
                        class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200"
                        :class="[
                            route.path === item.to
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-surface-900 hover:bg-surface-100',
                        ]"
                    >
                        <i :class="[item.icon, 'text-lg']"></i>
                        <span class="text-sm font-medium">{{
                            item.label
                        }}</span>
                    </router-link>
                </div>
            </div>
        </div>
        <!-- User Profile -->
        <div class="p-4 border-t border-surface-200">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white"
                >
                    <i class="pi pi-user text-lg"></i>
                </div>
                <div>
                    <p class="font-medium text-surface-900">John Doe</p>
                    <p class="text-sm text-surface-500">Administrator</p>
                </div>
                <div
                    class="ml-auto w-8 h-8 rounded-lg flex items-center text-surface-400"
                >
                    <i class="pi pi-sign-out hover:text-surface-600"></i>
                </div>
            </div>
        </div>
    </div>
</template>
