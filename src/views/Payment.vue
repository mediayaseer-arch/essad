<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ChevronLeft } from 'lucide-vue-next';

const router = useRouter();

const goNext = () => {
  router.push('/card-details');
};
</script>

<template>
  <div class="max-w-xl mx-auto bg-gray-50 min-h-screen flex flex-col items-center pt-10 px-6 font-sans border-x border-gray-200 shadow-2xl relative overflow-hidden">
    
    <!-- Decorative Accents -->
    <div class="absolute -top-[150px] -right-[150px] w-[300px] h-[300px] bg-red-500 opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-[20%] -left-[100px] w-[250px] h-[250px] bg-blue-500 opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header Logo -->
    <div class="mb-10 w-full flex justify-center relative z-10">
      <!-- Network Pay Text Logo mockup -->
      <div class="font-bold text-[40px] flex items-center tracking-tight drop-shadow-sm">
        <span class="text-[#005596]">network</span>
        <span class="text-[#cf1c4a]">pay</span>
        <span class="text-[#cf1c4a] ml-[2px] text-3xl font-medium">></span>
      </div>
    </div>

    <!-- Title -->
    <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3.5 px-8 text-center text-xl mb-8 w-full max-w-sm rounded-xl shadow-lg border border-gray-700 relative z-10 tracking-wide font-medium">
      دفع رسوم طلب البطاقة
    </div>

    <!-- Fees Box -->
    <div class="bg-gradient-to-b from-gray-800 to-gray-900 text-white w-full max-w-sm rounded-2xl relative mt-5 mb-8 shadow-xl border border-gray-700 z-10 overflow-visible">
      
      <!-- Overlapping Tab -->
      <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 px-12 py-1.5 font-bold text-lg rounded-t-xl rounded-b-md shadow-md border border-gray-300 backdrop-blur-sm z-20">
        الرسوم
      </div>

      <div class="pt-10 pb-6 px-7 space-y-5">
        <!-- Row 1 -->
        <div class="flex justify-between items-center text-[17px]">
          <div class="text-right flex-1 text-gray-300">رسوم لتأكيد الطلب</div>
          <div class="text-left w-24 font-medium">1 درهم</div>
        </div>
        
        <div class="h-px w-full bg-gray-700/50"></div>
        
        <!-- Row 2 -->
        <div class="flex justify-between items-center text-[17px]">
          <div class="text-right flex-1 text-gray-300">رسوم إضافية</div>
          <div class="text-left w-24 font-medium">0 درهم</div>
        </div>
        
        <div class="h-px w-full bg-gray-700/50"></div>

        <!-- Row 3 - Total -->
        <div class="flex justify-between items-center text-[19px] pt-1">
          <div class="text-right flex-1 font-bold text-white">المجموع</div>
          <div class="text-left w-24 font-bold text-green-400">1 درهم</div>
        </div>
      </div>
    </div>

    <!-- Cards Banner -->
    <div class="bg-white text-gray-800 w-full max-w-sm flex items-center justify-between p-2.5 rounded-xl mb-8 border border-gray-200 shadow-md relative z-10">
      <div class="text-right pr-4 font-bold flex-1 text-gray-700 tracking-wide">
        الدفع عبر البطاقة
      </div>
      <div class="bg-gray-50/50 p-1 rounded-lg flex items-center gap-1.5 ring-1 ring-gray-100 inset-0">
        <!-- Mocking logos -->
        <div class="w-[34px] h-[22px] bg-gradient-to-br from-blue-500 to-blue-700 text-[5px] text-white font-bold flex items-center justify-center leading-tight text-center rounded-[3px] shadow-sm transform hover:-translate-y-0.5 transition-transform">AMERICAN<br/>EXPRESS</div>
        <div class="w-[34px] h-[22px] bg-gradient-to-br from-blue-700 to-blue-900 text-[9px] text-white font-bold flex items-center justify-center italic rounded-[3px] shadow-sm transform hover:-translate-y-0.5 transition-transform">VISA</div>
        <div class="w-[34px] h-[22px] bg-white border border-gray-200 flex items-center justify-center relative overflow-hidden rounded-[3px] shadow-sm transform hover:-translate-y-0.5 transition-transform">
          <div class="w-[18px] h-[18px] bg-[#eb001b] rounded-full absolute -left-1.5 opacity-90 mix-blend-multiply"></div>
          <div class="w-[18px] h-[18px] bg-[#f79e1b] rounded-full absolute -right-1.5 opacity-90 mix-blend-multiply"></div>
          <span class="text-[5px] font-bold z-10 text-gray-900 drop-shadow-sm">MasterCard</span>
        </div>
        <div class="w-[42px] h-[22px] bg-white border border-gray-200 flex items-center justify-center relative overflow-hidden text-[6px] font-bold rounded-[3px] shadow-sm transform hover:-translate-y-0.5 transition-transform">
           <div class="flex w-full h-full">
             <div class="w-[55%] flex flex-col justify-center items-center bg-white text-black leading-[1.1]">مدى<br/>mada</div>
             <div class="w-[45%] flex flex-col">
               <div class="h-1/2 bg-green-500 w-full"></div>
               <div class="h-1/2 bg-blue-500 w-full"></div>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <button @click="goNext" class="bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white py-3.5 px-16 rounded-2xl flex items-center justify-center gap-3 mb-12 w-[280px] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 relative z-10 group">
      <span class="font-bold text-2xl tracking-wide">متابعة</span>
      <ChevronLeft class="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
    </button>

    <!-- Footer Text -->
    <div class="text-center max-w-sm px-4 relative z-10 mt-auto pb-10">
      <p class="text-gray-500 font-medium text-sm leading-relaxed mb-5">
        تُقبل البطاقات العالمية والبطاقات الصادرة في دولة الإمارات العربية المتحدة و دول الخليج.
      </p>
      <div class="flex items-center justify-center gap-3 bg-white/60 py-2 px-4 rounded-full border border-gray-200 shadow-sm backdrop-blur-sm">
        <div class="text-[#4568b2] font-bold text-[19px] tracking-tighter italic flex items-center">
          <span class="bg-[#4568b2] text-white px-1 ml-1 rounded-[3px] text-sm not-italic mt-[1px]">PCI</span>
          DSS <span class="text-[#36b3b9] ml-1">CERTIFIED</span>
        </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <div class="text-gray-600 font-medium text-sm">بياناتك الخاصة آمنة</div>
      </div>
    </div>

  </div>
</template>
