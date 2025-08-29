const axios = require('axios');

const API = 'http://localhost:5000/api';
const email = 'testuser@example.com';
const password = 'yourpassword';

async function run() {
  try {
    // 1. Register
    console.log('Registering...');
    await axios.post(`${API}/auth/register`, { email, password });
    console.log('Registered.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('User already registered.');
    } else {
      console.error('Registration error:', err.response?.data || err.message);
      return;
    }
  }

  // 2. Login
  let token, userId;
  try {
    console.log('Logging in...');
    const res = await axios.post(`${API}/auth/login`, { email, password });
    token = res.data.token;
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    userId = payload.userId;
    console.log('Logged in. Token:', token);
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    return;
  }

  // 3. Fetch questions
  let questions;
  try {
    console.log('Fetching questions...');
    const res = await axios.get(`${API}/assessment/questions`);
    questions = res.data.questions;
    console.log('Questions count:', res.data.count);
  } catch (err) {
    console.error('Fetch questions error:', err.response?.data || err.message);
    return;
  }

  // 4. Submit assessment
  try {
    console.log('Submitting assessment...');
    const answers = questions.map(q => ({ questionId: q.id, answer: 1 })); // Dummy answers
    const res = await axios.post(
      `${API}/assessment/submit`,
      { answers },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Assessment submitted:', res.data);
  } catch (err) {
    console.error('Submit assessment error:', err.response?.data || err.message);
    return;
  }

  // 5. Fetch results
  try {
    console.log('Fetching results...');
    const res = await axios.get(
      `${API}/assessment/results`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Results length:', res.data.results?.length || 0);
  } catch (err) {
    console.error('Fetch results error:', err.response?.data || err.message);
    return;
  }
}

run(); 