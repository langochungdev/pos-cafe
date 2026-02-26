// Trang quản lý khách hàng và chương trình tích điểm

<template>
  <div class="admin-customers-wrapper">
    <div class="page-header">
      <h2 class="page-title">Quản lý khách hàng</h2>
      <button class="btn-add" @click="openModal()">+ Thêm khách hàng</button>
    </div>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="🔍 Tìm theo tên hoặc số điện thoại..."
      />
    </div>

    <div class="customers-grid">
      <div
        v-for="customer in filteredCustomers"
        :key="customer.id"
        class="customer-card"
      >
        <div class="card-header">
          <div class="customer-avatar">{{ customer.name.charAt(0) }}</div>
          <div class="customer-main">
            <div class="customer-name">{{ customer.name }}</div>
            <div class="customer-phone">📱 {{ customer.phone }}</div>
          </div>
          <div class="card-actions">
            <button class="btn-icon" @click="openModal(customer)">✏️</button>
            <button class="btn-icon delete" @click="handleDelete(customer.id)">
              🗑️
            </button>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat">
            <span class="stat-value">{{ customer.points }}</span>
            <span class="stat-label">Điểm tích lũy</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{
              formatCurrency(customer.totalSpent)
            }}</span>
            <span class="stat-label">Tổng chi tiêu</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ customer.visitCount }}</span>
            <span class="stat-label">Lần ghé thăm</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="member-since"
            >Thành viên từ {{ formatDate(customer.createdAt) }}</span
          >
          <span class="points-badge">⭐ {{ customer.points }} điểm</span>
        </div>
      </div>
    </div>

    <div v-if="filteredCustomers.length === 0" class="empty-state">
      <span>👥</span>
      <p>Không tìm thấy khách hàng nào</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>
          {{ editingCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng mới" }}
        </h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="form.phone" type="tel" required />
          </div>
          <div v-if="editingCustomer" class="form-group">
            <label>Điểm tích lũy</label>
            <input v-model.number="form.points" type="number" min="0" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Hủy
            </button>
            <button type="submit" class="btn-submit">
              {{ editingCustomer ? "Cập nhật" : "Thêm mới" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Customer } from "~/types";

const { customers, load, addCustomer, updateCustomer, deleteCustomer } =
  useCustomers();

const showModal = ref(false);
const editingCustomer = ref<Customer | null>(null);
const searchQuery = ref("");

const form = reactive({
  name: "",
  phone: "",
  points: 0,
});

onMounted(() => {
  load();
});

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value;
  const q = searchQuery.value.toLowerCase();
  return customers.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
  );
});

function openModal(customer?: Customer) {
  if (customer) {
    editingCustomer.value = customer;
    form.name = customer.name;
    form.phone = customer.phone;
    form.points = customer.points;
  } else {
    editingCustomer.value = null;
    form.name = "";
    form.phone = "";
    form.points = 0;
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingCustomer.value = null;
}

function handleSubmit() {
  if (editingCustomer.value) {
    updateCustomer(editingCustomer.value.id, {
      name: form.name,
      phone: form.phone,
      points: form.points,
    });
  } else {
    addCustomer({ name: form.name, phone: form.phone });
  }
  closeModal();
}

function handleDelete(id: string) {
  if (confirm("Bạn có chắc muốn xóa khách hàng này?")) {
    deleteCustomer(id);
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}
</script>

<style scoped>
.admin-customers-wrapper {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #667eea;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.customer-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.customer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
}

.customer-main {
  flex: 1;
}

.customer-name {
  font-weight: 600;
  font-size: 15px;
  color: #1a1a2e;
}

.customer-phone {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat {
  text-align: center;
}

.stat .stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat .stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}

.member-since {
  font-size: 12px;
  color: #999;
}

.points-badge {
  padding: 4px 10px;
  background: #fef3c7;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #d97706;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #999;
}

.empty-state span {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 420px;
}

.modal h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
