<template>
    <div>
      <line-chart v-if="chartData && chartData.labels.length" :chart-data="chartData" :options="chartOptions"></line-chart>
    </div>
  </template>
  
  <script>
  import { Line } from 'vue-chartjs';
  import { Chart, registerables } from 'chart.js';
  
  Chart.register(...registerables);
  
  export default {
    components: {
      'line-chart': Line
    },
    data() {
      return {
        chartData: {
          labels: [], // Sẽ chứa các giá trị thời gian (phút)
          datasets: [
            {
              label: 'Value 1',
              borderColor: 'red',
              fill: false,
              data: [] // Dữ liệu cho giá trị 1
            },
            {
              label: 'Value 2',
              borderColor: 'blue',
              fill: false,
              data: [] // Dữ liệu cho giá trị 2
            },
            {
              label: 'Value 3',
              borderColor: 'green',
              fill: false,
              data: [] // Dữ liệu cho giá trị 3
            },
            {
              label: 'Value 4',
              borderColor: 'orange',
              fill: false,
              data: [] // Dữ liệu cho giá trị 4
            }
          ]
        },
        chartOptions: {
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'Minutes'
              },
              min: 0,
              max: 30
            },
            y: {
              title: {
                display: true,
                text: 'Values'
              },
              min: 0,
              max: 100
            }
          }
        },
        currentMinute: 0 // Sẽ tăng dần sau mỗi lần nhận được dữ liệu mới
      };
    },
    mounted() {
      // Đảm bảo rằng chartData tồn tại trước khi sử dụng nó
      if (this.chartData) {
        console.log("Chart data initialized correctly");
      }
    },
    methods: {
      addData(dataString) {
        const values = dataString.split('-').map(Number);
        if (values.length === 4) {
          this.currentMinute++;
          this.chartData.labels.push(this.currentMinute);
  
          this.chartData.datasets[0].data.push(values[0]);
          this.chartData.datasets[1].data.push(values[1]);
          this.chartData.datasets[2].data.push(values[2]);
          this.chartData.datasets[3].data.push(values[3]);
  
          if (this.chartData.labels.length > 30) {
            this.chartData.labels.shift();
            this.chartData.datasets.forEach(dataset => dataset.data.shift());
          }
        }
      }
    }
  };
  </script>
  