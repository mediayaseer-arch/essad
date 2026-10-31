<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sendPresenceHeartbeat } from './api';

const route = useRoute();
const router = useRouter();
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

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
  syncPresenceAndCheckRedirect(route.path);
  heartbeatInterval = setInterval(() => {
    syncPresenceAndCheckRedirect(route.path);
  }, 1500);
});

onUnmounted(() => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
});
</script>

<template>
  <router-view />
</template>
