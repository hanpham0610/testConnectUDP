import HistoryUDP from "@/components/historyUDP.vue";
import testConnect from "@/components/testConnect.vue";
import loginVue from "@/components/loginVue.vue";
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: "/",
    name: "login",
    component: loginVue,
  },
    {
      path: "/home",
      name: "home",
      component: testConnect,
    },
    {
      path: "/lichsughinhan",
      name: "HistoryUDP",
      component: HistoryUDP,
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router