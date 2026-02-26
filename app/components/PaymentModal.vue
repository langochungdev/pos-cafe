// Component modal thanh toán với QR Code và tiền mặt

<template>
  <div class="payment-modal-wrapper">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Thanh toán đơn hàng</h3>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <div class="order-summary">
          <div v-for="item in items" :key="item.productId" class="summary-item">
            <span class="item-name"
              >{{ item.productName }} x{{ item.quantity }}</span
            >
            <span class="item-price">{{
              formatCurrency(item.price * item.quantity)
            }}</span>
          </div>
          <div class="summary-divider" />
          <div class="summary-row">
            <span>Tổng cộng</span>
            <span class="total-amount">{{ formatCurrency(total) }}</span>
          </div>
          <div v-if="discount > 0" class="summary-row discount">
            <span>Giảm giá (điểm)</span>
            <span>-{{ formatCurrency(discount) }}</span>
          </div>
          <div class="summary-row final">
            <span>Thanh toán</span>
            <span>{{ formatCurrency(finalTotal) }}</span>
          </div>
        </div>

        <div v-if="customerInfo" class="customer-info-box">
          <span class="customer-badge"
            >⭐ Khách hàng: {{ customerInfo.name }}</span
          >
          <span class="customer-points">{{ customerInfo.points }} điểm</span>
        </div>

        <div class="payment-methods">
          <button
            class="method-btn"
            :class="{ active: selectedMethod === 'cash' }"
            @click="selectedMethod = 'cash'"
          >
            <span class="method-icon">💵</span>
            <span class="method-label">Tiền mặt</span>
          </button>
          <button
            class="method-btn"
            :class="{ active: selectedMethod === 'qr' }"
            @click="selectedMethod = 'qr'"
          >
            <span class="method-icon">📱</span>
            <span class="method-label">QR Code</span>
          </button>
        </div>

        <div v-if="selectedMethod === 'cash'" class="cash-section">
          <div class="form-group">
            <label>Khách đưa</label>
            <input
              v-model.number="cashReceived"
              type="number"
              class="cash-input"
              min="0"
              placeholder="Nhập số tiền..."
            />
          </div>
          <div class="quick-cash">
            <button
              v-for="amount in quickCashAmounts"
              :key="amount"
              @click="cashReceived = amount"
            >
              {{ formatShort(amount) }}
            </button>
          </div>
          <div v-if="cashReceived >= finalTotal" class="change-amount">
            <span>Tiền thừa:</span>
            <span class="change-value">{{
              formatCurrency(cashReceived - finalTotal)
            }}</span>
          </div>
        </div>

        <div v-if="selectedMethod === 'qr'" class="qr-section">
          <div class="qr-placeholder">
            <div class="qr-code">
              <svg viewBox="0 0 200 200" width="180" height="180">
                <rect width="200" height="200" fill="#fff" />
                <g fill="#1a1a2e">
                  <rect x="10" y="10" width="60" height="60" rx="4" />
                  <rect
                    x="20"
                    y="20"
                    width="40"
                    height="40"
                    rx="2"
                    fill="#fff"
                  />
                  <rect x="28" y="28" width="24" height="24" rx="1" />
                  <rect x="130" y="10" width="60" height="60" rx="4" />
                  <rect
                    x="140"
                    y="20"
                    width="40"
                    height="40"
                    rx="2"
                    fill="#fff"
                  />
                  <rect x="148" y="28" width="24" height="24" rx="1" />
                  <rect x="10" y="130" width="60" height="60" rx="4" />
                  <rect
                    x="20"
                    y="140"
                    width="40"
                    height="40"
                    rx="2"
                    fill="#fff"
                  />
                  <rect x="28" y="148" width="24" height="24" rx="1" />
                  <rect x="80" y="10" width="10" height="10" />
                  <rect x="100" y="10" width="10" height="10" />
                  <rect x="80" y="30" width="10" height="10" />
                  <rect x="100" y="40" width="10" height="10" />
                  <rect x="80" y="50" width="30" height="10" />
                  <rect x="80" y="80" width="10" height="10" />
                  <rect x="100" y="80" width="10" height="10" />
                  <rect x="120" y="80" width="10" height="10" />
                  <rect x="140" y="80" width="10" height="10" />
                  <rect x="170" y="80" width="20" height="10" />
                  <rect x="10" y="80" width="10" height="10" />
                  <rect x="30" y="80" width="10" height="10" />
                  <rect x="50" y="80" width="20" height="10" />
                  <rect x="80" y="100" width="10" height="10" />
                  <rect x="110" y="100" width="10" height="10" />
                  <rect x="140" y="100" width="20" height="10" />
                  <rect x="170" y="100" width="20" height="10" />
                  <rect x="80" y="120" width="20" height="10" />
                  <rect x="110" y="120" width="10" height="10" />
                  <rect x="130" y="120" width="10" height="10" />
                  <rect x="160" y="120" width="10" height="10" />
                  <rect x="80" y="140" width="10" height="10" />
                  <rect x="100" y="140" width="10" height="10" />
                  <rect x="130" y="140" width="20" height="10" />
                  <rect x="160" y="140" width="30" height="10" />
                  <rect x="80" y="160" width="30" height="10" />
                  <rect x="120" y="160" width="10" height="10" />
                  <rect x="150" y="160" width="10" height="10" />
                  <rect x="80" y="180" width="10" height="10" />
                  <rect x="100" y="180" width="20" height="10" />
                  <rect x="130" y="180" width="10" height="10" />
                  <rect x="150" y="180" width="10" height="10" />
                  <rect x="170" y="180" width="20" height="10" />
                </g>
              </svg>
            </div>
            <p class="qr-hint">Quét mã QR để thanh toán</p>
            <p class="qr-amount">{{ formatCurrency(finalTotal) }}</p>
          </div>
        </div>

        <button
          class="btn-confirm"
          :disabled="selectedMethod === 'cash' && cashReceived < finalTotal"
          @click="handleConfirm"
        >
          ✅ Xác nhận thanh toán
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderItem, Customer } from "~/types";

const props = defineProps<{
  items: OrderItem[];
  total: number;
  discount: number;
  customerInfo: Customer | null;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [method: "cash" | "qr"];
}>();

const finalTotal = computed(() => props.total - props.discount);

const selectedMethod = ref<"cash" | "qr">("cash");
const cashReceived = ref(0);

const quickCashAmounts = computed(() => {
  const ft = finalTotal.value;
  const amounts = [
    Math.ceil(ft / 10000) * 10000,
    Math.ceil(ft / 50000) * 50000,
    Math.ceil(ft / 100000) * 100000,
    200000,
    500000,
  ];
  return [...new Set(amounts)]
    .filter((a) => a >= ft)
    .sort((a, b) => a - b)
    .slice(0, 4);
});

function handleConfirm() {
  emit("confirm", selectedMethod.value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatShort(value: number): string {
  if (value >= 1000000) return value / 1000000 + "tr";
  if (value >= 1000) return value / 1000 + "k";
  return value.toString();
}
</script>

<style scoped>
.payment-modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 300;
}

.modal-overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-summary {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.item-name {
  color: #333;
}
.item-price {
  font-weight: 500;
}

.summary-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 10px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.summary-row.discount {
  color: #dc2626;
}

.summary-row.final {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-top: 4px;
}

.total-amount {
  font-weight: 600;
}

.customer-info-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fef3c7;
  border-radius: 10px;
  margin-bottom: 16px;
}

.customer-badge {
  font-size: 13px;
  font-weight: 600;
  color: #d97706;
}

.customer-points {
  font-size: 14px;
  font-weight: 700;
  color: #d97706;
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.method-btn {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.method-btn.active {
  border-color: #667eea;
  background: #667eea08;
}

.method-icon {
  font-size: 32px;
}

.method-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.cash-section {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.cash-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  outline: none;
  box-sizing: border-box;
}

.cash-input:focus {
  border-color: #667eea;
}

.quick-cash {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-cash button {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-cash button:hover {
  border-color: #667eea;
  background: #667eea08;
}

.change-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #dcfce7;
  border-radius: 10px;
  font-size: 14px;
}

.change-value {
  font-size: 20px;
  font-weight: 700;
  color: #16a34a;
}

.qr-section {
  margin-bottom: 20px;
}

.qr-placeholder {
  text-align: center;
  padding: 24px;
}

.qr-code {
  display: inline-block;
  padding: 16px;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
}

.qr-hint {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.qr-amount {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin-top: 4px;
}

.btn-confirm {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-confirm:hover {
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
