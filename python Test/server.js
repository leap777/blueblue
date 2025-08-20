const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 简单的服务器实现，不依赖express
const hostname = '0.0.0.0';
const port = 3000;

// 存储图表数据和消息
let charts = [];
let messages = [
  {
    id: 1,
    content: "图表的颜色搭配可以更加鲜明一些，建议使用对比度更高的配色方案。",
    timestamp: "2023-05-15 10:30"
  },
  {
    id: 2,
    content: "折线图的线条可以加粗一些，这样在投影时会更清晰。",
    timestamp: "2023-05-14 14:20",
    read: true
  },
  {
    id: 3,
    content: "箱线图的异常值标识不够明显，建议使用特殊符号或颜色突出显示。",
    timestamp: "2023-05-12 09:15"
  }
];

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 处理预检请求
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 解析请求体
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      // API路由
      if (pathname === '/api/charts' && method === 'POST') {
        // 接收图表数据
        const chartData = JSON.parse(body);
        chartData.id = charts.length + 1;
        chartData.receivedAt = new Date().toISOString();
        charts.push(chartData);
        
        console.log('收到新的图表数据:', chartData);
        
        // 模拟老师建议
        const suggestions = [
          "图表的颜色搭配可以更加鲜明一些，建议使用对比度更高的配色方案。",
          "可以尝试使用不同的图表类型来展示数据，比如用箱线图展示数据分布。",
          "建议添加图例说明以便更好地理解数据。",
          "坐标轴的标签可以更详细一些，帮助读者理解数据含义。",
          "标题可以更具描述性，清楚地表达图表的主要内容。"
        ];
        
        // 随机选择1-3个建议
        const selectedSuggestions = [];
        const count = Math.floor(Math.random() * 3) + 1; // 1-3个建议
        for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * suggestions.length);
          selectedSuggestions.push(suggestions[randomIndex]);
        }
        
        // 模拟返回老师建议
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: "图表已成功接收，老师将会查看并提供反馈建议。",
          chartId: chartData.id,
          suggestions: selectedSuggestions
        }));
      } else if (pathname === '/api/charts' && method === 'GET') {
        // 获取所有图表
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(charts));
      } else if (pathname.startsWith('/api/charts/') && method === 'GET') {
        // 获取特定图表
        const id = parseInt(pathname.split('/')[3]);
        const chart = charts.find(c => c.id === id);
        if (chart) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(chart));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '图表未找到' }));
        }
      } else if (pathname === '/api/messages' && method === 'POST') {
        // 添加老师消息
        const message = JSON.parse(body);
        message.id = messages.length + 1;
        message.createdAt = new Date().toISOString();
        messages.push(message);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '消息已添加',
          messageId: message.id
        }));
      } else if (pathname === '/api/messages' && method === 'GET') {
        // 获取所有消息
        // 只返回最新的10条消息
        const recentMessages = messages.slice(-10);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(recentMessages));
      } else if (pathname === '/' && method === 'GET') {
        // 主页
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>数据可视化服务器</title>
              <meta charset="utf-8">
              <style>
                  body { 
                      font-family: Arial, sans-serif; 
                      margin: 40px; 
                      background-color: #f5f7fa;
                  }
                  h1 { 
                      color: #2c3e50; 
                      text-align: center;
                  }
                  .container { 
                      max-width: 800px; 
                      margin: 0 auto; 
                      background: white;
                      padding: 30px;
                      border-radius: 8px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  }
                  .endpoint { 
                      background: #f8f9fa; 
                      padding: 15px; 
                      margin: 15px 0; 
                      border-radius: 5px;
                      border-left: 4px solid #007acc;
                  }
                  .method { 
                      display: inline-block; 
                      padding: 4px 10px; 
                      background: #007acc; 
                      color: white; 
                      border-radius: 3px;
                      font-weight: bold;
                      font-size: 12px;
                  }
                  code {
                      background: #eee;
                      padding: 2px 6px;
                      border-radius: 3px;
                      font-family: 'Courier New', monospace;
                  }
                  pre { 
                      background: #f1f1f1; 
                      padding: 15px; 
                      overflow-x: auto;
                      border-radius: 4px;
                  }
                  .status {
                      text-align: center;
                      padding: 10px;
                      background: #d4edda;
                      color: #155724;
                      border-radius: 5px;
                      margin: 20px 0;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>blueblue服务器</h1>
                  <div class="status">
                      服务器正在运行中 - 端口 ${port}
                  </div>
                  <p>这是一个用于接收学生图表数据并提供老师反馈的服务器。</p>
                  
                  <h2>API 接口</h2>
                  
                  <div class="endpoint">
                      <span class="method">POST</span> <code>/api/charts</code>
                      <p>接收学生发送的图表数据</p>
                      <pre>curl -X POST http://localhost:${port}/api/charts \\
  -H "Content-Type: application/json" \\
  -d '{"chartData": "your_chart_data"}'</pre>
                  </div>
                  
                  <div class="endpoint">
                      <span class="method">GET</span> <code>/api/charts</code>
                      <p>获取所有已接收的图表</p>
                      <pre>curl http://localhost:${port}/api/charts</pre>
                  </div>
                  
                  <div class="endpoint">
                      <span class="method">GET</span> <code>/api/charts/:id</code>
                      <p>获取特定ID的图表</p>
                      <pre>curl http://localhost:${port}/api/charts/1</pre>
                  </div>
                  
                  <div class="endpoint">
                      <span class="method">POST</span> <code>/api/messages</code>
                      <p>添加老师消息</p>
                      <pre>curl -X POST http://localhost:${port}/api/messages \\
  -H "Content-Type: application/json" \\
  -d '{"content": "老师建议内容"}'</pre>
                  </div>
                  
                  <div class="endpoint">
                      <span class="method">GET</span> <code>/api/messages</code>
                      <p>获取所有消息</p>
                      <pre>curl http://localhost:${port}/api/messages</pre>
                  </div>
                  
                  <h2>前端集成</h2>
                  <p>前端应用应通过以下地址访问此服务器:</p>
                  <pre>http://localhost:${port}</pre>
              </div>
          </body>
          </html>
        `);
      } else {
        // 404 Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } catch (error) {
      console.error('服务器错误:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '服务器内部错误' }));
    }
  });
});

// 启动服务器
server.listen(port, hostname, () => {
  console.log(`数据可视化服务器正在运行在 http://${hostname}:${port}`);
  console.log(`API端点:`);
  console.log(`  POST /api/charts - 接收图表数据`);
  console.log(`  GET  /api/charts - 获取所有图表`);
  console.log(`  GET  /api/charts/:id - 获取特定图表`);
  console.log(`  POST /api/messages - 添加老师消息`);
  console.log(`  GET  /api/messages - 获取所有消息`);
});