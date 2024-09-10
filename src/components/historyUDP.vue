<template>
    <div>
      <head-test-udp></head-test-udp>
      <div>
        <div>
          Chọn 1 ngày 
          <select v-model="selectedKey" @change="selectKey(selectedKey)">
            <option value="" disabled>-- Chọn một ngày --</option>
            <option v-for="(key, index) in keys" :key="index" :value="key">{{ key }}</option>
          </select>
          <button v-if="selectedKey" @click="exportToExcel">Tải Dữ Liệu Excel</button>
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
import headTestUdp from '@/components/headTestUdp.vue';
import * as XLSX from 'xlsx';

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
          { label: "Data 1", data: [], borderColor: "blue", backgroundColor: "rgba(0, 0, 255, 0.2)", fill: false },
          { label: "Data 2", data: [], borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.2)", fill: false },
          { label: "Data 3", data: [], borderColor: "green", backgroundColor: "rgba(0, 255, 0, 0.2)", fill: false },
          { label: "Data 4", data: [], borderColor: "black", backgroundColor: "rgba(0, 0, 0, 0.2)", fill: false },
        ],
      },
      chartOptions: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Points" } },
          y: { title: { display: true, text: "Value" }, min: 0, max: 100 },
        },
      },
    };
  },
  mounted() {
    this.fetchMessages();
  },
  methods: {
    fetchMessages() {
      const messagesRef = dbRef(database, "messages");
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.keys = Object.keys(data);
        }
      }, { onlyOnce: true });
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
      const labels = [];
      const dataset1 = [];
      const dataset2 = [];
      const dataset3 = [];
      const dataset4 = [];

      this.messages.forEach((item, index) => {
        labels.push(index);
        const values = item.message.split("-").map(Number);
        dataset1.push(values[0] || 0);
        dataset2.push(values[1] || 0);
        dataset3.push(values[2] || 0);
        dataset4.push(values[3] || 0);
      });

      this.chartData.labels = labels;
      this.chartData.datasets[0].data = dataset1;
      this.chartData.datasets[1].data = dataset2;
      this.chartData.datasets[2].data = dataset3;
      this.chartData.datasets[3].data = dataset4;

      this.$nextTick(() => {
        const chartInstance = this.$refs.lineChart?.chart;
        if (chartInstance) {
          chartInstance.update();
        } else {
          console.error("Biểu đồ chưa sẵn sàng.");
        }
      });
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.messages.map((item, index) => ({
        Stt: index + 1,
        IP: item.ip,
        Data: item.message,
        Time: this.formattedTimestamp(item.timestamp),
      })));
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
  