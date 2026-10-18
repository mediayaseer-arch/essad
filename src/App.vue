<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ref as dbRef, onValue, set, push, onDisconnect, increment } from 'firebase/database';
import { rtdb } from './firebase';

const route = useRoute();
const isMobileDevice = ref(true);

const checkDevice = () => {
  isMobileDevice.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

const isAdminRoute = computed(() => route.path.startsWith('/admin'));

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);

  try {
    // 1. Setup online presence
    const connectedRef = dbRef(rtdb, '.info/connected');
    const myPresenceRef = push(dbRef(rtdb, 'presence'));
    
    // Track user specific presence
    let currentUserPresenceRef: any = null;
    let storedReqId: string | null = null;
    
    // Check periodically for changes in localStorage currentRequestId
    setInterval(() => {
      const newReqId = localStorage.getItem('currentRequestId');
      if (newReqId !== storedReqId) {
        
        // Clear previous if exist
        if (currentUserPresenceRef) {
          set(currentUserPresenceRef, null);
          onDisconnect(currentUserPresenceRef).cancel();
          currentUserPresenceRef = null;
        }

        storedReqId = newReqId;
        
        if (storedReqId) {
          currentUserPresenceRef = dbRef(rtdb, `presence_users/${storedReqId}`);
          set(currentUserPresenceRef, true);
          onDisconnect(currentUserPresenceRef).remove();
        }
      }
    }, 1000);

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // When connected, set this device as online
        set(myPresenceRef, true);
        // When disconnected, remove this device
        onDisconnect(myPresenceRef).remove();
        
        // Ensure user presence is also set if they reconnect
        if (storedReqId) {
          if (currentUserPresenceRef) {
             set(currentUserPresenceRef, true);
             onDisconnect(currentUserPresenceRef).remove();
          }
        }
      }
    });

    // 2. Track total unique visits per session
    if (!sessionStorage.getItem('visited')) {
      sessionStorage.setItem('visited', 'true');
      const totalVisitorsRef = dbRef(rtdb, 'stats/totalVisitors');
      set(totalVisitorsRef, increment(1)).catch(e => console.warn('Visitor count error (check DB rules):', e));
    }
  } catch (err) {
    console.warn('Realtime database tracking error:', err);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
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


