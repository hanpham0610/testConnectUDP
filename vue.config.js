const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  devServer: {
    host: '0.0.0.0', // Lắng nghe trên tất cả các địa chỉ IP
    port: 8080, // Chọn cổng bạn muốn sử dụng (mặc định là 8080)
    allowedHosts: 'all', // Cho phép các thiết bị khác truy cập
  },
};