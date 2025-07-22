const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 从环境变量获取服务器端口，默认为3000
  const serverPort = process.env.SERVER_PORT || 3000;
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${serverPort}`,
      changeOrigin: true,
    })
  );
};