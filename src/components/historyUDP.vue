<template>
  <div>
    <head-test-udp></head-test-udp>
    <div class="p-3">
      <div
        class="container-fluid p-3"
       
      >
        <div class="row">
          <div class="row d-flex justify-content-center">
            <div class="col-12 col-md-3 ms-lg-3 p-3"    style="background: white; border-bottom-left-radius: 10px ;border-top-left-radius: 10px">
              Danh sách đã lưu
              <select v-model="selectedKey" @change="selectKey(selectedKey)">
                <option v-for="(key, index) in keys" :key="index" :value="key">
                  {{ key.split("_")[0]}} - 
                  {{ formatTime(key.split("_")[1]) }}
                </option>
              </select>
            </div>
            <div
              class="col-12 col-md-8 p-3"
              style="background: white; border-bottom-right-radius: 10px ;border-top-right-radius: 10px"
            >
            <button @click="exportToExcel" style="background-color: green; color: white; border: none; height: 30px; border-radius: 10px;">Tải Dữ Liệu Excel</button>
          </div>
        </div>
        </div>
      </div>

      <!-- Details of selected key -->
      <div >
        <div class="container-fluid mt-3">
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
        </div>
      </div>
    </div>
  </div>
</template>
  
  
  <script>
// eslint-disable-next-line no-unused-vars
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { database } from "@/js/firebaseConfig"; // Điều chỉnh đường dẫn nếu cần
import { Line } from "vue-chartjs";
import headTestUdp from "@/components/headTestUdp.vue";
import * as XLSX from "xlsx";

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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

export default {
  components: { LineChart: Line, headTestUdp },
  data() {
    return {
      keys: [],
      messages: [],
      maxValue: 100,
      selectedKey: null,
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Data 1",
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)",
            fill: false,
            data: [],
          },
          {
            label: "Data 2",
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            fill: false,
            data: [],
          },
          {
            label: "Data 3",
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            fill: false,
            data: [],
          },
          {
            label: "Data 4",
            borderColor: "black",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            fill: false,
            data: [],
          },
        ],
      },
      chartOptions: {
        responsive: true,
        // maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Points" } },
          y: { title: { display: true, text: "Value" }, min: 0, max: 100 },
        },
        // beginAtZero: true,
      },
    };
  },
  mounted() {
    this.fetchMessages();
  },
  methods: {
    updateYScale() {
    // Truy cập đối tượng biểu đồ thông qua $refs và cập nhật trục y
    const chartInstance = this.$refs.lineChart?.chart;
    if (chartInstance) {
      chartInstance.options.scales.y.max = this.maxValue; // Cập nhật max trên trục y
      chartInstance.update(); // Làm mới biểu đồ
    }
  },
    formatTime(time) {
      const date = new Date(parseInt(time, 10));
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); //
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    },
    fetchMessages() {
  var user = localStorage.getItem("user");
  user = JSON.parse(user);
  const messagesRef = dbRef(database, "messages");

  onValue(
    messagesRef,
    (snapshot) => {
      const data = snapshot.val();
      console.log("data ", data);

      if (data) {
        // Check if the user is admin
        if (user.user === 'admin') {
          // Show all keys if the user is admin
          this.keys = Object.keys(data);
        } else {
          // Filter the keys based on the user's name
          this.keys = Object.keys(data).filter((key) =>
            key.startsWith(user.user)
          );
        }
      }
    },
    { onlyOnce: true }
  );
},
    selectKey(key) {
      if (!key) return;
      const messagesRef = dbRef(database, `messages/${key}`);
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.messages = data;
          this.updateChartFromMessages();
        }
      });
    },
    updateChartFromMessages() {
      console.log("Messages to be displayed:", this.messages);

      const labels = [];
      const dataset1 = [];
      const dataset2 = [];
      const dataset3 = [];
      const dataset4 = [];

      this.messages.forEach((item, index) => {
        labels.push(index);
        const values = item.message.split("-").map(Number);
        console.log("Values for index " + index, values);
        dataset1.push(values[0] || 0); // Giá trị cho dataset 1
        dataset2.push(values[1] || 0); // Giá trị cho dataset 2
        dataset3.push(values[2] || 0); // Giá trị cho dataset 3
        dataset4.push(values[3] || 0); // Giá trị cho dataset 4
      });

      const updatedChartData = {
        labels: labels,
        datasets: [
          {
            label: "Data 1",
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)",
            fill: false,
            data: dataset1,
          },
          {
            label: "Data 2",
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            fill: false,
            data: dataset2,
          },
          {
            label: "Data 3",
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            fill: false,
            data: dataset3,
          },
          {
            label: "Data 4",
            borderColor: "black",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            fill: false,
            data: dataset4,
          },
        ],
      };

      this.chartData = updatedChartData;

      this.$nextTick(() => {
        const chartInstance = this.$refs.lineChart?.chart;
        if (chartInstance) {
          console.log(
            "Biểu đồ đã sẵn sàng, cập nhật với dữ liệu:",
            this.chartData
          );
          chartInstance.update();
        } else {
          console.error("Biểu đồ chưa sẵn sàng.");
        }
      });
    },

    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(
        this.messages.map((item, index) => ({
          Stt: index + 1,
          IP: item.ip,
          Data: item.message,
          Time: this.formattedTimestamp(item.timestamp),
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Messages");
      XLSX.writeFile(wb, `messages_${this.selectedKey}.xlsx`);
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
};
</script>

  
  <style scoped>
.key-item {
  cursor: pointer;
  color: blue;
  margin: 5px 0;
}
.key-item:hover {
  text-decoration: underline;
}
</style>
  