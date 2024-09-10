import HistoryUDP from "@/components/historyUDP.vue";
import testConnect from "@/components/testConnect.vue";
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
   
    {
      path: "/",
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