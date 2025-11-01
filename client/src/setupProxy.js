const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 从环境变量获取服务主机与端口，默认为 localhost:5000
  const serverHost = process.env.SERVER_HOST || 'localhost';
  const serverPort = process.env.SERVER_PORT || 5000;
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://${serverHost}:${serverPort}`,
      changeOrigin: true,
    })
  );
};