<template>
  <div>
    <head-test-udp></head-test-udp>
    <div class="p-3">
      <div>
        Danh sách đã lưu
        <select v-model="selectedKey" @change="selectKey(selectedKey)">
          <option v-for="(key, index) in keys" :key="index" :value="key">
            {{ formatTime(key.split('_')[1]) }}
          </option>
        </select>
        <button v-if="selectedKey" @click="exportToExcel">
          Tải Dữ Liệu Excel
        </button>
      </div>

      <!-- Details of selected key -->
      <div v-if="selectedKey">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 col-md-3">
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
            </div>
            <div class="col-12 col-md-9">
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
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Points" } },
          y: { title: { display: true, text: "Value" }, min: 0, max: 100 },
        },
        beginAtZero: true,
      },
    };
  },
  mounted() {
    this.fetchMessages();
  },
  methods: {
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
          console.log('data ',data);
          
          if (data) {
            this.keys = Object.keys(data).filter(key => key.startsWith(user.user));
         
            
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
  