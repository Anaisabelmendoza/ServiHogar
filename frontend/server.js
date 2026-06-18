const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Proxy API requests to Laravel Backend
app.use('/api', createProxyMiddleware({ 
  target: 'http://127.0.0.1:8000', 
  changeOrigin: true 
}));

app.use('/storage', createProxyMiddleware({ 
  target: 'http://127.0.0.1:8000', 
  changeOrigin: true 
}));

// Serve Ionic/Angular static files
app.use(express.static(path.join(__dirname, 'www')));

// Catch all for Ionic routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'www/index.html'));
});

const PORT = 8100;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n\n✅ Frontend and API Proxy running on: http://localhost:${PORT}`);
  console.log(`\n👉 Para usar NGROK, detén tu ngrok actual y ejecuta: ngrok http ${PORT}\n\n`);
});
