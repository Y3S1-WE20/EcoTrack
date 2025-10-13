const http = require('http');

console.log('🔍 Testing backend connectivity...\n');

function testConnection(host, port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${host}:${port}${path} - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${host}:${port}${path} - Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏱️  ${host}:${port}${path} - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.setTimeout(5000);
    req.end();
  });
}

async function runTests() {
  const tests = [
    ['localhost', 4000, '/'],
    ['localhost', 4000, '/api/v1/chat/message'],
    ['10.0.2.2', 4000, '/'],
    ['192.168.1.10', 4000, '/'],
  ];

  for (const [host, port, path] of tests) {
    await testConnection(host, port, path);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🔧 If mobile connection fails, run: adb reverse tcp:4000 tcp:4000');
}

runTests();