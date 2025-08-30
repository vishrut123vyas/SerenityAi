const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { AssessmentQuestion, AssessmentResponse, User } = require('./models');
const { authenticateToken, optionalAuth } = require('./authMiddleware');

// Validation middleware
const validateAssessmentSubmission = [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').isInt().withMessage('Question ID must be a number'),
  body('answers.*.answer').isInt({ min: 0, max: 3 }).withMessage('Answer must be between 0 and 3'),
];

// GET /api/assessment/questions (public)
router.get('/questions', async (req, res) => {
  try {
    const questions = await AssessmentQuestion.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'question', 'category', 'options', 'weight']
    });
    
    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ 
      error: 'Failed to fetch questions',
      message: 'Unable to load assessment questions. Please try again.'
    });
  }
});

// POST /api/assessment/submit (protected)
router.post('/submit', authenticateToken, validateAssessmentSubmission, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { answers } = req.body;

    // Validate that all questions are answered
    const questions = await AssessmentQuestion.findAll();
    if (answers.length !== questions.length) {
      return res.status(400).json({
        error: 'Incomplete assessment',
        message: `Please answer all ${questions.length} questions`
      });
    }

    // Calculate comprehensive score
    const scoreAnalysis = calculateAssessmentScore(answers, questions);
    
    // Generate recommendations based on score
    const recommendations = generateRecommendations(scoreAnalysis);

    // Save assessment response
    const response = await AssessmentResponse.create({
      userId,
      answers,
      score: scoreAnalysis.totalScore,
      emotionalLevel: scoreAnalysis.level,
      recommendations,
      completedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Assessment completed successfully',
      assessment: {
        id: response.id,
        score: scoreAnalysis.totalScore,
        level: scoreAnalysis.level,
        categoryScores: scoreAnalysis.categoryScores,
        recommendations,
        completedAt: response.completedAt
      }
    });
  } catch (err) {
    console.error('Assessment submission error:', err);
    res.status(500).json({ 
      error: 'Failed to submit assessment',
      message: 'Unable to process your assessment. Please try again.'
    });
  }
});

// GET /api/assessment/results (protected - user's own results)
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const results = await AssessmentResponse.findAll({
      where: { userId },
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'score', 'emotionalLevel', 'recommendations', 'completedAt']
    });

    const total = await AssessmentResponse.count({ where: { userId } });

    res.json({
      success: true,
      results,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + results.length
      }
    });
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ 
      error: 'Failed to fetch results',
      message: 'Unable to retrieve your assessment results.'
    });
  }
});

// GET /api/assessment/results/:id (protected - specific result)
router.get('/results/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await AssessmentResponse.findOne({
      where: { id, userId },
      attributes: ['id', 'answers', 'score', 'emotionalLevel', 'recommendations', 'completedAt']
    });

    if (!result) {
      return res.status(404).json({
        error: 'Result not found',
        message: 'Assessment result not found'
      });
    }

    res.json({
      success: true,
      result
    });
  } catch (err) {
    console.error('Error fetching specific result:', err);
    res.status(500).json({ 
      error: 'Failed to fetch result',
      message: 'Unable to retrieve the assessment result.'
    });
  }
});

// GET /api/assessment/analytics (protected - user's analytics)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));

    const assessments = await AssessmentResponse.findAll({
      where: {
        userId,
        completedAt: {
          [require('sequelize').Op.gte]: cutoffDate
        }
      },
      order: [['completedAt', 'ASC']],
      attributes: ['score', 'emotionalLevel', 'completedAt']
    });

    if (assessments.length === 0) {
      return res.json({
        success: true,
        analytics: {
          totalAssessments: 0,
          averageScore: 0,
          trend: 'stable',
          levelDistribution: {},
          recentTrend: []
        }
      });
    }

    // Calculate analytics
    const scores = assessments.map(a => a.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Level distribution
    const levelDistribution = assessments.reduce((acc, assessment) => {
      acc[assessment.emotionalLevel] = (acc[assessment.emotionalLevel] || 0) + 1;
      return acc;
    }, {});

    // Trend analysis
    const recentTrend = assessments.slice(-7).map(a => ({
      score: a.score,
      level: a.emotionalLevel,
      date: a.completedAt
    }));

    // Determine overall trend
    let trend = 'stable';
    if (recentTrend.length >= 2) {
      const firstHalf = recentTrend.slice(0, Math.floor(recentTrend.length / 2));
      const secondHalf = recentTrend.slice(Math.floor(recentTrend.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length;
      
      if (secondAvg < firstAvg - 2) trend = 'improving';
      else if (secondAvg > firstAvg + 2) trend = 'declining';
    }

    res.json({
      success: true,
      analytics: {
        totalAssessments: assessments.length,
        averageScore: Math.round(averageScore * 100) / 100,
        trend,
        levelDistribution,
        recentTrend
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      message: 'Unable to retrieve your assessment analytics.'
    });
  }
});

// Helper function to calculate assessment score
function calculateAssessmentScore(answers, questions) {
  const categoryScores = {};
  let totalScore = 0;

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      const weightedScore = answer.answer * (question.weight || 1);
      totalScore += weightedScore;
      
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = 0;
      }
      categoryScores[question.category] += weightedScore;
    }
  });

  // Determine emotional level based on total score
  const level = getEmotionalLevel(totalScore);

  return {
    totalScore,
    categoryScores,
    level
  };
}

// Helper function to determine emotional level
function getEmotionalLevel(score) {
  if (score <= 7) return 'Low';
  if (score <= 14) return 'Moderate';
  if (score <= 21) return 'High';
  return 'Severe';
}

// Helper function to generate recommendations
function generateRecommendations(scoreAnalysis) {
  const { level, categoryScores } = scoreAnalysis;
  const recommendations = [];

  // General recommendations based on level
  switch (level) {
    case 'Low':
      recommendations.push({
        type: 'maintenance',
        title: 'Maintain Your Wellness',
        description: 'Your emotional well-being is in a good state. Continue with your current practices.',
        priority: 'low'
      });
      break;
    case 'Moderate':
      recommendations.push({
        type: 'prevention',
        title: 'Preventive Care',
        description: 'Consider incorporating stress management techniques and regular check-ins.',
        priority: 'medium'
      });
      break;
    case 'High':
      recommendations.push({
        type: 'intervention',
        title: 'Professional Support Recommended',
        description: 'Consider speaking with a mental health professional for additional support.',
        priority: 'high'
      });
      break;
    case 'Severe':
      recommendations.push({
        type: 'urgent',
        title: 'Immediate Support Needed',
        description: 'Please seek professional help immediately. You\'re not alone.',
        priority: 'critical'
      });
      break;
  }

  // Category-specific recommendations
  if (categoryScores.anxiety > 10) {
    recommendations.push({
      type: 'specific',
      title: 'Anxiety Management',
      description: 'Try breathing exercises and mindfulness techniques.',
      priority: 'medium'
    });
  }

  if (categoryScores.depression > 10) {
    recommendations.push({
      type: 'specific',
      title: 'Depression Support',
      description: 'Consider therapy and maintain social connections.',
      priority: 'high'
    });
  }

  return recommendations;
}

module.exports = router; 