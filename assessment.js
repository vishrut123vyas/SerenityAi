// Assessment Page JavaScript

// Assessment questions
const assessmentQuestions = [
    {
        id: 1,
        question: "How would you rate your overall mood today?",
        type: "scale",
        options: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
        category: "mood"
    },
    {
        id: 2,
        question: "How often do you feel anxious or worried?",
        type: "frequency",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        category: "anxiety"
    },
    {
        id: 3,
        question: "How well are you sleeping?",
        type: "scale",
        options: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
        category: "sleep"
    },
    {
        id: 4,
        question: "How would you describe your energy levels?",
        type: "scale",
        options: ["Very Low", "Low", "Moderate", "High", "Very High"],
        category: "energy"
    },
    {
        id: 5,
        question: "How often do you feel sad or depressed?",
        type: "frequency",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        category: "depression"
    },
    {
        id: 6,
        question: "How well can you concentrate on tasks?",
        type: "scale",
        options: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
        category: "concentration"
    },
    {
        id: 7,
        question: "How often do you experience stress?",
        type: "frequency",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        category: "stress"
    },
    {
        id: 8,
        question: "How satisfied are you with your social relationships?",
        type: "scale",
        options: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
        category: "social"
    },
    {
        id: 9,
        question: "How often do you feel overwhelmed?",
        type: "frequency",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        category: "overwhelm"
    },
    {
        id: 10,
        question: "How optimistic do you feel about your future?",
        type: "scale",
        options: ["Very Pessimistic", "Pessimistic", "Neutral", "Optimistic", "Very Optimistic"],
        category: "optimism"
    }
];

let currentQuestionIndex = 0;
let answers = {};

// Initialize assessment
document.addEventListener('DOMContentLoaded', function() {
    showQuestion(currentQuestionIndex);
    updateProgress();
});

function showQuestion(index) {
    const questionContainer = document.getElementById('question-container');
    const question = assessmentQuestions[index];
    
    questionContainer.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span class="question-number">Question ${question.id} of ${assessmentQuestions.length}</span>
                <h3 class="question-text">${question.question}</h3>
            </div>
            <div class="question-options">
                ${question.options.map((option, optionIndex) => `
                    <button class="option-btn" onclick="selectAnswer(${optionIndex})">
                        <span class="option-text">${option}</span>
                        <div class="option-indicator"></div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function selectAnswer(optionIndex) {
    const question = assessmentQuestions[currentQuestionIndex];
    answers[question.id] = optionIndex;
    
    // Update UI to show selected answer
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
        btn.classList.toggle('selected', index === optionIndex);
    });
    
    // Enable next button
    document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
        updateNavigationButtons();
    } else {
        // Show submit button on last question
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'inline-flex';
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgress();
        updateNavigationButtons();
        
        // Restore previous answer if exists
        const question = assessmentQuestions[currentQuestionIndex];
        if (answers[question.id] !== undefined) {
            const optionBtns = document.querySelectorAll('.option-btn');
            optionBtns[answers[question.id]].classList.add('selected');
        }
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = answers[assessmentQuestions[currentQuestionIndex].id] === undefined;
}

// Handle form submission
document.getElementById('assessment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    showResults();
});

function showResults() {
    const results = calculateResults();
    displayResults(results);
    document.getElementById('results-modal').style.display = 'flex';
}

function calculateResults() {
    let totalScore = 0;
    let categoryScores = {};
    
    // Calculate scores
    Object.keys(answers).forEach(questionId => {
        const question = assessmentQuestions.find(q => q.id === parseInt(questionId));
        const answer = answers[questionId];
        
        // Convert answer to score (0-4 scale)
        let score = answer;
        if (question.type === 'frequency') {
            // Invert frequency scores (Never=4, Always=0)
            score = 4 - answer;
        }
        
        totalScore += score;
        
        // Track category scores
        if (!categoryScores[question.category]) {
            categoryScores[question.category] = [];
        }
        categoryScores[question.category].push(score);
    });
    
    // Calculate average score and determine level
    const averageScore = totalScore / Object.keys(answers).length;
    let level = 1;
    let description = "";
    
    if (averageScore >= 3.5) {
        level = 1;
        description = "Excellent mental wellness! You're showing strong emotional resilience and positive mental health indicators.";
    } else if (averageScore >= 2.5) {
        level = 2;
        description = "Good mental wellness with room for improvement. Consider incorporating more self-care practices into your routine.";
    } else if (averageScore >= 1.5) {
        level = 3;
        description = "Moderate mental wellness concerns. You may benefit from additional support and wellness strategies.";
    } else {
        level = 4;
        description = "Significant mental wellness concerns detected. We strongly recommend seeking professional support and using our healing features.";
    }
    
    return {
        level: level,
        score: averageScore,
        description: description,
        categoryScores: categoryScores,
        recommendations: generateRecommendations(level, categoryScores)
    };
}

function generateRecommendations(level, categoryScores) {
    const recommendations = [];
    
    if (level >= 3) {
        recommendations.push({
            title: "Professional Support",
            description: "Consider connecting with a licensed psychologist through our chat feature for personalized guidance.",
            icon: "fas fa-user-md",
            action: "chat.html"
        });
    }
    
    if (categoryScores.anxiety && categoryScores.anxiety[0] <= 2) {
        recommendations.push({
            title: "Anxiety Management",
            description: "Try our guided breathing exercises and meditation sessions to reduce anxiety.",
            icon: "fas fa-spa",
            action: "healing.html"
        });
    }
    
    if (categoryScores.sleep && categoryScores.sleep[0] <= 2) {
        recommendations.push({
            title: "Sleep Improvement",
            description: "Use our sleep preparation meditation and calming sound therapy.",
            icon: "fas fa-moon",
            action: "healing.html"
        });
    }
    
    recommendations.push({
        title: "Daily Check-ins",
        description: "Track your mood regularly using our dashboard to monitor your progress.",
        icon: "fas fa-chart-line",
        action: "dashboard.html"
    });
    
    return recommendations;
}

function displayResults(results) {
    // Update emotional level
    document.getElementById('emotional-level').textContent = `Level ${results.level}`;
    
    // Update level indicator
    const levelFill = document.getElementById('level-fill');
    const levelPercentage = (results.level / 4) * 100;
    levelFill.style.width = `${levelPercentage}%`;
    
    // Update description
    document.getElementById('result-description').textContent = results.description;
    
    // Update recommendations
    const recommendationsContainer = document.getElementById('recommendation-cards');
    recommendationsContainer.innerHTML = results.recommendations.map(rec => `
        <div class="recommendation-card">
            <div class="recommendation-icon">
                <i class="${rec.icon}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <a href="${rec.action}" class="btn btn-primary">Get Started</a>
            </div>
        </div>
    `).join('');
}

function closeResultsModal() {
    document.getElementById('results-modal').style.display = 'none';
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Global functions for navigation
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.closeResultsModal = closeResultsModal;
window.toggleMobileMenu = toggleMobileMenu; 