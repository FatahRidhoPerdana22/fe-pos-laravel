<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { getProducts } from '@/api/products.api';
import { getCategories } from '@/api/product-categories.api';
import { getCustomers, createCustomer } from '@/api/customers.api';
import { useCartStore } from '@/stores/cart.store';
import { useToast } from 'primevue/usetoast';
import { Button, InputText, IconField, Select, Dialog, Message } from 'primevue';
import type { Product } from '@/types/product';
import type { Customer } from '@/types/customer';

const toast = useToast();
const cartStore = useCartStore();

/* Product Catalog State */
const products = ref<Product[]>([]);
const categories = ref<{ id: number | null; name: string }[]>([]);
const selectedCategoryId = ref<number | null>(null);
const searchQuery = ref('');
const loadingProducts = ref(false);

/* Customer Selection State */
const customers = ref<Customer[]>([]);
const selectedCustomer = ref<Customer | null>(null);
const showAddCustomerDialog = ref(false);
const newCustomerForm = ref({ name: '', phone: '' });
const newCustomerErrors = ref<Record<string, string[]>>({});
const addingCustomer = ref(false);

/* Checkout & Receipt State */
const showReceiptDialog = ref(false);
const completedTransaction = ref<any>(null);

/* Cart Actions */
const handleAddToCart = (product: Product) => {
    try {
        cartStore.addToCart(product, 1);
        toast.add({
            severity: 'success',
            summary: 'Added to Cart',
            detail: `${product.name} added to cart`,
            life: 1500,
        });
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Failed',
            detail: err.message,
            life: 2000,
        });
    }
};

const incrementQty = (item: any) => {
    try {
        cartStore.updateQuantity(item.product.id, item.quantity + 1);
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Out of Stock',
            detail: err.message,
            life: 2000,
        });
    }
};

const decrementQty = (item: any) => {
    cartStore.updateQuantity(item.product.id, item.quantity - 1);
};

const fetchProductsList = async () => {
    loadingProducts.value = true;
    try {
        const params: Record<string, any> = {
            limit: 100,
        };

        if (searchQuery.value.trim() !== '') {
            params.search = searchQuery.value.trim();
        }

        // Ubah nama parameter menjadi 'product_category_id'
        if (selectedCategoryId.value !== null && selectedCategoryId.value !== undefined) {
            params.product_category_id = selectedCategoryId.value;
        }

        const res = await getProducts(params);
        products.value = res.data?.data?.items || res.data?.data || [];
    } catch (err) {
        console.error('Error loading products:', err);
    } finally {
        loadingProducts.value = false;
    }
};

const fetchCategoriesList = async () => {
    try {
        const res = await getCategories({ limit: 100 });
        categories.value = [
            { id: null, name: 'All' },
            ...res.data.data.items.map((cat: any) => ({ id: cat.id, name: cat.name })),
        ];
    } catch (err) {
        console.error('Error loading categories:', err);
    }
};

const fetchCustomersList = async (searchQuery?: string) => {
    try {
        const res = await getCustomers({ limit: 100, search: searchQuery });

        customers.value = res.data?.data?.items || res.data?.data || res.data || [];
    } catch (err) {
        console.error('Error loading customers:', err);
    }
};

/* Customer search input for the Select filter */
const customerSearchQuery = ref('');

const filteredCustomers = computed(() => {
    if (!customerSearchQuery.value) return customers.value;
    const q = customerSearchQuery.value.toLowerCase();
    return customers.value.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.toLowerCase().includes(q)),
    );
});

const filteredProducts = computed(() => {
    let result = products.value;

    if (selectedCategoryId.value) {
        result = result.filter((p: any) => {
            // Ambil ID kategori dari berbagai kemungkinan struktur data API
            const categoryIdInProduct = p.product_category_id ?? p.category_id ?? p.category?.id;

            return categoryIdInProduct == selectedCategoryId.value;
        });
    }

    // 2. Filter Pencarian Nama
    if (searchQuery.value && searchQuery.value.trim() !== '') {
        const q = searchQuery.value.toLowerCase().trim();
        result = result.filter((p) => p.name?.toLowerCase().includes(q));
    }

    return result;
});

/* Listen to Search & Category changes */
watch(
    [selectedCategoryId, searchQuery],
    () => {
        fetchProductsList();
    },
    { deep: true },
);

/* Sync Customer with store */
watch(selectedCustomer, (newVal) => {
    cartStore.setCustomerId(newVal ? newVal.id : null);
});

/* Add Customer Dialog Submit */
const handleAddCustomerSubmit = async () => {
    addingCustomer.value = true;
    newCustomerErrors.value = {};
    try {
        const res = await createCustomer(newCustomerForm.value);
        const created = res.data.data;
        toast.add({
            severity: 'success',
            summary: 'Customer Registered',
            detail: `Customer ${created.name} successfully registered`,
            life: 3000,
        });
        await fetchCustomersList();
        selectedCustomer.value = customers.value.find((c) => c.id === created.id) || null;
        newCustomerForm.value = { name: '', phone: '' };
        showAddCustomerDialog.value = false;
    } catch (err: any) {
        if (err.response?.status === 422) {
            newCustomerErrors.value = err.response.data.errors;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to create customer',
                life: 3000,
            });
        }
    } finally {
        addingCustomer.value = false;
    }
};

/* Place Order / Checkout Action */
const handleCheckout = async () => {
    try {
        const result = await cartStore.checkout();
        completedTransaction.value = result;
        showReceiptDialog.value = true;
        selectedCustomer.value = null;
        toast.add({
            severity: 'success',
            summary: 'Transaction Success',
            detail: 'Order placed successfully',
            life: 3000,
        });
        // Reload products list to reflect new stocks
        await fetchProductsList();
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Checkout Failed',
            detail: err.response?.data.message || err.message,
            life: 4000,
        });
    }
};

/* Invoice printer handler (Web Serial API for ESC/POS Thermal Printers) */
const handlePrintReceipt = async () => {
    if (!completedTransaction.value) return;

    // Check if Web Serial API is supported
    if (!('serial' in navigator)) {
        toast.add({
            severity: 'error',
            summary: 'Unsupported Browser',
            detail: 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.',
            life: 5000,
        });
        return;
    }

    try {
        // Request a port and open a connection
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 9600 }); // Standard baud rate for thermal printers

        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();

        // ESC/POS Commands
        const ESC = '\x1B';
        const GS = '\x1D';

        let data = '';
        // Initialize Printer
        data += ESC + '@';

        // Alignment Center
        data += ESC + 'a' + '\x01';
        data += 'FATAH RIDHO POS\n';
        data += 'Malang, East Java, Indonesia\n';
        data += '--------------------------------\n';

        // Alignment Left
        data += ESC + 'a' + '\x00';
        data += `Invoice : ${completedTransaction.value.code}\n`;
        data += `Date    : ${formatDate(completedTransaction.value.created_at)}\n`;
        data += `Customer: ${completedTransaction.value.customer?.name || '-'}\n`;
        data += '--------------------------------\n';

        // Items
        completedTransaction.value.items.forEach((item: any) => {
            data += `${item.product?.name}\n`;
            data += `${item.quantity} x ${formatCurrency(item.price).replace(/\u00A0/g, ' ')}\n`;
            // Align right for subtotal
            const subtotalStr = formatCurrency(item.subtotal).replace(/\u00A0/g, ' ');
            data += ESC + 'a' + '\x02' + subtotalStr + '\n' + ESC + 'a' + '\x00';
        });

        data += '--------------------------------\n';
        data += `Subtotal   : ${formatCurrency(completedTransaction.value.subtotal).replace(/\u00A0/g, ' ')}\n`;
        data += `Tax (11%)  : ${formatCurrency(completedTransaction.value.tax).replace(/\u00A0/g, ' ')}\n`;
        data += `Grand Total: ${formatCurrency(completedTransaction.value.total).replace(/\u00A0/g, ' ')}\n`;
        data += '--------------------------------\n';

        // Alignment Center
        data += ESC + 'a' + '\x01';
        data += 'Thank you for shopping with us!\n';
        data += '\n\n\n\n\n'; // Feed paper before cutting

        // Cut Paper
        data += GS + 'V' + '\x41' + '\x00';

        await writer.write(encoder.encode(data));
        writer.releaseLock();
        await port.close();

        toast.add({
            severity: 'success',
            summary: 'Print Success',
            detail: 'Receipt sent to thermal printer',
            life: 3000,
        });
    } catch (err: any) {
        console.error('Print Error:', err);
        // Only show error if it's not a user cancellation
        if (err.name !== 'NotFoundError') {
            toast.add({
                severity: 'error',
                summary: 'Printer Error',
                detail: err.message || 'Failed to connect to printer.',
                life: 5000,
            });
        }
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

onMounted(() => {
    fetchProductsList();
    fetchCategoriesList();
    fetchCustomersList();
});
</script>

<template>
    <div
        class="bg-surface-50 text-surface-900 grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 font-sans lg:grid-cols-12"
    >
        <!-- LEFT: Catalog Section (8 cols on large screens) -->
        <div class="flex flex-col gap-6 lg:col-span-8">
            <!-- Search & Filters -->
            <div
                class="border-surface-200 flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
                <IconField iconPosition="left" class="relative w-full sm:w-80">
                    <div
                        class="text-surface-400 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                    >
                        <i class="pi pi-search text-5xl"></i>
                    </div>
                    <InputText v-model="searchQuery" placeholder="" class="w-full pl-10!" />
                </IconField>

                <!-- Category Filters Scrollable Badge List -->
                <div class="flex flex-wrap gap-2 overflow-x-auto py-1">
                    <button
                        v-for="cat in categories"
                        :key="cat.id ?? 'all'"
                        type="button"
                        @click="selectedCategoryId = cat.id ?? null"
                        :class="[
                            'cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200',
                            (!selectedCategoryId && !cat.id) || selectedCategoryId == cat.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-surface-100 text-surface-700 hover:bg-surface-200',
                        ]"
                    >
                        {{ cat.name }}
                    </button>
                </div>
            </div>

            <!-- Products Catalog Grid -->
            <div v-if="loadingProducts" class="flex flex-1 items-center justify-center py-20">
                <div class="flex flex-col items-center gap-3">
                    <i class="pi pi-spin pi-spinner text-primary-600 text-4xl"></i>
                    <span class="text-surface-500 font-medium">Loading catalog items...</span>
                </div>
            </div>

            <div
                v-else-if="products.length === 0"
                class="border-surface-300 flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-20"
            >
                <i class="pi pi-shopping-bag text-surface-300 mb-4 text-6xl"></i>
                <h3 class="text-surface-900 text-lg font-bold">No Products Found</h3>
                <p class="text-surface-500 mt-1 text-sm">
                    Try another category filter or keyword search
                </p>
            </div>

            <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                <div
                    v-for="prod in filteredProducts"
                    :key="prod.id"
                    @click="prod.stock > 0 && handleAddToCart(prod)"
                    :class="[
                        'group flex flex-col justify-between overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-all duration-300',
                        prod.stock > 0
                            ? 'border-surface-200 hover:border-primary-500 cursor-pointer hover:-translate-y-1 hover:shadow-md'
                            : 'border-surface-100 cursor-not-allowed opacity-60',
                    ]"
                >
                    <!-- Product Image -->
                    <div
                        class="bg-surface-50 relative aspect-square w-full overflow-hidden rounded-lg"
                    >
                        <img
                            :src="prod.image || 'http://localhost:8000/storage/no-image.jpg'"
                            :alt="prod.name"
                            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span
                            v-if="prod.stock === 0"
                            class="absolute top-2 right-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white"
                        >
                            OUT OF STOCK
                        </span>
                        <span
                            v-else-if="prod.stock < 10"
                            class="absolute top-2 right-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white"
                        >
                            LOW STOCK
                        </span>
                    </div>

                    <!-- Details -->
                    <div class="mt-4 flex flex-1 flex-col justify-between">
                        <div>
                            <span
                                class="text-surface-400 text-[10px] font-semibold tracking-wider uppercase"
                            >
                                {{ prod.category?.name || 'Uncategorized' }}
                            </span>
                            <h4
                                class="text-surface-800 mt-1 line-clamp-2 text-sm font-bold text-ellipsis"
                            >
                                {{ prod.name }}
                            </h4>
                        </div>
                        <div
                            class="border-surface-100 mt-3 flex items-center justify-between border-t pt-3"
                        >
                            <span class="text-primary-700 text-base font-extrabold">
                                {{ formatCurrency(prod.price) }}
                            </span>
                            <span class="text-surface-500 text-[11px] font-medium">
                                Stock: {{ prod.stock }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RIGHT: Checkout Cart Column (4 cols on large screens) -->
        <div class="flex flex-col gap-6 lg:col-span-4">
            <div
                class="border-surface-200 flex flex-col rounded-xl border bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]"
            >
                <!-- Customer Selection -->
                <div class="mb-5 flex flex-col gap-2">
                    <label class="text-surface-700 text-sm font-semibold">Select Customer</label>
                    <div class="flex items-center gap-2">
                        <Select
                            v-model="selectedCustomer"
                            :options="customers"
                            optionLabel="name"
                            placeholder="Select customer..."
                            class="bg-surface-50! flex-1 focus:bg-white!"
                            filter
                            :filterFields="['name', 'phone']"
                            filterPlaceholder="Search customer..."
                            showClear
                        />
                        <Button
                            icon="pi pi-user-plus"
                            @click="showAddCustomerDialog = true"
                            severity="secondary"
                            class="shrink-0"
                            title="Register new customer"
                        />
                    </div>
                </div>

                <div class="border-surface-200 border-b pb-3">
                    <h3
                        class="text-surface-900 flex items-center justify-between text-base font-bold"
                    >
                        <span>Cart Details</span>
                        <span
                            class="bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs font-semibold"
                        >
                            {{ cartStore.itemCount }} item(s)
                        </span>
                    </h3>
                </div>

                <!-- Scrollable Cart List -->
                <div class="flex-1 overflow-y-auto py-3">
                    <div
                        v-if="cartStore.items.length === 0"
                        class="flex h-full flex-col items-center justify-center py-8 text-center"
                    >
                        <i class="pi pi-shopping-cart text-surface-200 mb-3 text-5xl"></i>
                        <p class="text-surface-400 text-sm">Your shopping cart is empty.</p>
                    </div>

                    <div v-else class="flex flex-col gap-3">
                        <div
                            v-for="item in cartStore.items"
                            :key="item.product.id"
                            class="bg-surface-50 border-surface-100 flex items-center justify-between rounded-lg border p-3"
                        >
                            <div class="flex-1 pr-3">
                                <h4 class="text-surface-900 w-40 truncate text-sm font-bold">
                                    {{ item.product.name }}
                                </h4>
                                <p class="text-surface-500 mt-0.5 text-xs">
                                    {{ formatCurrency(item.product.price) }} × {{ item.quantity }}
                                </p>
                            </div>

                            <!-- Qty buttons -->
                            <div
                                class="border-surface-200 flex shrink-0 items-center gap-1.5 rounded-md border bg-white p-1"
                            >
                                <button
                                    @click="decrementQty(item)"
                                    class="text-surface-500 flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:text-red-600"
                                >
                                    <i class="pi pi-minus text-[10px]"></i>
                                </button>
                                <span class="text-surface-800 w-6 text-center text-xs font-bold">
                                    {{ item.quantity }}
                                </span>
                                <button
                                    @click="incrementQty(item)"
                                    class="text-surface-500 hover:text-primary-600 flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors"
                                >
                                    <i class="pi pi-plus text-[10px]"></i>
                                </button>
                            </div>

                            <!-- Trash button -->
                            <button
                                @click="cartStore.removeFromCart(item.product.id)"
                                class="text-surface-400 ml-3 shrink-0 cursor-pointer hover:text-red-600"
                            >
                                <i class="pi pi-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Calculation Summary -->
                <div class="border-surface-200 mt-auto border-t pt-4">
                    <div class="flex flex-col gap-2">
                        <div class="text-surface-600 flex items-center justify-between text-sm">
                            <span>Subtotal</span>
                            <span class="font-medium">{{
                                formatCurrency(cartStore.subtotal)
                            }}</span>
                        </div>
                        <div class="text-surface-600 flex items-center justify-between text-sm">
                            <span>Tax (11%)</span>
                            <span class="font-medium">{{ formatCurrency(cartStore.tax) }}</span>
                        </div>
                        <div
                            class="border-surface-200 text-surface-900 flex items-center justify-between border-t border-dashed pt-3"
                        >
                            <span class="text-base font-bold">Grand Total</span>
                            <span class="text-primary-800 text-lg font-extrabold">
                                {{ formatCurrency(cartStore.total) }}
                            </span>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="mt-5 grid grid-cols-3 gap-3">
                        <Button
                            label="Clear"
                            severity="danger"
                            outlined
                            :disabled="cartStore.items.length === 0"
                            @click="cartStore.clearCart()"
                        />
                        <Button
                            label="Pay & Checkout"
                            icon="pi pi-check"
                            class="col-span-2"
                            :loading="cartStore.loading"
                            :disabled="cartStore.items.length === 0 || !selectedCustomer"
                            @click="handleCheckout"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- QUICK ADD CUSTOMER DIALOG -->
    <Dialog
        v-model:visible="showAddCustomerDialog"
        modal
        header="Register New Customer"
        :draggable="false"
        class="overflow-hidden rounded-xl shadow-xl"
        :style="{ width: '26rem' }"
    >
        <form @submit.prevent="handleAddCustomerSubmit" class="flex flex-col gap-4 pt-2">
            <div class="group flex flex-col gap-1.5">
                <label for="new-customer-name" class="text-surface-700 text-xs font-semibold"
                    >Name</label
                >
                <InputText
                    id="new-customer-name"
                    v-model="newCustomerForm.name"
                    placeholder="Customer name"
                    fluid
                    :invalid="!!newCustomerErrors.name"
                />
                <Message
                    v-if="newCustomerErrors.name"
                    severity="error"
                    size="small"
                    variant="simple"
                >
                    {{ newCustomerErrors.name[0] }}
                </Message>
            </div>

            <div class="group flex flex-col gap-1.5">
                <label for="new-customer-phone" class="text-surface-700 text-xs font-semibold"
                    >Phone Number</label
                >
                <InputText
                    id="new-customer-phone"
                    v-model="newCustomerForm.phone"
                    placeholder="Phone number"
                    fluid
                    :invalid="!!newCustomerErrors.phone"
                />
                <Message
                    v-if="newCustomerErrors.phone"
                    severity="error"
                    size="small"
                    variant="simple"
                >
                    {{ newCustomerErrors.phone[0] }}
                </Message>
            </div>

            <div class="border-surface-100 flex justify-end gap-3 border-t pt-3">
                <Button
                    type="button"
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="showAddCustomerDialog = false"
                />
                <Button type="submit" label="Register" :loading="addingCustomer" />
            </div>
        </form>
    </Dialog>

    <!-- INVOICE RECEIPT DIALOG (POPUP ON SUCCESS) -->
    <Dialog
        v-model:visible="showReceiptDialog"
        modal
        :showHeader="false"
        :draggable="false"
        class="overflow-hidden rounded-2xl p-0 shadow-2xl"
        :style="{ width: '28rem' }"
    >
        <div class="p-6">
            <!-- Printing Container -->
            <div id="receipt-print-area" class="flex flex-col text-center">
                <div
                    class="border-surface-200 flex flex-col items-center border-b border-dashed pb-4"
                >
                    <div
                        class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                    >
                        <i class="pi pi-check text-2xl"></i>
                    </div>
                    <h3 class="text-surface-900 text-lg font-extrabold tracking-wide uppercase">
                        Fatah RIDHO POS
                    </h3>
                    <p class="text-surface-500 mt-0.5 text-xs">Malang, East Java, Indonesia</p>
                </div>

                <!-- Invoice Meta Details -->
                <div
                    class="border-surface-200 text-surface-600 flex flex-col gap-1.5 border-b border-dashed py-4 text-left text-xs"
                >
                    <div class="flex justify-between">
                        <span>Invoice Code:</span>
                        <span class="text-surface-900 font-bold">{{
                            completedTransaction?.code
                        }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Date:</span>
                        <span>{{ formatDate(completedTransaction?.created_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Customer:</span>
                        <span class="text-surface-900 font-semibold">{{
                            completedTransaction?.customer?.name
                        }}</span>
                    </div>
                </div>

                <!-- Transaction Items Table -->
                <table
                    class="border-surface-200 my-1 w-full border-b border-dashed py-3 text-left text-xs"
                >
                    <thead>
                        <tr class="text-surface-500 border-surface-100 border-b">
                            <th class="pb-2">Item</th>
                            <th class="pb-2 text-center">Qty</th>
                            <th class="pb-2 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in completedTransaction?.items"
                            :key="item.id"
                            class="text-surface-800"
                        >
                            <td class="py-2 pr-2">
                                <span class="font-bold">{{ item.product?.name }}</span>
                                <span class="text-surface-500 block text-[10px]">{{
                                    formatCurrency(item.price)
                                }}</span>
                            </td>
                            <td class="py-2 text-center">{{ item.quantity }}</td>
                            <td class="py-2 text-right">{{ formatCurrency(item.subtotal) }}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Summary Totals -->
                <div class="flex flex-col gap-1.5 py-4 text-left text-xs">
                    <div class="text-surface-600 flex justify-between">
                        <span>Subtotal:</span>
                        <span>{{ formatCurrency(completedTransaction?.subtotal) }}</span>
                    </div>
                    <div class="text-surface-600 flex justify-between">
                        <span>Pajak (11%):</span>
                        <span>{{ formatCurrency(completedTransaction?.tax) }}</span>
                    </div>
                    <div
                        class="text-surface-900 border-surface-200 mt-1 flex justify-between border-t border-dashed pt-3 text-sm font-extrabold"
                    >
                        <span>Grand Total:</span>
                        <span>{{ formatCurrency(completedTransaction?.total) }}</span>
                    </div>
                </div>

                <div
                    class="text-surface-400 border-surface-200 border-t border-dashed pt-4 text-center text-[10px]"
                >
                    Thank you for shopping with us!
                </div>
            </div>

            <!-- Dialog Action Buttons -->
            <div class="border-surface-100 mt-6 flex gap-3 border-t pt-4">
                <Button
                    label="Print Invoice"
                    icon="pi pi-print"
                    class="flex-1"
                    @click="handlePrintReceipt"
                />
                <Button
                    label="Close"
                    severity="secondary"
                    outlined
                    class="flex-1"
                    @click="showReceiptDialog = false"
                />
            </div>
        </div>
    </Dialog>
</template>
