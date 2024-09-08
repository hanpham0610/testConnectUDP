import testConnect from "@/components/testConnect.vue";
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
   
    {
      path: "/",
      name: "home",
      component: testConnect,
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router