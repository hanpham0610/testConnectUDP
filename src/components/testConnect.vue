<template>
  <head-test-udp> </head-test-udp>

  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-md-3">
        <div >
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th><strong>Stt</strong></th>
                <th><strong>IP</strong></th>
                <th><strong>Data</strong></th>
                <th><strong>Time</strong></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in messages" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.ip }}</td>
                <td>{{ item.message }}</td>
                <td>{{ formattedTimestamp(item.timestamp) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Nút Lưu Dữ Liệu -->
          <button @click="saveData">Lưu dữ liệu</button>

          <!-- Popup thông báo -->
          <div
            v-if="showNotification"
            class="notification"
            :class="notificationType"
          >
            <p>{{ notificationMessage }}</p>
            <button @click="hideNotification">Đóng</button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-9">
        <line-chart
          ref="lineChart"
          :data="chartData"
          :options="chartOptions"
        ></line-chart>
      </div>
    </div>

    <!-- Popup confirmation dialog -->
    <div v-if="showPopup" class="popup">
      <p>Bạn có muốn nhận dữ liệu từ IP {{ currentIp }}?</p>
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
import headTestUdp from '@/components/headTestUdp.vue';
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
   headTestUdp
  },
  data() {
    return {
      messages: [],
      acceptedIps: [],
      showPopup: false,
      currentIp: "",
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
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Points" } },
          y: { title: { display: true, text: "Value" }, min: 0, max: 100 },
        },
      },
      showNotification: false,
      notificationMessage: "",
      notificationType: "",
      ip : 'http://192.168.9.251:3000',
    };
  },
  mounted() {
    this.fetchMessages();
    this.$nextTick(() => {
      this.chart = this.$refs.lineChart.chart;

      const ws = new WebSocket("ws://localhost:8081");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!this.acceptedIps.includes(data.ip)) {
          this.currentIp = data.ip;
          this.pendingData = data;
          this.showPopup = true;
        } else {
          this.messages.push(data);
          this.updateChart(data.message);
        }
      };
    });
  },
  
  methods: {

    async fetchMessages() {
      try {
        const response = await axios.get(this.ip+"/api/messages"
        );
        this.messages = response.data;
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
        const timestamp = Date.now(); // Tạo ID duy nhất bằng timestamp
        const newMessagesRef = ref(database, `messages/${timestamp}`); // Lưu dữ liệu với ID duy nhất
        await set(newMessagesRef, this.messages);
        await axios.delete(this.ip+"/api/messages");
        this.showNotification = true;
        this.notificationMessage = "Dữ liệu đã được lưu thành công!";
        this.notificationType = "success";
        window.location.reload()
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error.message);

        this.showNotification = true;
        this.notificationMessage = `Đã xảy ra lỗi khi lưu dữ liệu: ${error.message}`;
        this.notificationType = "error";
      }
    },

    acceptData() {
      this.acceptedIps.push(this.currentIp);
      this.messages.push(this.pendingData);
      this.updateChart(this.pendingData.message);
      this.clearPopup();
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
