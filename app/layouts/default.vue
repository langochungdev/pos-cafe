// Layout mặc định cho trang đăng nhập

<template>
  <div class="default-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.default-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
