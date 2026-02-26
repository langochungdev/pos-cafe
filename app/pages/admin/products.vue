// Trang quản lý sản phẩm CRUD với phân trang và bộ lọc

<template>
  <div class="admin-products-wrapper">
    <div class="page-header">
      <h2 class="page-title">Quản lý sản phẩm</h2>
      <button class="btn-add" @click="openModal()">+ Thêm sản phẩm</button>
    </div>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="🔍 Tìm kiếm sản phẩm..."
      />
      <select v-model="selectedCategory" class="filter-select">
        <option value="">Tất cả danh mục</option>
        <option v-for="cat in PRODUCT_CATEGORIES" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td>
              <img
                :src="product.image"
                :alt="product.name"
                class="product-thumb"
              />
            </td>
            <td>
              <div class="product-name">{{ product.name }}</div>
              <div class="product-desc">{{ product.description }}</div>
            </td>
            <td>
              <span class="category-badge">{{ product.category }}</span>
            </td>
            <td class="product-price">{{ formatCurrency(product.price) }}</td>
            <td>
              <span
                class="status-badge"
                :class="product.isAvailable ? 'available' : 'unavailable'"
              >
                {{ product.isAvailable ? "Còn hàng" : "Hết hàng" }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-edit" @click="openModal(product)">✏️</button>
                <button class="btn-toggle" @click="toggleAvailability(product)">
                  {{ product.isAvailable ? "🚫" : "✅" }}
                </button>
                <button class="btn-delete" @click="handleDelete(product.id)">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="setPage(currentPage - 1)"
      >
        ←
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="setPage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="setPage(currentPage + 1)"
      >
        →
      </button>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>
          {{ editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới" }}
        </h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Tên sản phẩm</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Giá (VND)</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                required
              />
            </div>
            <div class="form-group">
              <label>Danh mục</label>
              <select v-model="form.category" required>
                <option
                  v-for="cat in PRODUCT_CATEGORIES"
                  :key="cat"
                  :value="cat"
                >
                  {{ cat }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Mô tả</label>
            <input v-model="form.description" type="text" />
          </div>
          <div class="form-group">
            <label>URL hình ảnh</label>
            <input v-model="form.image" type="text" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Hủy
            </button>
            <button type="submit" class="btn-submit">
              {{ editingProduct ? "Cập nhật" : "Thêm mới" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import { PRODUCT_CATEGORIES } from "~/types";

const {
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  paginatedProducts,
  load,
  addProduct,
  updateProduct,
  deleteProduct,
  setPage,
} = useProducts();

const showModal = ref(false);
const editingProduct = ref<Product | null>(null);

const form = reactive({
  name: "",
  price: 0,
  category: "Cà phê" as string,
  description: "",
  image:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop",
  isAvailable: true,
});

onMounted(() => {
  load();
});

function openModal(product?: Product) {
  if (product) {
    editingProduct.value = product;
    form.name = product.name;
    form.price = product.price;
    form.category = product.category;
    form.description = product.description;
    form.image = product.image;
    form.isAvailable = product.isAvailable;
  } else {
    editingProduct.value = null;
    form.name = "";
    form.price = 0;
    form.category = "Cà phê";
    form.description = "";
    form.image =
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop";
    form.isAvailable = true;
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingProduct.value = null;
}

function handleSubmit() {
  if (editingProduct.value) {
    updateProduct(editingProduct.value.id, { ...form });
  } else {
    addProduct({ ...form });
  }
  closeModal();
}

function handleDelete(id: string) {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    deleteProduct(id);
  }
}

function toggleAvailability(product: Product) {
  updateProduct(product.id, { isAvailable: !product.isAvailable });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}
</script>

<style scoped>
.admin-products-wrapper {
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
  transition: transform 0.2s;
}

.btn-add:hover {
  transform: translateY(-1px);
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #667eea;
}

.filter-select {
  padding: 10px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  min-width: 180px;
}

.products-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 600;
  color: #666;
  background: #fafafa;
}

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.product-name {
  font-weight: 600;
  color: #1a1a2e;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.category-badge {
  padding: 3px 10px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.product-price {
  font-weight: 600;
  color: #16a34a;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.available {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.unavailable {
  background: #fee2e2;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 6px;
}

.actions button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-edit {
  background: #dbeafe;
}
.btn-edit:hover {
  background: #bfdbfe;
}
.btn-toggle {
  background: #fef3c7;
}
.btn-toggle:hover {
  background: #fde68a;
}
.btn-delete {
  background: #fee2e2;
}
.btn-delete:hover {
  background: #fecaca;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: transparent;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  width: 480px;
  max-height: 90vh;
  overflow-y: auto;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
