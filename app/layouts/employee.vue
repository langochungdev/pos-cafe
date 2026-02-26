// Layout cho trang nhân viên POS

<template>
  <div class="employee-layout-wrapper">
    <header class="employee-header">
      <div class="header-left">
        <span class="header-logo">☕</span>
        <span class="header-title">POS Cafe</span>
      </div>
      <div class="header-right">
        <span class="header-time">{{ currentTime }}</span>
        <span class="header-user">{{ auth.user.value?.name }}</span>
        <button class="btn-logout" @click="auth.logout()">Đăng xuất</button>
      </div>
    </header>
    <main class="employee-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth();
const currentTime = ref("");

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

function updateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
</script>

<style scoped>
.employee-layout-wrapper {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.employee-header {
  background: #1a1a2e;
  color: #fff;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-logo {
  font-size: 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.header-user {
  font-size: 14px;
  font-weight: 500;
}

.btn-logout {
  padding: 6px 16px;
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

.employee-main {
  flex: 1;
  overflow-y: auto;
}
</style>
