<template>
    <div class="login">
        <h1>Login</h1>
        <form @submit.prevent="login">
            <input type="text" v-model="username" placeholder="Username" />
            <input type="password" v-model="password" placeholder="Password" />
            <button type="submit" class="btn btn-primary btn-block btn-large">Đăng nhập</button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>
    </div>
</template>

<script>
// import { useRouter } from 'vue-router';

export default {
    data() {
        return {
            username: '',
            password: '',
            errorMessage: '',
            jsonTK: [
                { id: "810", user: "admin", pass: "admin123@" },
                { id: "123", user: "userCheck", pass: "user1@" },
                { id: "124", user: "userLog", pass: "user133@" }
            ]
        };
    },
    methods: {
        login() {
            const user = this.jsonTK.find(u => u.user === this.username && u.pass === this.password);
            if (user) {
                if (user.id === "810") {
                    this.$router.push('/home'); 
                    localStorage.setItem("user",JSON.stringify(user));
                } else if (user.id === "123") {
                    this.$router.push('/home'); 
                    localStorage.setItem("user",JSON.stringify(user));
                } else if (user.id === "124") {
                    this.$router.push('/lichsughinhan'); 
                    localStorage.setItem("user",JSON.stringify(user));

                } else{
                    alert('Đăng nhập thành công!');
                }
            } else {
                this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.';
            }
        }
    }
}
</script>

<style scoped>
.error {
    color: red;
}
</style>
