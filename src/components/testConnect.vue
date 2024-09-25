<template>
  <head-test-udp> </head-test-udp>

  <div class="container-fluid mt-2 p-5">
    <div class="row d-flex justify-content-center">
      <div
        class="col-12 col-md-3"
        style="background: white; border-radius: 10px"
      >
        <table class="table table-striped table-hover">
          <thead>
            <tr style="font-size: 13px">
              <th><strong>Stt</strong></th>
              <th><strong>IP</strong></th>
              <th><strong>Data</strong></th>
              <th><strong>Time</strong></th>
            </tr>
          </thead>
        </table>

        <!-- Div bao quanh tbody để tạo scroll -->
        <div style="height: 600px; overflow-y: auto">
          <table class="table table-striped table-hover">
            <tbody>
              <tr v-for="(item, index) in messages" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.ip }}</td>
                <td>{{ item.message }}</td>
                <td>{{ formattedTimestamp(item.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Nút Lưu Dữ Liệu -->
        <!-- <button @click="saveData">Lưu dữ liệu</button> -->
        <div class="w-100 p-3" v-if="user.startsWith('userQuanLy')">
          <button class="rainbow-button" @click="saveData">
            <div class="front">
              <span>Lưu dữ liệu</span>
            </div>
          </button>
        </div>
        <div
          v-if="showNotification"
          class="notification"
          :class="notificationType"
        >
          <p>{{ notificationMessage }}</p>
          <button @click="hideNotification">Đóng</button>
        </div>
      </div>

      <div
        class="col-12 col-md-8 ms-lg-3"
        style="background: white; border-radius: 10px"
      >
        <div class="mb-3 w-25">
          <label for="maxValue">Value:</label>
          <input
            id="maxValue"
            type="number"
            v-model="maxValue"
            @input="updateYScale"
          />
        </div>

        <line-chart
          ref="lineChart"
          :data="chartData"
          :options="chartOptions"
        ></line-chart>
      </div>
    </div>

    <div v-if="showPopup" class="popup">
      <p>
        Bạn có muốn nhận dữ liệu từ máy {{ mayGui }} với IP
        {{ currentIp }} không ?
      </p>
      <button @click="acceptData">Đồng ý</button>
      <button @click="rejectData">Từ chối</button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import axios from "axios";
import { database, ref, set } from "@/js/firebaseConfig";
import headTestUdp from "@/components/headTestUdp.vue";
import { domainIP } from "@/js/apiVue";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

export default defineComponent({
  components: {
    LineChart: Line,
    headTestUdp,
  },
  data() {
    return {
      user: "",
      messages: [],
      acceptedIps: [],
      showPopup: false,
      currentIp: "",
      mayGui: "",
      maxValue: 100,
      pendingData: null,
      pointCounter: 0,
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Data 1",
            data: [],
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)",
            fill: false,
          },
          {
            label: "Data 2",
            data: [],
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            fill: false,
          },
          {
            label: "Data 3",
            data: [],
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            fill: false,
          },
          {
            label: "Data 4",
            data: [],
            borderColor: "black",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            fill: false,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Points" } },
          y: { title: { display: true, text: "Value" }, min: 0, max: 100 },
        },
      },
      showNotification: false,
      notificationMessage: "",
      notificationType: "",
      ip: "http://" + domainIP + ":3000",
    };
  },
  mounted() {
    this.fetchMessages();
    var localUser = localStorage.getItem("user");
    localUser = JSON.parse(localUser);
   
    this.user = localUser.user;
    this.$nextTick(() => {
      this.chart = this.$refs.lineChart.chart;

      const ws = new WebSocket("ws://" + domainIP + ":8081");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        var localUser = localStorage.getItem("user");
        localUser = JSON.parse(localUser);
        console.log("localUser", localUser);
        // Kiểm tra nếu người dùng từ localStorage khớp với người dùng trong dữ liệu nhận được
        if (data.mayGui === localUser.code) {
          // Kiểm tra nếu IP đã được chấp nhận
          // if (this.acceptedIps.includes(data.ip)) {
          this.currentIp = data.ip;
          this.mayGui = data.mayGui;

          this.pendingData = data;
          this.acceptData(); // Tự động gọi hàm acceptData
          // } else {
          //   this.currentIp = data.ip;
          //   this.mayGui = data.mayGui;
          //   this.user = data.user;
          //   this.pendingData = data;
          //   this.showPopup = true; // Hiển thị popup lần đầu
          // }
        } else {
          console.log("Người dùng không khớp, không hiển thị dữ liệu.");
        }
      };
    });
  },

  methods: {
    updateYScale() {
      if (this.chart) {
        this.chart.options.scales.y.max = this.maxValue;

        this.chart.update();
      }
    },
    async fetchMessages() {
      try {
        const response = await axios.get(this.ip + "/api/messages");
        var localUser = localStorage.getItem("user");
        localUser = JSON.parse(localUser);
        this.messages = response.data.filter(
          (message) => message.mayGui === localUser.code
        );
        console.log(" this.messages ", this.messages);
        this.updateChartFromMessages();
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    },
    updateChartFromMessages() {
      this.messages.forEach((data) => this.updateChart(data.message));
    },
    updateChart(message) {
      const values = message.split("-").map(Number);

      if (!this.chart) {
        console.error("Biểu đồ chưa sẵn sàng.");
        return;
      }

      const clonedData = JSON.parse(JSON.stringify(this.chart.data));
      const pointIndex = this.pointCounter++;

      clonedData.labels.push(pointIndex);
      clonedData.datasets.forEach((dataset, i) => {
        dataset.data.push(values[i] || 0);
      });

      this.chart.data = clonedData;
      this.chart.update();
    },
    hideNotification() {
      this.showNotification = false;
    },
    async saveData() {
      try {
        var user = localStorage.getItem("user");
        user = JSON.parse(user);
        console.log("user ", user.user);
        const timestamp = Date.now();
        const newMessagesRef = ref(
          database,
          `messages/${user.user + "_" + timestamp}`
        );
        await set(newMessagesRef, this.messages);
        await axios.delete(this.ip + "/api/messages");
        this.showNotification = true;
        this.notificationMessage = "Dữ liệu đã được lưu thành công!";
        this.notificationType = "success";
        window.location.reload();
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error.message);

        this.showNotification = true;
        this.notificationMessage = `Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`;
        this.notificationType = "error";
      }
    },

    acceptData() {
      console.log("Dữ liệu chờ trước khi chấp nhận:", this.pendingData);

      var localUser = localStorage.getItem("user");
      localUser = JSON.parse(localUser);

      // Kiểm tra nếu user trong pendingData khớp với user trong localStorage
      if (this.pendingData.mayGui === localUser.code) {
        fetch(this.ip + "/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.pendingData),
        })
          .then((response) => {
            if (response.ok) {
              this.acceptedIps.push(this.currentIp); // Thêm IP vào danh sách đã chấp nhận
              this.messages.push(this.pendingData); // Lưu thông điệp mới
              this.updateChart(this.pendingData.message); // Cập nhật biểu đồ
              this.clearPopup(); // Ẩn popup nếu có
            } else {
              console.error("Không thể lưu dữ liệu");
            }
          })
          .catch((error) => {
            console.error("Lỗi khi lưu dữ liệu:", error);
          });
      } else {
        console.log("Người dùng không khớp, không gọi API.");
      }
    },
    rejectData() {
      this.clearPopup();
    },
    clearPopup() {
      this.showPopup = false;
      this.currentIp = "";
    },
    formattedTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
  },
});
</script>

<style>
.rainbow-button {
  background-color: white; /* Màu nền nút */
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: black; /* Màu chữ */
  /* border: 5px solid; */
  border: 10px solid linear-gradient(45deg, green, blue, indigo, violet) 1; /* Bo tròn các góc */
  cursor: pointer;
  transition: transform 0.3s ease;
}

.rainbow-button:hover {
  transform: scale(1.1); /* Phóng to nút khi hover */
}
::-webkit-scrollbar {
  width: 5px;
}
.popup {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid black;
  z-index: 1000;
}

.popup button {
  margin-right: 10px;
}

.notification {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid black;
  z-index: 1000;
}

.notification.success {
  border-color: green;
  color: green;
}

.notification.error {
  border-color: red;
  color: red;
}
</style>
