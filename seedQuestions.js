const { AssessmentQuestion } = require('./src/models');

const questions = [
  // Depression-related questions
  {
    question: "Over the last 2 weeks, how often have you felt little interest or pleasure in doing things?",
    category: "depression",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you felt down, depressed, or hopeless?",
    category: "depression",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
    category: "depression",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you felt tired or had little energy?",
    category: "depression",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you had poor appetite or overeating?",
    category: "depression",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },

  // Anxiety-related questions
  {
    question: "Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?",
    category: "anxiety",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you not been able to stop or control worrying?",
    category: "anxiety",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you worried too much about different things?",
    category: "anxiety",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you had trouble relaxing?",
    category: "anxiety",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },
  {
    question: "Over the last 2 weeks, how often have you been so restless that it's hard to sit still?",
    category: "anxiety",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    weight: 1
  },

  // Stress-related questions
  {
    question: "How often do you feel overwhelmed by your responsibilities?",
    category: "stress",
    options: ["Never", "Rarely", "Sometimes", "Often"],
    weight: 1
  },
  {
    question: "How often do you have difficulty concentrating due to stress?",
    category: "stress",
    options: ["Never", "Rarely", "Sometimes", "Often"],
    weight: 1
  },
  {
    question: "How often do you feel irritable or easily angered?",
    category: "stress",
    options: ["Never", "Rarely", "Sometimes", "Often"],
    weight: 1
  },
  {
    question: "How often do you experience physical symptoms of stress (headaches, muscle tension, etc.)?",
    category: "stress",
    options: ["Never", "Rarely", "Sometimes", "Often"],
    weight: 1
  },
  {
    question: "How often do you feel like you have too much to do and not enough time?",
    category: "stress",
    options: ["Never", "Rarely", "Sometimes", "Often"],
    weight: 1
  },

  // Social support questions
  {
    question: "How often do you feel supported by friends and family?",
    category: "social",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you feel lonely or isolated?",
    category: "social",
    options: ["Never", "Rarely", "Sometimes", "Often"],
    weight: 1
  },
  {
    question: "How often do you feel comfortable talking about your feelings with others?",
    category: "social",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you feel like you have someone to turn to when you need help?",
    category: "social",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you feel connected to your community or social groups?",
    category: "social",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    weight: 1
  },

  // Self-care questions
  {
    question: "How often do you engage in activities that help you relax or reduce stress?",
    category: "selfcare",
    options: ["Daily", "Several times a week", "Once a week", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you get adequate sleep (7-9 hours)?",
    category: "selfcare",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you exercise or engage in physical activity?",
    category: "selfcare",
    options: ["Daily", "Several times a week", "Once a week", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you practice mindfulness or meditation?",
    category: "selfcare",
    options: ["Daily", "Several times a week", "Once a week", "Rarely"],
    weight: 1
  },
  {
    question: "How often do you take time for hobbies or activities you enjoy?",
    category: "selfcare",
    options: ["Daily", "Several times a week", "Once a week", "Rarely"],
    weight: 1
  }
];

async function seedQuestions() {
  try {
    console.log('🌱 Starting to seed assessment questions...');
    
    // Clear existing questions
    await AssessmentQuestion.destroy({ where: {} });
    console.log('🗑️  Cleared existing questions');
    
    // Insert new questions
    const createdQuestions = await AssessmentQuestion.bulkCreate(questions);
    console.log(`✅ Successfully seeded ${createdQuestions.length} assessment questions`);
    
    // Log categories
    const categories = [...new Set(questions.map(q => q.category))];
    console.log('📊 Categories included:', categories.join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
}

// Run the seeder
seedQuestions(); 