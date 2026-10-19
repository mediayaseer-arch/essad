<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sendPresenceHeartbeat } from './api';

const route = useRoute();
const router = useRouter();
const isMobileDevice = ref(true);
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

const checkDevice = () => {
  isMobileDevice.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

const isAdminRoute = computed(() => route.path.startsWith('/admin'));

const syncPresenceAndCheckRedirect = async (path: string) => {
  if (path.startsWith('/admin')) return;
  try {
    const res = await sendPresenceHeartbeat(path);
    if (res.redirectTo && res.redirectTo !== route.path) {
      router.push(res.redirectTo);
    }
  } catch {}
};

watch(
  () => route.path,
  (newPath) => {
    syncPresenceAndCheckRedirect(newPath);
  }
);

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);

  syncPresenceAndCheckRedirect(route.path);
  heartbeatInterval = setInterval(() => {
    syncPresenceAndCheckRedirect(route.path);
  }, 1500);
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
