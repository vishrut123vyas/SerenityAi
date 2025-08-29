const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing SerenityAI Backend...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', healthResponse.data);

    // Test assessment questions
    console.log('\n2. Testing assessment questions...');
    const questionsResponse = await axios.get(`${API_BASE}/assessment/questions`);
    console.log('✅ Assessment questions loaded:', questionsResponse.data.count, 'questions');

    // Test waitlist signup
    console.log('\n3. Testing waitlist signup...');
    const waitlistResponse = await axios.post(`${API_BASE}/waitlist`, {
      email: 'test@example.com',
      source: 'test'
    });
    console.log('✅ Waitlist signup successful:', waitlistResponse.data);

    // Test chat without authentication (should work with fallback)
    console.log('\n4. Testing chat endpoint...');
    const chatResponse = await axios.post(`${API_BASE}/chat/send`, {
      message: 'Hello, I need help with anxiety',
      chatType: 'ai'
    });
    console.log('✅ Chat response received:', chatResponse.data.success ? 'Success' : 'Failed');

    console.log('\n🎉 All basic tests passed! Backend is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   - Set up your MySQL database');
    console.log('   - Run: npm run setup');
    console.log('   - Run: npm run seed');
    console.log('   - Test with authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    console.log('\n💡 Make sure:');
    console.log('   - Backend server is running (npm run dev)');
    console.log('   - Database is configured');
    console.log('   - All dependencies are installed');
  }
}

testBackend(); 