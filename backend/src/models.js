const { DataTypes, Sequelize } = require('sequelize');
const config = require('../config');

// Database configuration
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: config.database.dialect,
    logging: config.database.logging,
  }
);

const AssessmentQuestion = sequelize.define('AssessmentQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false, // e.g., ["Not at all", "Several days", "More than half the days", "Nearly every day"]
  },
  weight: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

const AssessmentResponse = sequelize.define('AssessmentResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false, // e.g., [{questionId: 1, answer: 2}, ...]
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  emotionalLevel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

const HealingSession = sequelize.define('HealingSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g., 'sound', 'light', 'combined'
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING, // e.g., '528Hz', 'blue light'
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
  },
  moodBefore: {
    type: DataTypes.INTEGER, // 1-10 scale
    allowNull: true,
  },
  moodAfter: {
    type: DataTypes.INTEGER, // 1-10 scale
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const WaitlistSignup = sequelize.define('WaitlistSignup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'website',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderType: {
    type: DataTypes.ENUM('user', 'ai', 'therapist'),
    defaultValue: 'user',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const TherapySession = sequelize.define('TherapySession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  therapyType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequencies: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  lightColor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10, // minutes
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const TherapyFeedback = sequelize.define('TherapyFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  feedback: {
    type: DataTypes.INTEGER, // 1-5 rating
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const MoodEntry = sequelize.define('MoodEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mood: {
    type: DataTypes.INTEGER, // 1-10 scale
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  activities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define relationships
User.hasMany(AssessmentResponse, { foreignKey: 'userId' });
User.hasMany(HealingSession, { foreignKey: 'userId' });
User.hasMany(TherapySession, { foreignKey: 'userId' });
User.hasMany(MoodEntry, { foreignKey: 'userId' });

AssessmentResponse.belongsTo(User, { foreignKey: 'userId' });
HealingSession.belongsTo(User, { foreignKey: 'userId' });
TherapySession.belongsTo(User, { foreignKey: 'userId' });
MoodEntry.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  AssessmentQuestion,
  AssessmentResponse,
  User,
  HealingSession,
  WaitlistSignup,
  ChatMessage,
  TherapySession,
  TherapyFeedback,
  MoodEntry,
}; 