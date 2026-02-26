// Layout cha cho các trang admin

<template>
  <div class="admin-wrapper">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>

<style scoped>
.admin-wrapper {
  width: 100%;
}
</style>
