<template>
  <div>
    <head-test-udp></head-test-udp>
    <div class="p-3 container">
      <div class="row" >
        <div class="card" v-for="(item, index) in listUser" :key="index" >
          <div class="imgBx">
            <img src="../img/logo.png" alt="" />
          </div>
          <div class="contentBx">
            <h3>Máy <span> {{ item.code }}</span></h3>
            <!-- <h2 class="price">{{ item.ip }}</h2> -->
            <a :href="'/quanly/may/'+ (index+1)" class="buy">Xem</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
    
    
    <script>
import headTestUdp from "@/components/headTestUdp.vue";
import axios from "axios";
import { domainIP } from "@/js/apiVue";

export default {
  components: { headTestUdp },
  data() {
    return {
      code: "",
      ipMay: "",
      ip: "http://" + domainIP + ":3000",
      listUser: [],
    };
  },
  mounted() {
    this.fetchMessages();
  },
  methods: {
    async fetchMessages() {
      try {
        const response = await axios.get(this.ip + "/api/getuser");
        console.log('response', response.data);
        
        // var localUser = localStorage.getItem("user");
        // localUser = JSON.parse(localUser);
        this.listUser =  response.data.filter(user => user.user.startsWith("userQuanLy"));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    },
  },
};
</script>
  
    
    <style scoped>



.card {
  position: relative;
  width: 250px;
  height: 310px;
  margin-left: 10px;
  background: #122936;
  border-radius: 20px;
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  -ms-border-radius: 20px;
  -o-border-radius: 20px;
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  top: -50%;
  width: 100%;
  height: 100%;
  background: #021b51;
  transform: skewY(345deg);
  -webkit-transform: skewY(345deg);
  -moz-transform: skewY(345deg);
  -ms-transform: skewY(345deg);
  -o-transform: skewY(345deg);
  transition: 0.5s;
  -webkit-transition: 0.5s;
  -moz-transition: 0.5s;
  -ms-transition: 0.5s;
  -o-transition: 0.5s;
}

.card:hover::before {
  top: -70%;
  transform: skewY(390deg);
  -webkit-transform: skewY(390deg);
  -moz-transform: skewY(390deg);
  -ms-transform: skewY(390deg);
  -o-transform: skewY(390deg);
}

.card::after {
  content: "Phillips";
  position: absolute;
  bottom: 0;
  left: 0;
  font-weight: 600;
  font-size: 8em;
  color: rgba(0, 0, 0, 0.1);
}
.card .imgBx {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
  z-index: 1;
}
.card .imgBx img {
  max-width: 90%;
  transition: 0.5s;
  -webkit-transition: 0.5s;
  -moz-transition: 0.5s;
  -ms-transition: 0.5s;
  -o-transition: 0.5s;
}
.card:hover .imgBx img {
  max-width: 50%;
}
.card .contentBx {
  position: relative;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1;
}
.card .contentBx h3 {
  font-size: 18px;
  color: #fff;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.card .contentBx h3 span {
  color: #bb9340;
}
.card .contentBx .price {
  font-size: 24px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 1px;
}
.card .contentBx .buy {
  position: relative;
  top: 200px;
  opacity: 0;
  padding: 10px 30px;
  margin-top: 15px;
  color: #fff;
  font-weight: bold;
  text-decoration: none;
  background: #bb9340;
  border-radius: 30px;
  -webkit-border-radius: 30px;
  -moz-border-radius: 30px;
  -ms-border-radius: 30px;
  -o-border-radius: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: 0.5;
  -webkit-transition: 0.5;
  -moz-transition: 0.5;
  -ms-transition: 0.5;
  -o-transition: 0.5;
}
.card .contentBx .buy:hover {
  background-color: #9c7a35;
}
.card:hover .contentBx .buy {
  top: 0;
  opacity: 1;
}
</style>
    