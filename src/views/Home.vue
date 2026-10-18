<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plane, Building, ShoppingBag, HeartPulse, Film, Utensils } from 'lucide-vue-next'

const router = useRouter()

const navigateToForm = () => {
  router.push('/request')
}
</script>

<template>
  <div class="max-w-xl mx-auto bg-[#f8f9fa] min-h-screen flex flex-col font-sans">
    
    <!-- Infographic Banner -->
    <div class="w-full bg-white pb-2 shadow-sm">
      <img src="@/src/assets/images/fazaa_main_header_1781321341301.jpg" alt="Fazaa Memberships" class="w-full h-auto object-cover" referrerPolicy="no-referrer" />
    </div>

    <!-- Buttons Section -->
    <div class="px-6 py-10 pb-12 bg-gray-50 relative border-t border-gray-200">
      <div class="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
      <h3 class="text-[#0e4881] text-center font-extrabold text-2xl mb-8 leading-snug px-2 drop-shadow-sm">
        عالم من المزايا الحصرية والخصومات الغير محدودة مع بطاقة فزعة
      </h3>
      
      <div class="space-y-5">
        <button @click="navigateToForm" class="w-full bg-gradient-to-r from-[#c0a850] to-[#a38c36] hover:from-[#ba9e40] hover:to-[#967d2b] transition-all duration-300 text-white font-extrabold text-[22px] py-4 rounded-[1rem] shadow-lg hover:shadow-xl cursor-pointer block transform hover:-translate-y-0.5 border border-yellow-700/30">
          التسجيل في فزعه
        </button>
        <button @click="navigateToForm" class="w-full bg-gradient-to-r from-[#c0a850] to-[#a38c36] hover:from-[#ba9e40] hover:to-[#967d2b] transition-all duration-300 text-white font-extrabold text-[22px] py-4 rounded-[1rem] shadow-lg hover:shadow-xl cursor-pointer block transform hover:-translate-y-0.5 border border-yellow-700/30">
          طلب بطاقة الأسرة
        </button>
        <button @click="navigateToForm" class="w-full bg-gradient-to-r from-[#c0a850] to-[#a38c36] hover:from-[#ba9e40] hover:to-[#967d2b] transition-all duration-300 text-white font-extrabold text-[22px] py-4 rounded-[1rem] shadow-lg hover:shadow-xl cursor-pointer block transform hover:-translate-y-0.5 border border-yellow-700/30">
          طلب بطاقة للمقيمين
        </button>
        <button @click="navigateToForm" class="w-full bg-gradient-to-r from-[#c0a850] to-[#a38c36] hover:from-[#ba9e40] hover:to-[#967d2b] transition-all duration-300 text-white font-extrabold text-[22px] py-4 rounded-[1rem] shadow-lg hover:shadow-xl cursor-pointer block transform hover:-translate-y-0.5 border border-yellow-700/30">
          طلب توصيل بطاقة
        </button>
      </div>
    </div>

    <!-- Bottom Promo Banner (CSS mockup of the FAZAA CARD BENEFITS image) -->
    <div class="bg-[#244265] text-white p-6 relative overflow-hidden">
       <!-- Decorative background patterns -->
       <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></div>
       
       <div class="relative z-10 text-center mb-6">
         <h3 class="text-2xl font-bold text-[#e1ba5c] mb-1">مزايا وعروض بطاقة فزعة</h3>
         <div class="text-sm tracking-widest uppercase text-white opacity-80 font-mono">Fazaa Card Benefits</div>
       </div>

       <div class="relative z-10 grid grid-cols-2 gap-4 text-right mb-6">
          <div class="flex items-center justify-end gap-3 bg-white/10 p-2 rounded-lg">
             <div class="text-xs leading-tight">تسوق ومتاجر<br/><span class="opacity-70 text-[10px]">خصومات في التسوق</span></div>
             <div class="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
               <ShoppingBag class="w-5 h-5 text-yellow-400" />
             </div>
          </div>
          <div class="flex items-center justify-end gap-3 bg-white/10 p-2 rounded-lg">
             <div class="text-xs leading-tight">خصومات السفر<br/><span class="opacity-70 text-[10px]">على تذاكر الطيران</span></div>
             <div class="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center shrink-0">
               <Plane class="w-5 h-5 text-blue-300" />
             </div>
          </div>
          <div class="flex items-center justify-end gap-3 bg-white/10 p-2 rounded-lg">
             <div class="text-xs leading-tight">خدمات صحية<br/><span class="opacity-70 text-[10px]">المستشفيات والعيادات</span></div>
             <div class="w-10 h-10 bg-red-400/20 rounded-full flex items-center justify-center shrink-0">
               <HeartPulse class="w-5 h-5 text-red-400" />
             </div>
          </div>
          <div class="flex items-center justify-end gap-3 bg-white/10 p-2 rounded-lg">
             <div class="text-xs leading-tight">عروض الفنادق<br/><span class="opacity-70 text-[10px]">فنادق ومنتجعات</span></div>
             <div class="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center shrink-0">
               <Building class="w-5 h-5 text-green-300" />
             </div>
          </div>
          <div class="flex items-center justify-end gap-3 bg-white/10 p-2 rounded-lg">
             <div class="text-xs leading-tight">ترفيه وفعاليات<br/><span class="opacity-70 text-[10px]">أماكن ترفيهية</span></div>
             <div class="w-10 h-10 bg-purple-400/20 rounded-full flex items-center justify-center shrink-0">
               <Film class="w-5 h-5 text-purple-300" />
             </div>
          </div>
          <div class="flex items-center justify-end gap-3 bg-white/10 p-2 rounded-lg">
             <div class="text-xs leading-tight">مطاعم وكافيهات<br/><span class="opacity-70 text-[10px]">خصومات المطاعم</span></div>
             <div class="w-10 h-10 bg-orange-400/20 rounded-full flex items-center justify-center shrink-0">
               <Utensils class="w-5 h-5 text-orange-300" />
             </div>
          </div>
       </div>

       <div class="relative z-10 flex justify-center">
          <div class="bg-gradient-to-r from-[#e1ba5c] to-[#b39038] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg border border-yellow-300/50">
             اشترك الآن واستمتع!
          </div>
       </div>
    </div>
  </div>
</template>
