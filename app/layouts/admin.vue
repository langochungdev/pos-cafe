// Layout cho trang quản trị admin

<template>
  <div class="admin-layout-wrapper">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">☕</span>
        <span class="logo-text">POS Cafe</span>
      </div>
      <nav class="sidebar-nav">
        <NuxtLink
          to="/admin"
          class="nav-item"
          :class="{ active: route.path === '/admin' }"
        >
          <span class="nav-icon">📊</span>
          <span>Báo cáo</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/products"
          class="nav-item"
          :class="{ active: route.path === '/admin/products' }"
        >
          <span class="nav-icon">🛍️</span>
          <span>Sản phẩm</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/employees"
          class="nav-item"
          :class="{ active: route.path === '/admin/employees' }"
        >
          <span class="nav-icon">👥</span>
          <span>Nhân viên</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/customers"
          class="nav-item"
          :class="{ active: route.path === '/admin/customers' }"
        >
          <span class="nav-icon">💳</span>
          <span>Khách hàng</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-name">{{ auth.user.value?.name }}</span>
          <span class="user-role">Quản trị viên</span>
        </div>
        <button class="btn-logout" @click="auth.logout()">Đăng xuất</button>
      </div>
    </aside>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const auth = useAuth();
</script>

<style scoped>
.admin-layout-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

.admin-sidebar {
  width: 260px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-logo {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.nav-icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.btn-logout {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.8);
}

.admin-main {
  flex: 1;
  margin-left: 260px;
  padding: 24px;
  overflow-y: auto;
}
</style>
