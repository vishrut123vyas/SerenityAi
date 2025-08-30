require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Create connection without specifying database
const sequelize = new Sequelize(
  'mysql',
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: config.database.dialect,
    logging: false,
  }
);

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop the database if it exists
    await sequelize.query(`DROP DATABASE IF EXISTS ${config.database.name}`);
    console.log('✅ Dropped existing database');
    
    // Create the database
    await sequelize.query(`CREATE DATABASE ${config.database.name}`);
    console.log('✅ Created new database');
    
    console.log('🎉 Database reset complete!');
    console.log('Now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetDatabase(); 