import HistoryUDP from "@/components/historyUDP.vue";
import testConnect from "@/components/testConnect.vue";
import testConnectAdmin from "@/components/testConnectAdmin.vue";

import listUser from "@/components/listUser.vue";
import loginVue from "@/components/loginVue.vue";
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: "/",
    name: "login",
    component: loginVue,
  },
    {
      path: "/trangchu",
      name: "home",
      component: testConnect,
    },
    {
      path: "/lichsughinhan",
      name: "HistoryUDP",
      component: HistoryUDP,
    },

    {
      path: "/quanly/danhsachmay",
      name: "listuser",
      component: listUser,
    },
    {
      path: "/quanly/may/:id",
      name: "may",
      component: testConnectAdmin,
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router