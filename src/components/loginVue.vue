<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input type="text" v-model="username" placeholder="Username" />
      <input type="password" v-model="password" placeholder="Password" />
      <button type="submit" class="btn btn-primary btn-block btn-large">
        Đăng nhập
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>
  
  <script>
import { domainIP } from "@/js/apiVue";

export default {
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  mounted() {
    localStorage.removeItem("user");
  },
  methods: {
    async login() {
      try {
        const response = await fetch("http://" + domainIP + ":3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: this.username,
            pass: this.password,
            ip: domainIP, // Thêm IP vào đây nếu bạn đã có
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.errorMessage = "Sai tài khoản hoặc mật khẩu.";
          } else if (response.status === 403) {
            this.errorMessage = "Tài khoản đã đăng nhập ở nơi khác.";
          } else {
            this.errorMessage = "Có lỗi xảy ra, vui lòng thử lại.";
          }
        } else {
          const data = await response.json();

          console.log("Đăng nhập thành công:", data);
          localStorage.setItem("user", JSON.stringify(data));
          if(data.user ==="admin"){
            this.$router.push("/quanly/danhsachmay");
          }else{
              this.$router.push("/trangchu");
          }
        
        }
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        this.errorMessage = "Không thể kết nối với máy chủ.";
       
      }
    },
  },
};
</script>
<style scoped>
.error {
  color: red;
}
</style>
