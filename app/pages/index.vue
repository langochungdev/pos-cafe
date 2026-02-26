// Trang đăng nhập hệ thống POS Cafe

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <span class="login-logo">☕</span>
        <h1>POS Cafe</h1>
        <p>Đăng nhập để tiếp tục</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="name">Họ tên</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Nhập họ tên..."
            required
          />
        </div>
        <div class="form-group">
          <label for="phone">Số điện thoại</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="Nhập số điện thoại..."
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Nhập mật khẩu..."
            required
          />
        </div>
        <div class="form-group">
          <label>Vai trò</label>
          <div class="role-selector">
            <button
              type="button"
              class="role-btn"
              :class="{ active: form.role === 'admin' }"
              @click="form.role = 'admin'"
            >
              <span>👑</span> Quản trị
            </button>
            <button
              type="button"
              class="role-btn"
              :class="{ active: form.role === 'employee' }"
              @click="form.role = 'employee'"
            >
              <span>👤</span> Nhân viên
            </button>
          </div>
        </div>
        <button type="submit" class="btn-login">Đăng nhập</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosStorage } from "~/composables/usePosStorage";

definePageMeta({ layout: "default" });

const auth = useAuth();
const storage = usePosStorage();

const form = reactive({
  name: "",
  phone: "",
  password: "",
  role: "employee" as "admin" | "employee",
});

onMounted(() => {
  storage.initializeData();
  auth.init();
  if (auth.isLoggedIn()) {
    navigateTo(auth.isAdmin() ? "/admin" : "/employee");
  }
});

function handleLogin() {
  auth.login(form.name, form.phone, form.role);
  navigateTo(form.role === "admin" ? "/admin" : "/employee");
}
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 12px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: #667eea;
}

.role-selector {
  display: flex;
  gap: 12px;
}

.role-btn {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.role-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  color: #667eea;
}

.btn-login {
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
</style>
