<template>
  <header>
    <div class="nav-wrapper">
      <div class="logo-container">
        <img class="logo" src="https://i.imgur.com/gea725J.png" alt="Logo" />
      </div>
      <nav>
        <input class="hidden" type="checkbox" id="menuToggle" />
        <label class="menu-btn" for="menuToggle">
          <div class="menu"></div>
          <div class="menu"></div>
          <div class="menu"></div>
        </label>
        <div class="nav-container">
          <ul class="nav-tabs" style="font-size: 13px !important;">
            
            <li class="nav-tab" v-if="user == 'admin'"><a href="/quanly/danhsachmay" style="color: black;"> Danh sách máy</a></li>
            <li class="nav-tab" v-else><a href="/trangchu" style="color: black;"> Trang chủ</a></li>
            <li class="nav-tab"><a href="/lichsughinhan" style="color: black;">Lưu trữ</a></li>
            <!-- <li class="d-flex align-items-center">
              <div class="avatar">{{ userAvatar }}</div>
              {{ user }}
            </li> -->
            <li class="d-flex align-items-center user-menu">
              <div class="avatar">{{ userAvatar }}</div>
              {{ user }}
              <ul class="dropdown">
                <!-- <li @click="showInfo">Thông tin</li> -->
                <li @click="logout">Đăng xuất</li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
import { domainIP } from '@/js/apiVue';

export default {
  data() { 
    return {
      user: "",
    };
  },
  mounted() {
    const storedUser = localStorage.getItem("user");
    
    const parsedUser = JSON.parse(storedUser);
    this.user = parsedUser.user;
    this.userAvatar = this.user.charAt(0).toUpperCase();
  },
  methods: {
    async logout() {
      try {
        const response = await fetch('http://'+domainIP+':3000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: this.user,
          }),
        });

        if (response.ok) {
          console.log('Đăng xuất thành công');
          localStorage.removeItem("user")
          this.$router.push('/'); 
        } else {
          console.error('Lỗi khi đăng xuất');
        }
      } catch (error) {
        console.error('Lỗi khi gọi API đăng xuất:', error);
      }
    },
  
  }
};
</script>
<style scoped>

body {
  font-family: "Roboto", sans-serif;
  
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 14px !important;
}

h1 {
  margin: 20px 0;
  color: #fff;
}

.center {
  text-align: center;
}
.avatar {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
  margin-left: 10px;
}
.user-menu {
  position: relative;
}

.user-menu:hover .dropdown {
  display: block;
}

.dropdown {
  display: none;
  position: absolute;
  top: 40px; /* Adjust depending on the height of your header */
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 10px 0;
  z-index: 1000;
}

.dropdown li {
  padding: 10px 10px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: #f0f0f0;
}
.nav-wrapper {
  display: flex;
  position: relative;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  margin: auto;
  width: 90%;
  height: 80px;
  border-radius: 0 0 15px 15px;
  padding: 0 25px;
  z-index: 2;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 60px;
}

.nav-tabs {
  display: flex;
  font-weight: 600;
  font-size: 18px;
  list-style: none;
}

.nav-tab:not(:last-child) {
  padding: 10px 25px;
  margin: 0;
  border-right: 1px solid #eee;
}

.nav-tab:last-child {
  padding: 10px 0 0 25px;
}

.nav-tab,
.menu-btn {
  cursor: pointer;
}

.hidden {
  display: none;
}

@media screen and (max-width: 800px) {
  .nav-container {
    position: fixed;
    display: none;
    overflow-y: auto;
    z-index: -1;
    top: 0;
    right: 0;
    width: 280px;
    height: 100%;
    background: #fff;
    box-shadow: -1px 0 2px rgba(0, 0, 0, 0.2);
  }

  .nav-tabs {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 80px;
    width: 100%;
  }

  .nav-tab:not(:last-child) {
    padding: 20px 25px;
    margin: 0;
    border-right: unset;
    border-bottom: 1px solid #f5f5f5;
  }

  .nav-tab:last-child {
    padding: 15px 25px;
  }

  .menu-btn[data-v-568d5a6f] {
        position: relative;
        display: block;
        margin: 0;
        width: 20px;
        height: 30px;
        cursor: pointer;
        z-index: 2;
        padding: 10px;
        background: #9e9898;
        color: black;
        border-radius: 10px;
  }
  .menu-btn .menu {
    display: block;
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: #111;
  }

  .menu-btn .menu:nth-child(2) {
    margin-top: 4px;
    opacity: 1;
  }

  .menu-btn .menu:nth-child(3) {
    margin-top: 4px;
  }

  #menuToggle:checked + .menu-btn .menu {
    transition: transform 0.2s ease;
  }

  #menuToggle:checked + .menu-btn .menu:nth-child(1) {
    transform: translate3d(0, 6px, 0) rotate(45deg);
  }

  #menuToggle:checked + .menu-btn .menu:nth-child(2) {
    transform: rotate(-45deg) translate3d(-5.71429px, -6px, 0);
    opacity: 0;
  }

  #menuToggle:checked + .menu-btn .menu:nth-child(3) {
    transform: translate3d(0, -6px, 0) rotate(-45deg);
  }

  #menuToggle:checked ~ .nav-container {
    z-index: 1;
    display: flex;
    animation: menu-slide-left 0.3s ease;
  }
  @keyframes menu-slide-left {
    0% {
      transform: translateX(200px);
    }
    to {
      transform: translateX(0);
    }
  }
}
</style>