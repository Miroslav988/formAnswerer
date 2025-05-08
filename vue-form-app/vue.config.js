module.exports = {
  devServer: {
    port: 5050,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
};
