// Layout cha cho các trang nhân viên

<template>
  <div class="employee-parent-wrapper">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "employee" });
</script>

<style scoped>
.employee-parent-wrapper {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
