const http = require('http');

// Test data for contact form
const testData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '555-123-4567',
  subject: 'buying',
  message: 'This is a test message to verify email functionality.',
  preferred_contact: 'email',
  recaptcha_token: '03AIIukzj6m_YZV4-vw8Z8nQ8J9K5V2a4eZB1FgHzJ-YkV3K4T5Q3Q'  // Test token
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/contact/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:', error.message);
});

req.write(postData);
req.end();

console.log('Testing contact form email functionality...');
console.log('Expected: Email should be sent to jenny@askforvirginia.com');