#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 SerenityAI Backend Setup');
console.log('============================\n');

const questions = [
  {
    name: 'DB_HOST',
    question: 'Database host (default: localhost): ',
    default: 'localhost'
  },
  {
    name: 'DB_NAME',
    question: 'Database name (default: serenityai): ',
    default: 'serenityai'
  },
  {
    name: 'DB_USER',
    question: 'Database username (default: root): ',
    default: 'root'
  },
  {
    name: 'DB_PASS',
    question: 'Database password: ',
    default: ''
  },
  {
    name: 'PORT',
    question: 'Server port (default: 5000): ',
    default: '5000'
  },
  {
    name: 'FRONTEND_URL',
    question: 'Frontend URL (default: http://localhost:3000): ',
    default: 'http://localhost:3000'
  },
  {
    name: 'JWT_SECRET',
    question: 'JWT Secret (press enter to generate): ',
    default: generateJWTSecret()
  }
];

const envVars = {};

function generateJWTSecret() {
  return require('crypto').randomBytes(64).toString('hex');
}

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const q = questions[index];
  rl.question(q.question, (answer) => {
    envVars[q.name] = answer || q.default;
    askQuestion(index + 1);
  });
}

function createEnvFile() {
  const envContent = `# SerenityAI Backend Environment Variables
# Generated on ${new Date().toISOString()}

# Database Configuration
DB_HOST=${envVars.DB_HOST}
DB_NAME=${envVars.DB_NAME}
DB_USER=${envVars.DB_USER}
DB_PASS=${envVars.DB_PASS}

# Server Configuration
PORT=${envVars.PORT}
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=${envVars.FRONTEND_URL}

# JWT Secret
JWT_SECRET=${envVars.JWT_SECRET}

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=${generateJWTSecret()}

# Email Configuration (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# External APIs (optional)
# OPENAI_API_KEY=your-openai-api-key
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Logging
LOG_LEVEL=debug
`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Create the MySQL database:');
    console.log(`   CREATE DATABASE ${envVars.DB_NAME};`);
    console.log('\n2. Install dependencies:');
    console.log('   npm install');
    console.log('\n3. Seed the database:');
    console.log('   npm run seed');
    console.log('\n4. Start the development server:');
    console.log('   npm run dev');
    console.log('\n5. Test the API:');
    console.log(`   curl http://localhost:${envVars.PORT}/health`);
    
    console.log('\n🎉 Setup complete! Your backend is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

// Start the setup process
askQuestion(0); 