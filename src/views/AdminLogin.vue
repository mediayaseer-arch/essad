<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { adminLoginApi } from '../api';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const email = ref('');
const password = ref('');

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'الرجاء إدخال البريد الإلكتروني وكلمة المرور';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    await adminLoginApi(email.value, password.value);
    router.push('/admin');
  } catch (err: any) {
    error.value = err.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#eef5f0] flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
    <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/80 w-full max-w-md text-center">
      
      <div class="mb-5 w-full flex justify-center">
        <!-- Esaad Logo -->
        <div class="flex flex-col items-center bg-[#040c06] px-5 py-2.5 rounded-2xl shadow-md border border-[#009a44]/40">
          <div class="text-[#39b54a] font-black text-xl leading-none tracking-tight">إسعاد</div>
          <div class="text-[#39b54a] font-extrabold text-base leading-none -mt-0.5 tracking-tight">esaad</div>
          <svg class="w-12 h-3.5 -mt-0.5" viewBox="0 0 60 18" fill="none">
            <circle cx="14" cy="4" r="2" fill="#39b54a" />
            <circle cx="46" cy="4" r="2" fill="#39b54a" />
            <path d="M 6 6 Q 30 18 54 6" stroke="#39b54a" stroke-width="3.2" stroke-linecap="round" fill="none" />
          </svg>
        </div>
      </div>

      <h1 class="text-lg font-extrabold text-gray-900 mb-1.5">تسجيل دخول إدارة إسعاد</h1>
      <p class="text-gray-600 text-xs mb-6">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>

      <div v-if="error" class="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs mb-5 font-medium">
        {{ error }}
      </div>

      <form @submit.prevent="login" class="space-y-4 text-right">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
          <input 
            v-model="email" 
            type="email" 
            dir="ltr"
            class="w-full border-gray-300 border rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009a44] focus:border-transparent transition-all"
            placeholder="admin@esaad.ae"
          />
        </div>
        
        <div class="mb-5">
          <label class="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
          <input 
            v-model="password" 
            type="password" 
            dir="ltr"
            class="w-full border-gray-300 border rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009a44] focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-2 bg-[#008a40] text-white hover:bg-[#007335] transition-colors py-3 px-4 rounded-xl font-bold text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else>تسجيل الدخول</span>
        </button>
      </form>

    </div>
  </div>
</template>
