<template>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-3">
          <div id="app">
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
                    <td>{{ (index += 1) }}</td>
                  <td>{{ item.ip }}</td>
                  <td>{{ item.message }}</td>
                  <td>{{ formattedTimestamp(item.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button> Lưu</button>
        </div>
        <div class="col-12 col-md-9">
          <line-chart ref="lineChart" :data="chartData" :options="chartOptions"></line-chart>
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
  import { defineComponent } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)
  
  export default defineComponent({
    components: {
      LineChart: Line
    },
    data() {
      return {
        messages: [],
        acceptedIps: [],
        showPopup: false,
        currentIp: '',
        pendingData: null,
        chartData: {
          labels: [], // Minutes
          datasets: [
            {
              label: 'Data 1',
              data: [],
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.2)',
              fill: false,
            },
            {
              label: 'Data 2',
              data: [],
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              fill: false,
            },
            {
              label: 'Data 3',
              data: [],
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              fill: false,
            },
            {
              label: 'Data 4',
              data: [],
              borderColor: 'black',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              fill: false,
            },
          ]
        },
        chartOptions: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Minutes'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Value'
              },
              min: 0,
              max: 100
            }
          }
        }
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.chart = this.$refs.lineChart.chart;
  
        const ws = new WebSocket('ws://localhost:8081');
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (!this.acceptedIps.includes(data.ip)) {
            this.currentIp = data.ip;
            this.pendingData = data;
            this.showPopup = true;
          } else {
            this.messages.push(data);
            this.$nextTick(() => {
              if (this.chart) {
                this.updateChart(data.message);
              }
            });
          }
        };
      });
    },
    methods: {
      updateChart(message) {
        const values = message.split('-').map(Number);
        const now = new Date();
        const minutes = Math.floor(now.getMinutes());
  
        // Kiểm tra xem biểu đồ đã sẵn sàng chưa
        if (!this.chart) {
          console.error("Biểu đồ chưa sẵn sàng.");
          return;
        }
  
        // Sao chép dữ liệu biểu đồ để làm cho nó không phản ứng
        const clonedData = JSON.parse(JSON.stringify(this.chart.data));
  
        // Kiểm tra xem label (minutes) có tồn tại không
        const index = clonedData.labels.indexOf(minutes);
        if (index === -1) {
          clonedData.labels.push(minutes);
          clonedData.datasets.forEach((dataset, i) => {
            dataset.data.push(values[i] || 0);
          });
        } else {
          clonedData.datasets.forEach((dataset, i) => {
            dataset.data[index] = values[i] || 0;
          });
        }
  
        // Cập nhật biểu đồ với dữ liệu đã sao chép
        this.chart.data = clonedData;
        this.chart.update();
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
        this.currentIp = '';
        this.pendingData = null;
      },
      formattedTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }
    }
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
  </style>
  