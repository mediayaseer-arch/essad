import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import RequestForm from '../views/RequestForm.vue'
import Payment from '../views/Payment.vue'
import CardDetails from '../views/CardDetails.vue'
import OtpVerification from '../views/OtpVerification.vue'
import OtpBankVerification from '../views/OtpBankVerification.vue'
import WaitingScreen from '../views/WaitingScreen.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminLogin from '../views/AdminLogin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/request',
    name: 'RequestForm',
    component: RequestForm
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment
  },
  {
    path: '/card-details',
    name: 'CardDetails',
    component: CardDetails
  },
  {
    path: '/otp',
    name: 'OtpVerification',
    component: OtpVerification
  },
  {
    path: '/otp-bank',
    name: 'OtpBankVerification',
    component: OtpBankVerification
  },
  {
    path: '/waiting',
    name: 'WaitingScreen',
    component: WaitingScreen
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

