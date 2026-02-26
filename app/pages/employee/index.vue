// Trang POS cho nhân viên - chọn món, tra cứu khách hàng, thanh toán

<template>
  <div class="employee-pos-wrapper">
    <div class="pos-left">
      <div class="pos-filters">
        <input
          v-model="searchQuery"
          type="text"
          class="pos-search"
          placeholder="🔍 Tìm món..."
        />
        <div class="category-tabs">
          <button
            class="cat-tab"
            :class="{ active: selectedCategory === '' }"
            @click="selectedCategory = ''"
          >
            Tất cả
          </button>
          <button
            v-for="cat in PRODUCT_CATEGORIES"
            :key="cat"
            class="cat-tab"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat as any"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="pos-products">
        <div
          v-for="product in paginatedProducts"
          :key="product.id"
          class="pos-product-card"
          :class="{ unavailable: !product.isAvailable }"
          @click="product.isAvailable && handleAddToOrder(product)"
        >
          <img :src="product.image" :alt="product.name" class="product-img" />
          <div class="product-info">
            <span class="product-name">{{ product.name }}</span>
            <span class="product-price">{{
              formatCurrency(product.price)
            }}</span>
          </div>
          <div v-if="getInCartCount(product.id)" class="cart-badge">
            {{ getInCartCount(product.id) }}
          </div>
          <div v-if="!product.isAvailable" class="unavailable-overlay">
            Hết hàng
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pos-pagination">
        <button :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
          ←
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          →
        </button>
      </div>
    </div>

    <div class="pos-right">
      <div class="order-header">
        <h3>🧾 Đơn hàng hiện tại</h3>
        <button
          v-if="currentOrder.length > 0"
          class="btn-clear"
          @click="handleClearOrder"
        >
          Xóa
        </button>
      </div>

      <div class="customer-lookup">
        <div class="lookup-row">
          <input
            v-model="customerPhone"
            type="tel"
            class="lookup-input"
            placeholder="Nhập SĐT khách hàng..."
            @input="lookupCustomer"
          />
          <button
            v-if="!foundCustomer && customerPhone.length >= 10"
            class="btn-new-customer"
            @click="showNewCustomer = true"
          >
            + Mới
          </button>
        </div>
        <div v-if="foundCustomer" class="customer-found">
          <span class="customer-name">⭐ {{ foundCustomer.name }}</span>
          <span class="customer-points">{{ foundCustomer.points }} điểm</span>
          <button
            v-if="foundCustomer.points > 0"
            class="btn-use-points"
            @click="toggleUsePoints"
          >
            {{ usePoints ? "✅ Dùng điểm" : "Dùng điểm" }}
          </button>
        </div>
        <div v-if="showNewCustomer" class="new-customer-form">
          <input
            v-model="newCustomerName"
            type="text"
            placeholder="Tên khách hàng..."
            class="lookup-input"
          />
          <button class="btn-save-customer" @click="handleAddNewCustomer">
            Lưu
          </button>
        </div>
      </div>

      <div class="order-items">
        <div
          v-for="item in currentOrder"
          :key="item.productId"
          class="order-item"
        >
          <div class="item-details">
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-unit-price">{{
              formatCurrency(item.price)
            }}</span>
          </div>
          <div class="item-controls">
            <button
              class="qty-btn"
              @click="handleQuantityChange(item.productId, item.quantity - 1)"
            >
              −
            </button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button
              class="qty-btn"
              @click="handleQuantityChange(item.productId, item.quantity + 1)"
            >
              +
            </button>
            <button
              class="btn-remove-item"
              @click="removeFromOrder(item.productId)"
            >
              ✕
            </button>
          </div>
          <div class="item-subtotal">
            {{ formatCurrency(item.price * item.quantity) }}
          </div>
        </div>
        <div v-if="currentOrder.length === 0" class="empty-order">
          <span>🛒</span>
          <p>Chưa có món nào</p>
        </div>
      </div>

      <div class="order-footer">
        <div v-if="discountAmount > 0" class="discount-row">
          <span>Giảm giá (điểm)</span>
          <span>-{{ formatCurrency(discountAmount) }}</span>
        </div>
        <div class="total-row">
          <span>Tổng cộng</span>
          <span class="total-value">{{ formatCurrency(finalTotal) }}</span>
        </div>
        <button
          class="btn-checkout"
          :disabled="currentOrder.length === 0"
          @click="showPayment = true"
        >
          💳 Thanh toán
        </button>
      </div>
    </div>

    <PaymentModal
      v-if="showPayment"
      :items="currentOrder"
      :total="orderTotal"
      :discount="discountAmount"
      :customer-info="foundCustomer || null"
      @close="showPayment = false"
      @confirm="handlePaymentConfirm"
    />

    <div
      v-if="showSuccess"
      class="success-overlay"
      @click="showSuccess = false"
    >
      <div class="success-content">
        <span class="success-icon">✅</span>
        <h3>Thanh toán thành công!</h3>
        <p>Đơn hàng đã được hoàn tất</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import { PRODUCT_CATEGORIES } from "~/types";
import { usePosStorage } from "~/composables/usePosStorage";

const auth = useAuth();
const {
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  paginatedProducts,
  load: loadProducts,
  setPage,
} = useProducts();
const {
  currentOrder,
  orderTotal,
  addToOrder,
  removeFromOrder,
  updateQuantity,
  completeOrder,
  clearOrder,
  load: loadOrders,
} = useOrders();
const {
  customers,
  load: loadCustomers,
  findByPhone,
  addCustomer,
  addPoints,
} = useCustomers();

const customerPhone = ref("");
const foundCustomer = ref<ReturnType<typeof findByPhone>>(undefined);
const usePoints = ref(false);
const showPayment = ref(false);
const showSuccess = ref(false);
const showNewCustomer = ref(false);
const newCustomerName = ref("");

onMounted(() => {
  loadProducts();
  loadOrders();
  loadCustomers();
});

const discountAmount = computed(() => {
  if (!usePoints.value || !foundCustomer.value) return 0;
  return Math.min(foundCustomer.value.points * 1000, orderTotal.value);
});

const finalTotal = computed(() => orderTotal.value - discountAmount.value);

function handleAddToOrder(product: Product) {
  addToOrder({
    productId: product.id,
    productName: product.name,
    price: product.price,
  });
}

function getInCartCount(productId: string): number {
  const item = currentOrder.value.find((i) => i.productId === productId);
  return item?.quantity || 0;
}

function handleQuantityChange(productId: string, qty: number) {
  updateQuantity(productId, qty);
}

function handleClearOrder() {
  if (confirm("Xóa toàn bộ đơn hàng?")) {
    clearOrder();
  }
}

function lookupCustomer() {
  if (customerPhone.value.length >= 10) {
    foundCustomer.value = findByPhone(customerPhone.value);
    showNewCustomer.value = false;
  } else {
    foundCustomer.value = undefined;
    usePoints.value = false;
  }
}

function toggleUsePoints() {
  usePoints.value = !usePoints.value;
}

function handleAddNewCustomer() {
  if (!newCustomerName.value) return;
  const customer = addCustomer({
    name: newCustomerName.value,
    phone: customerPhone.value,
  });
  foundCustomer.value = customer;
  showNewCustomer.value = false;
  newCustomerName.value = "";
}

function handlePaymentConfirm(method: "cash" | "qr") {
  const order = completeOrder({
    customerId: foundCustomer.value?.id || null,
    customerPhone: customerPhone.value,
    paymentMethod: method,
    discount: discountAmount.value,
    employeeId: auth.user.value?.id || "",
    employeeName: auth.user.value?.name || "",
  });

  if (foundCustomer.value) {
    addPoints(foundCustomer.value.id, order.finalTotal);
    if (usePoints.value) {
      const pointsUsed = Math.floor(discountAmount.value / 1000);
      const customer = customers.value.find(
        (c) => c.id === foundCustomer.value!.id,
      );
      if (customer) {
        customer.points -= pointsUsed;
        const posStorage = usePosStorage();
        posStorage.saveCustomers(customers.value);
      }
    }
  }

  showPayment.value = false;
  showSuccess.value = true;
  customerPhone.value = "";
  foundCustomer.value = undefined;
  usePoints.value = false;

  setTimeout(() => {
    showSuccess.value = false;
  }, 2000);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}
</script>

<style scoped>
.employee-pos-wrapper {
  display: flex;
  height: 100%;
  gap: 0;
}

.pos-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.pos-filters {
  margin-bottom: 12px;
}

.pos-search {
  width: 100%;
  padding: 10px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.pos-search:focus {
  border-color: #667eea;
}

.category-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-tab {
  padding: 6px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.cat-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: transparent;
}

.pos-products {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  overflow-y: auto;
  padding: 4px;
  align-content: start;
}

.pos-product-card {
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
}

.pos-product-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.pos-product-card.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-info .product-name {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.3;
}

.product-info .product-price {
  font-size: 13px;
  font-weight: 700;
  color: #16a34a;
}

.cart-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.unavailable-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
}

.pos-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.pos-pagination button {
  width: 32px;
  height: 32px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.pos-pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pos-pagination span {
  font-size: 13px;
  color: #666;
}

.pos-right {
  width: 380px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.order-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.btn-clear {
  padding: 4px 12px;
  border: 1px solid #ef4444;
  border-radius: 6px;
  background: #fff;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
}

.customer-lookup {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.lookup-row {
  display: flex;
  gap: 8px;
}

.lookup-input {
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.lookup-input:focus {
  border-color: #667eea;
}

.btn-new-customer {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.customer-found {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 8px;
}

.customer-found .customer-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #d97706;
}

.customer-found .customer-points {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
}

.btn-use-points {
  padding: 4px 10px;
  border: 1px solid #d97706;
  border-radius: 6px;
  background: #fff;
  color: #d97706;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.new-customer-form {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-save-customer {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #22c55e;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.order-items {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

.order-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.item-details .item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
}

.item-details .item-unit-price {
  font-size: 12px;
  color: #999;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-value {
  font-size: 14px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.btn-remove-item {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: #fee2e2;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-subtotal {
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
  margin-top: 4px;
}

.empty-order {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.empty-order span {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.empty-order p {
  font-size: 14px;
  margin: 0;
}

.order-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}

.discount-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
  color: #dc2626;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.total-value {
  color: #16a34a;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 8px;
}

.btn-checkout:hover {
  transform: translateY(-1px);
}

.btn-checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  cursor: pointer;
}

.success-content {
  background: #fff;
  border-radius: 20px;
  padding: 48px;
  text-align: center;
}

.success-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.success-content h3 {
  font-size: 22px;
  font-weight: 700;
  color: #16a34a;
  margin: 0 0 8px;
}

.success-content p {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>
