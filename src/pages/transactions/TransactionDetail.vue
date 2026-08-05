<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTransaction } from '@/api/transactions.api';
import { Button } from 'primevue';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const transactionId = Number(route.params.id);
const transaction = ref<any>(null);
const loading = ref(true);

const fetchTransactionDetails = async () => {
    loading.value = true;
    try {
        const res = await getTransaction(transactionId);
        transaction.value = res.data.data;
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load transaction details',
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (val: string) => {
    if (!val) return '';
    return new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area');
    if (!printContent) return;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `Print_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice POS</title>
                    <style>
                        body { font-family: monospace; font-size: 12px; padding: 20px; line-height: 1.4; color: #000; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .border-top { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; }
                        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                        .table th, .table td { text-align: left; padding: 4px 0; }
                        .table .qty { text-align: center; }
                        .table .price { text-align: right; }
                        .flex-row { display: flex; justify-content: space-between; }
                        .bold { font-weight: bold; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    }
};

onMounted(() => {
    fetchTransactionDetails();
});
</script>

<template>
    <div class="bg-surface-50 text-surface-900 min-h-screen font-sans">
        <div class="mb-8 flex items-center justify-between">
            <div>
                <h1 class="text-surface-900 mb-1 text-2xl font-bold">Invoice Details</h1>
                <p class="text-surface-500 text-sm">Invoice and itemized breakdown of POS ticket</p>
            </div>
            <Button asChild v-slot="slotProps">
                <button @click="router.back()" :class="slotProps.class">
                    <i class="pi pi-arrow-left" /> Back
                </button>
            </Button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-surface-200 shadow-sm max-w-2xl mx-auto">
            <div class="flex flex-col items-center gap-3">
                <i class="pi pi-spin pi-spinner text-primary-600 text-4xl"></i>
                <span class="text-surface-500 font-medium">Loading invoice details...</span>
            </div>
        </div>

        <div v-else-if="!transaction" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-surface-200 shadow-sm max-w-2xl mx-auto">
            <i class="pi pi-exclamation-circle text-red-500 text-5xl mb-3"></i>
            <h3 class="text-surface-900 text-lg font-bold">Transaction Not Found</h3>
        </div>

        <div v-else class="bg-white border border-surface-200 rounded-2xl shadow-sm max-w-lg mx-auto p-6 md:p-8">
            <!-- Print Area -->
            <div id="receipt-print-area" class="flex flex-col text-center">
                <div class="flex flex-col items-center pb-4 border-b border-dashed border-surface-200">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                        <i class="pi pi-check text-2xl"></i>
                    </div>
                    <h3 class="text-surface-900 font-extrabold text-lg uppercase tracking-wide">Fatah RIDHO POS</h3>
                    <p class="text-surface-500 text-xs mt-0.5">Malang, East Java, Indonesia</p>
                </div>

                <!-- Invoice Meta Details -->
                <div class="flex flex-col gap-1.5 py-4 text-left text-xs border-b border-dashed border-surface-200 text-surface-600">
                    <div class="flex justify-between">
                        <span>Invoice Code:</span>
                        <span class="font-bold text-surface-900">{{ transaction.code }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Date & Time:</span>
                        <span>{{ formatDate(transaction.created_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Customer Name:</span>
                        <span class="font-semibold text-surface-900">{{ transaction.customer?.name }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Customer Phone:</span>
                        <span class="text-surface-900">{{ transaction.customer?.phone || '-' }}</span>
                    </div>
                </div>

                <!-- Transaction Items Table -->
                <table class="w-full text-left text-xs border-b border-dashed border-surface-200 py-3 my-1">
                    <thead>
                        <tr class="text-surface-500 border-b border-surface-100">
                            <th class="pb-2">Item Description</th>
                            <th class="pb-2 text-center">Qty</th>
                            <th class="pb-2 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in transaction.items" :key="item.id" class="text-surface-800">
                            <td class="py-2 pr-2">
                                <span class="font-bold">{{ item.product?.name || 'Deleted Product' }}</span>
                                <span class="block text-[10px] text-surface-500">{{ formatCurrency(item.price) }}</span>
                            </td>
                            <td class="py-2 text-center">{{ item.quantity }}</td>
                            <td class="py-2 text-right">{{ formatCurrency(item.subtotal) }}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Summary Totals -->
                <div class="flex flex-col gap-1.5 py-4 text-xs text-left">
                    <div class="flex justify-between text-surface-600">
                        <span>Subtotal:</span>
                        <span>{{ formatCurrency(transaction.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-surface-600">
                        <span>Pajak (11%):</span>
                        <span>{{ formatCurrency(transaction.tax) }}</span>
                    </div>
                    <div class="flex justify-between text-surface-900 text-sm font-extrabold mt-1 border-t border-dashed border-surface-200 pt-3">
                        <span>Grand Total:</span>
                        <span>{{ formatCurrency(transaction.total) }}</span>
                    </div>
                </div>

                <div class="text-center text-[10px] text-surface-400 border-t border-dashed border-surface-200 pt-4">
                    Thank you for shopping with us!
                </div>
            </div>

            <!-- Action buttons outside printing area -->
            <div class="flex gap-3 mt-8 border-t border-surface-100 pt-5">
                <Button
                    label="Print Receipt"
                    icon="pi pi-print"
                    class="flex-1"
                    @click="handlePrint"
                />
                <Button
                    label="Back to List"
                    severity="secondary"
                    outlined
                    class="flex-1"
                    @click="router.push({ name: 'transactions' })"
                />
            </div>
        </div>
    </div>
</template>
