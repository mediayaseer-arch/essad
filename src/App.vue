<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { sendPresenceHeartbeat } from './api';

const route = useRoute();
const isMobileDevice = ref(true);
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

const checkDevice = () => {
  isMobileDevice.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

const isAdminRoute = computed(() => route.path.startsWith('/admin'));

watch(
  () => route.path,
  (newPath) => {
    if (!newPath.startsWith('/admin')) {
      sendPresenceHeartbeat(newPath).catch(() => {});
    }
  }
);

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);

  if (!route.path.startsWith('/admin')) {
    sendPresenceHeartbeat(route.path).catch(() => {});
  }
  heartbeatInterval = setInterval(() => {
    if (!route.path.startsWith('/admin')) {
      sendPresenceHeartbeat(route.path).catch(() => {});
    }
  }, 3000);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
  if (heartbeatInterval) clearInterval(heartbeatInterval);
});
</script>

<template>
  <div v-if="!isMobileDevice && !isAdminRoute" class="min-h-screen flex flex-col items-center justify-center bg-white p-4">
    <h1 class="text-5xl font-bold text-gray-800 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-2">Not Found</p>
    <p class="text-gray-500 text-center">The requested URL {{ route.path }} was not found on this server.</p>
  </div>
  <router-view v-else />
</template>
