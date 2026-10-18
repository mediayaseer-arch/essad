<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/admin');
  } catch (err: any) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      error.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'صيغة البريد الإلكتروني غير صحيحة';
    } else {
      error.value = 'حدث خطأ أثناء تسجيل الدخول: ' + err.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
    <div class="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center">
      
      <div class="mb-8 w-full flex justify-center">
        <!-- Text Logo -->
        <div class="font-bold text-[36px] flex items-center tracking-tight drop-shadow-sm">
          <span class="text-[#005596]">network</span>
          <span class="text-[#cf1c4a]">pay</span>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-2">تسجيل دخول الإدارة</h1>
      <p class="text-gray-500 mb-8">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>

      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium">
        {{ error }}
      </div>

      <form @submit.prevent="login" class="space-y-5 text-right">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input 
            v-model="email" 
            type="email" 
            dir="ltr"
            class="w-full border-gray-300 border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005596] focus:border-transparent transition-all"
            placeholder="admin@example.com"
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <input 
            v-model="password" 
            type="password" 
            dir="ltr"
            class="w-full border-gray-300 border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005596] focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 bg-[#0c2a5c] text-white hover:bg-[#1a3d7a] transition-colors py-3.5 px-4 rounded-xl font-bold font-sans disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <span v-if="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          <span v-else>تسجيل الدخول</span>
        </button>
      </form>

    </div>
  </div>
</template>
