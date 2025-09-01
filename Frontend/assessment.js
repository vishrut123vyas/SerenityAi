// Advanced Assessment System
let AssessmentState = {
    currentQuestionIndex: 0,
    questions: [],
    answers: {},
    moodData: [],
    biometricData: null,
    voiceRecognition: null,
    isRecording: false,
    startTime: null,
    timer: null
};

// Initialize the assessment system
document.addEventListener('DOMContentLoaded', function() {
    initAssessmentForm();
    initMoodTracker();
    initVoiceInput();
    initBiometricAnalysis();
    initAIInsights();
    initAccessibility();
    startTimer();
});

// Timer functionality
function startTimer() {
    AssessmentState.startTime = Date.now();
    AssessmentState.timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!AssessmentState.startTime) return;
    
    const elapsed = Math.floor((Date.now() - AssessmentState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timeElapsed = document.getElementById('time-elapsed');
    if (timeElapsed) {
        timeElapsed.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update estimated time remaining
    const estimatedTime = document.getElementById('estimated-time');
    if (estimatedTime) {
        const avgTimePerQuestion = 30; // seconds
        const remainingQuestions = AssessmentState.questions.length - AssessmentState.currentQuestionIndex;
        const estimatedSeconds = remainingQuestions * avgTimePerQuestion;
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        estimatedTime.textContent = `${estimatedMinutes} min`;
    }
}

// Enhanced progress tracking
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressPercentage = document.getElementById('progress-percentage');
    const questionCounter = document.getElementById('question-counter');
    const completedQuestions = document.getElementById('completed-questions');
    
    if (AssessmentState.questions.length === 0) return;
    
    const progress = ((AssessmentState.currentQuestionIndex + 1) / AssessmentState.questions.length) * 100;
    const completedCount = Object.keys(AssessmentState.answers).length;
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = `Question ${AssessmentState.currentQuestionIndex + 1} of ${AssessmentState.questions.length}`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = Math.round(progress) + '%';
    }
    
    if (questionCounter) {
        questionCounter.textContent = `${AssessmentState.currentQuestionIndex + 1} of ${AssessmentState.questions.length}`;
    }
    
    if (completedQuestions) {
        completedQuestions.textContent = completedCount;
    }
    
    // Update auto-save status
    const autoSaveStatus = document.getElementById('auto-save-status');
    if (autoSaveStatus) {
        autoSaveStatus.textContent = 'Auto-saved';
        setTimeout(() => {
            autoSaveStatus.textContent = 'Auto-saved';
        }, 2000);
    }
}

// Enhanced mood tracker
function initMoodTracker() {
    const moodEmojis = document.querySelectorAll('.mood-emoji');
    const intensitySlider = document.getElementById('intensity-slider');
    const intensityValue = document.getElementById('intensity-value');
    const moodNotes = document.getElementById('mood-notes');
    const saveMoodBtn = document.getElementById('save-mood-btn');
    
    // Mood emoji selection
    moodEmojis.forEach(emoji => {
        emoji.addEventListener('click', function() {
            moodEmojis.forEach(e => e.classList.remove('selected'));
            this.classList.add('selected');
            
            const mood = this.dataset.mood;
            updateMoodData(mood);
        });
    });
    
    // Intensity slider
    if (intensitySlider && intensityValue) {
        intensitySlider.addEventListener('input', function() {
            intensityValue.textContent = this.value;
            updateMoodData(null, this.value);
        });
    }
    
    // Save mood button
    if (saveMoodBtn) {
        saveMoodBtn.addEventListener('click', saveMoodEntry);
    }
    
    // Auto-save mood every 30 seconds
    setInterval(autoSaveMood, 30000);
}

function updateMoodData(mood = null, intensity = null) {
    const selectedMood = mood || document.querySelector('.mood-emoji.selected')?.dataset.mood;
    const currentIntensity = intensity || document.getElementById('intensity-slider')?.value;
    const notes = document.getElementById('mood-notes')?.value;
    
    if (selectedMood) {
        AssessmentState.moodData.push({
            mood: selectedMood,
            intensity: parseInt(currentIntensity) || 5,
            notes: notes || '',
            timestamp: new Date().toISOString()
        });
    }
}

function saveMoodEntry() {
    const selectedMood = document.querySelector('.mood-emoji.selected');
    const intensity = document.getElementById('intensity-slider')?.value;
    const notes = document.getElementById('mood-notes')?.value;
    
    if (selectedMood) {
        const moodEntry = {
            mood: selectedMood.dataset.mood,
            intensity: parseInt(intensity) || 5,
            notes: notes || '',
            timestamp: new Date().toISOString()
        };
        
        AssessmentState.moodData.push(moodEntry);
        
        // Show success message
        showMessage('Mood saved successfully!', 'success');
        
        // Clear notes
        if (document.getElementById('mood-notes')) {
            document.getElementById('mood-notes').value = '';
        }
    } else {
        showMessage('Please select a mood first', 'warning');
    }
}

function autoSaveMood() {
    const selectedMood = document.querySelector('.mood-emoji.selected');
    if (selectedMood) {
        updateMoodData();
    }
}

// Enhanced voice input
function initVoiceInput() {
    const voiceBtn = document.getElementById('voice-input-btn');
    const voiceStatus = document.getElementById('voice-status');
    const voiceStatusText = document.getElementById('voice-status-text');
    const voiceStatusIndicator = document.getElementById('voice-status-indicator');
    
    if (voiceBtn) {
        voiceBtn.addEventListener('click', toggleVoiceInput);
    }
    
    // Check if speech recognition is available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        AssessmentState.voiceRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        AssessmentState.voiceRecognition.continuous = false;
        AssessmentState.voiceRecognition.interimResults = false;
        AssessmentState.voiceRecognition.lang = 'en-US';
        
        AssessmentState.voiceRecognition.onstart = function() {
            AssessmentState.isRecording = true;
            if (voiceBtn) voiceBtn.classList.add('recording');
            if (voiceStatus) voiceStatus.textContent = 'Listening... Speak now';
            if (voiceStatusText) voiceStatusText.textContent = 'Recording';
            if (voiceStatusIndicator) voiceStatusIndicator.classList.add('recording');
        };
        
        AssessmentState.voiceRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            processVoiceInput(transcript);
        };
        
        AssessmentState.voiceRecognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            resetVoiceInput();
        };
        
        AssessmentState.voiceRecognition.onend = function() {
            resetVoiceInput();
        };
    } else {
        if (voiceStatus) voiceStatus.textContent = 'Voice input not supported in this browser';
        if (voiceBtn) voiceBtn.disabled = true;
    }
}

function toggleVoiceInput() {
    if (AssessmentState.isRecording) {
        AssessmentState.voiceRecognition.stop();
    } else {
        AssessmentState.voiceRecognition.start();
    }
}

function resetVoiceInput() {
    AssessmentState.isRecording = false;
    const voiceBtn = document.getElementById('voice-input-btn');
    const voiceStatus = document.getElementById('voice-status');
    const voiceStatusText = document.getElementById('voice-status-text');
    const voiceStatusIndicator = document.getElementById('voice-status-indicator');
    
    if (voiceBtn) voiceBtn.classList.remove('recording');
    if (voiceStatus) voiceStatus.textContent = 'Click to start voice input';
    if (voiceStatusText) voiceStatusText.textContent = 'Ready';
    if (voiceStatusIndicator) voiceStatusIndicator.classList.remove('recording');
}

function processVoiceInput(transcript) {
    // Process voice input and map to assessment answers
    const currentQuestion = AssessmentState.questions[AssessmentState.currentQuestionIndex];
    if (!currentQuestion) return;
    
    const options = currentQuestion.options;
    const transcriptLower = transcript.toLowerCase();
    
    // Simple keyword matching
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].toLowerCase();
        if (transcriptLower.includes(optionText) || 
            (i === 0 && transcriptLower.includes('first')) ||
            (i === 1 && transcriptLower.includes('second')) ||
            (i === 2 && transcriptLower.includes('third')) ||
            (i === 3 && transcriptLower.includes('fourth'))) {
            selectAnswer(i, currentQuestion.id);
            showMessage(`Selected: ${options[i]}`, 'success');
            return;
        }
    }
    
    showMessage('Could not match voice input to any option. Please try again or use the buttons.', 'warning');
}

// Enhanced biometric analysis
function initBiometricAnalysis() {
    const enableBiometricBtn = document.getElementById('enable-biometric-btn');
    const biometricStatus = document.getElementById('biometric-status');
    const biometricStatusText = document.getElementById('biometric-status-text');
    const biometricStatusIndicator = document.getElementById('biometric-status-indicator');
    
    if (enableBiometricBtn) {
        enableBiometricBtn.addEventListener('click', function() {
            if (AssessmentState.biometricData) {
                stopBiometricAnalysis();
            } else {
                startBiometricAnalysis();
            }
        });
    }
}

function startBiometricAnalysis() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            AssessmentState.biometricData = stream;
            startFacialAnalysis(stream);
            
            const biometricStatus = document.getElementById('biometric-status');
            const biometricStatusText = document.getElementById('biometric-status-text');
            const biometricStatusIndicator = document.getElementById('biometric-status-indicator');
            const biometricFeedback = document.getElementById('biometric-feedback');
            
            if (biometricStatus) biometricStatus.textContent = 'Biometric analysis active';
            if (biometricStatusText) biometricStatusText.textContent = 'Active';
            if (biometricStatusIndicator) biometricStatusIndicator.classList.add('active');
            if (biometricFeedback) biometricFeedback.style.display = 'block';
            
            const enableBiometricBtn = document.getElementById('enable-biometric-btn');
            if (enableBiometricBtn) {
                enableBiometricBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Biometric Analysis';
            }
        })
        .catch(function(error) {
            console.error('Error accessing camera:', error);
            showMessage('Could not access camera. Please check permissions.', 'error');
        });
}

function startFacialAnalysis(stream) {
    const canvas = document.getElementById('expression-canvas');
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    function analyzeFrame() {
        if (!AssessmentState.biometricData) return;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Simulate facial expression analysis
        const stressLevel = Math.random() * 100;
        const emotionalStates = ['Calm', 'Anxious', 'Focused', 'Distracted', 'Engaged'];
        const emotionalState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
        
        updateBiometricMetrics(stressLevel, emotionalState);
        
        requestAnimationFrame(analyzeFrame);
    }
    
    analyzeFrame();
}

function updateBiometricMetrics(stressLevel, emotionalState) {
    const stressLevelBar = document.getElementById('stress-level');
    const emotionalStateSpan = document.getElementById('emotional-state');
    
    if (stressLevelBar) {
        stressLevelBar.style.width = stressLevel + '%';
    }
    
    if (emotionalStateSpan) {
        emotionalStateSpan.textContent = emotionalState;
    }
}

function stopBiometricAnalysis() {
    if (AssessmentState.biometricData) {
        AssessmentState.biometricData.getTracks().forEach(track => track.stop());
        AssessmentState.biometricData = null;
        
        const biometricStatus = document.getElementById('biometric-status');
        const biometricStatusText = document.getElementById('biometric-status-text');
        const biometricStatusIndicator = document.getElementById('biometric-status-indicator');
        const biometricFeedback = document.getElementById('biometric-feedback');
        
        if (biometricStatus) biometricStatus.textContent = 'Biometric analysis disabled';
        if (biometricStatusText) biometricStatusText.textContent = 'Disabled';
        if (biometricStatusIndicator) biometricStatusIndicator.classList.remove('active');
        if (biometricFeedback) biometricFeedback.style.display = 'none';
        
        const enableBiometricBtn = document.getElementById('enable-biometric-btn');
        if (enableBiometricBtn) {
            enableBiometricBtn.innerHTML = '<i class="fas fa-camera"></i> Enable Biometric Analysis';
        }
    }
}

// Enhanced AI insights
function initAIInsights() {
    // Initialize AI insights system
    setInterval(generateAIInsights, 10000); // Generate insights every 10 seconds
}

function generateAIInsights() {
    if (AssessmentState.questions.length === 0) return;
    
    const patternInsight = document.getElementById('pattern-insight');
    const riskInsight = document.getElementById('risk-insight');
    const progressInsight = document.getElementById('progress-insight');
    
    if (patternInsight) {
        const patterns = analyzeResponsePatterns(AssessmentState.answers);
        patternInsight.textContent = patterns;
    }
    
    if (riskInsight) {
        const risks = assessRiskFactors(AssessmentState.answers, AssessmentState.moodData);
        riskInsight.textContent = risks;
    }
    
    if (progressInsight) {
        const progress = trackProgress(AssessmentState.answers, AssessmentState.moodData);
        progressInsight.textContent = progress;
    }
}

function analyzeResponsePatterns(answers) {
    const patterns = [];
    const answerValues = Object.values(answers);
    
    if (answerValues.length > 0) {
        const avgScore = answerValues.reduce((a, b) => a + b, 0) / answerValues.length;
        
        if (avgScore > 3) {
            patterns.push("Showing signs of elevated stress levels");
        } else if (avgScore < 2) {
            patterns.push("Generally positive emotional patterns detected");
        } else {
            patterns.push("Mixed emotional patterns observed");
        }
    }
    
    return patterns.length > 0 ? patterns.join('. ') : "Analyzing your responses for patterns...";
}

function assessRiskFactors(answers, moodData) {
    const risks = [];
    
    if (moodData.length > 0) {
        const recentMoods = moodData.slice(-3);
        const negativeMoods = recentMoods.filter(m => ['sad', 'anxious', 'angry', 'overwhelmed'].includes(m.mood));
        
        if (negativeMoods.length > 1) {
            risks.push("Recent mood patterns suggest increased stress");
        }
    }
    
    const answerValues = Object.values(answers);
    if (answerValues.length > 0) {
        const highStressAnswers = answerValues.filter(a => a > 3).length;
        if (highStressAnswers > answerValues.length * 0.6) {
            risks.push("Multiple high-stress responses detected");
        }
    }
    
    return risks.length > 0 ? risks.join('. ') : "Evaluating potential risk factors...";
}

function trackProgress(answers, moodData) {
    const progress = [];
    
    if (answers && Object.keys(answers).length > 0) {
        progress.push(`Completed ${Object.keys(answers).length} questions`);
    }
    
    if (moodData && moodData.length > 0) {
        progress.push(`Tracked ${moodData.length} mood entries`);
    }
    
    return progress.length > 0 ? progress.join('. ') : "Comparing with previous assessments...";
}

// Enhanced question loading and display
async function loadQuestions() {
    try {
        // Load questions from assessmentQuestions.js or use fallback
        if (typeof assessmentQuestions !== 'undefined') {
            AssessmentState.questions = assessmentQuestions;
        } else {
            showEnhancedFallbackQuestions();
        }
        
        if (AssessmentState.questions.length > 0) {
            showQuestion(0);
            updateProgress();
            updateNavigationButtons();
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showEnhancedFallbackQuestions();
    }
}

function showEnhancedFallbackQuestions() {
    AssessmentState.questions = [
        {
            id: 1,
            text: "How often do you feel overwhelmed by your daily responsibilities?",
            category: "Stress Management",
            options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
        },
        {
            id: 2,
            text: "How would you rate your current sleep quality?",
            category: "Sleep Quality",
            options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"]
        },
        {
            id: 3,
            text: "How often do you experience feelings of anxiety or worry?",
            category: "Anxiety",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
        },
        {
            id: 4,
            text: "How satisfied are you with your current social relationships?",
            category: "Social Connection",
            options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
        },
        {
            id: 5,
            text: "How often do you feel motivated to pursue your goals?",
            category: "Motivation",
            options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
        },
        {
            id: 6,
            text: "How would you describe your energy levels throughout the day?",
            category: "Energy",
            options: ["Very High", "High", "Moderate", "Low", "Very Low"]
        },
        {
            id: 7,
            text: "How often do you practice self-care activities?",
            category: "Self-Care",
            options: ["Daily", "Several times a week", "Weekly", "Monthly", "Rarely"]
        },
        {
            id: 8,
            text: "How well do you handle unexpected changes or challenges?",
            category: "Adaptability",
            options: ["Very Well", "Well", "Okay", "Poorly", "Very Poorly"]
        },
        {
            id: 9,
            text: "How often do you feel connected to your purpose or meaning in life?",
            category: "Purpose",
            options: ["Always", "Often", "Sometimes", "Rarely", "Never"]
        },
        {
            id: 10,
            text: "How would you rate your overall emotional well-being right now?",
            category: "Overall Wellness",
            options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"]
        }
    ];
}

function showQuestion(index) {
    if (index < 0 || index >= AssessmentState.questions.length) return;
    
    const question = AssessmentState.questions[index];
    const container = document.getElementById('question-container');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <div class="question-number">Question ${index + 1}</div>
                <div class="question-category">${question.category}</div>
            </div>
            <div class="question-text">${question.text}</div>
            <div class="question-options">
                ${question.options.map((option, optionIndex) => `
                    <button class="option-btn" data-option="${optionIndex}" data-question="${question.id}">
                        <span class="option-text">${option}</span>
                        <div class="option-indicator"></div>
                    </button>
                `).join('')}
            </div>
            <div class="question-help">
                <i class="fas fa-lightbulb"></i>
                <span>Select the option that best describes your experience over the past 2 weeks</span>
            </div>
        </div>
    `;
    
    // Add event listeners to options
    const optionButtons = container.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const optionIndex = parseInt(this.dataset.option);
            const questionId = parseInt(this.dataset.question);
            selectAnswer(optionIndex, questionId);
        });
    });
    
    // Add keyboard navigation
    container.addEventListener('keydown', handleQuestionKeyboard);
    
    // Update current question index
    AssessmentState.currentQuestionIndex = index;
}

function handleQuestionKeyboard(event) {
    const currentQuestion = AssessmentState.questions[AssessmentState.currentQuestionIndex];
    if (!currentQuestion) return;
    
    const optionButtons = document.querySelectorAll('.option-btn');
    
    switch(event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            const optionIndex = parseInt(event.key) - 1;
            if (optionIndex < currentQuestion.options.length) {
                selectAnswer(optionIndex, currentQuestion.id);
            }
            break;
        case 'ArrowLeft':
            previousQuestion();
            break;
        case 'ArrowRight':
            nextQuestion();
            break;
        case 'Enter':
            if (AssessmentState.currentQuestionIndex === AssessmentState.questions.length - 1) {
                handleSubmit();
            } else {
                nextQuestion();
            }
            break;
    }
}

function selectAnswer(optionIndex, questionId) {
    // Remove previous selection
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Select new answer
    const selectedButton = document.querySelector(`[data-option="${optionIndex}"][data-question="${questionId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    
    // Store answer
    AssessmentState.answers[questionId] = optionIndex + 1;
    
    // Auto-advance after a short delay
    setTimeout(() => {
        if (AssessmentState.currentQuestionIndex < AssessmentState.questions.length - 1) {
            nextQuestion();
        }
    }, 1000);
}

// Enhanced navigation
function nextQuestion() {
    if (AssessmentState.currentQuestionIndex < AssessmentState.questions.length - 1) {
        AssessmentState.currentQuestionIndex++;
        showQuestion(AssessmentState.currentQuestionIndex);
        updateProgress();
        updateNavigationButtons();
    }
}

function previousQuestion() {
    if (AssessmentState.currentQuestionIndex > 0) {
        AssessmentState.currentQuestionIndex--;
        showQuestion(AssessmentState.currentQuestionIndex);
        updateProgress();
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
        prevBtn.style.display = AssessmentState.currentQuestionIndex === 0 ? 'none' : 'block';
    }
    
    if (nextBtn) {
        nextBtn.style.display = AssessmentState.currentQuestionIndex === AssessmentState.questions.length - 1 ? 'none' : 'block';
    }
    
    if (submitBtn) {
        submitBtn.style.display = AssessmentState.currentQuestionIndex === AssessmentState.questions.length - 1 ? 'block' : 'none';
    }
}

// Enhanced submission
async function handleSubmit() {
    if (Object.keys(AssessmentState.answers).length < AssessmentState.questions.length) {
        showMessage('Please answer all questions before submitting.', 'warning');
        return;
    }
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Simulate processing time
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        const assessment = {
            answers: AssessmentState.answers,
            moodData: AssessmentState.moodData,
            duration: Date.now() - AssessmentState.startTime,
            timestamp: new Date().toISOString()
        };
        
        showEnhancedResults(assessment);
    }, 2000);
}

function showEnhancedResults(assessment) {
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.style.display = 'block';
        displayEnhancedResults(assessment);
    }
}

function displayEnhancedResults(assessment) {
    const scores = calculateOverallScore(assessment.answers);
    
    // Update score bars with animation
    updateScoreBars();
    
    // Generate AI insights
    generateAIInsights();
    
    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(assessment);
    const recommendationContainer = document.getElementById('therapy-recommendation');
    if (recommendationContainer) {
        recommendationContainer.innerHTML = recommendations;
    }
    
    // Show success message
    showMessage('Assessment completed successfully!', 'success');
}

function calculateOverallScore(answers) {
    const answerValues = Object.values(answers);
    const avgScore = answerValues.reduce((a, b) => a + b, 0) / answerValues.length;
    
    return {
        depression: Math.random() * 10,
        anxiety: Math.random() * 10,
        stress: Math.random() * 10,
        wellness: Math.max(0, 100 - (avgScore * 10))
    };
}

function updateScoreBars() {
    const scores = {
        depression: Math.random() * 10,
        anxiety: Math.random() * 10,
        stress: Math.random() * 10,
        wellness: Math.random() * 100
    };
    
    Object.keys(scores).forEach(scoreType => {
        const scoreBar = document.getElementById(`${scoreType}-score`);
        const severitySpan = document.getElementById(`${scoreType}-severity`);
        
        if (scoreBar) {
            const percentage = scoreType === 'wellness' ? scores[scoreType] : (scores[scoreType] / 10) * 100;
            scoreBar.style.width = '0%';
            setTimeout(() => {
                scoreBar.style.width = percentage + '%';
            }, 500);
        }
        
        if (severitySpan) {
            const severity = getSeverity(scores[scoreType], scoreType);
            severitySpan.textContent = severity;
        }
    });
}

function getSeverity(score, domain) {
    if (domain === 'wellness') {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Attention';
    }
    
    if (score <= 2) return 'Minimal';
    if (score <= 4) return 'Mild';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'Severe';
    return 'Very Severe';
}

function generatePersonalizedRecommendations(assessment) {
    const recommendations = [];
    const scores = calculateOverallScore(assessment.answers);
    
    if (scores.stress > 6) {
        recommendations.push({
            icon: 'fas fa-spa',
            title: 'Stress Management',
            description: 'Consider daily meditation and breathing exercises'
        });
    }
    
    if (scores.anxiety > 6) {
        recommendations.push({
            icon: 'fas fa-heart',
            title: 'Anxiety Support',
            description: 'Practice mindfulness and consider professional therapy'
        });
    }
    
    if (scores.wellness < 60) {
        recommendations.push({
            icon: 'fas fa-dumbbell',
            title: 'Wellness Boost',
            description: 'Focus on sleep, exercise, and social connections'
        });
    }
    
    return recommendations.map(rec => `
        <div class="recommendation-item">
            <i class="${rec.icon}"></i>
            <div>
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
        </div>
    `).join('');
}

// Enhanced message system
function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `message-toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Enhanced initialization
function initAssessmentForm() {
    loadQuestions();
    
    // Add event listeners
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', previousQuestion);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Modal event listeners
    const closeResultsBtn = document.getElementById('close-results-btn');
    const closeResultsModalBtn = document.getElementById('close-results-modal');
    const closeHealingModalBtn = document.getElementById('close-healing-modal');
    
    if (closeResultsBtn) {
        closeResultsBtn.addEventListener('click', closeResultsModal);
    }
    
    if (closeResultsModalBtn) {
        closeResultsModalBtn.addEventListener('click', closeResultsModal);
    }
    
    if (closeHealingModalBtn) {
        closeHealingModalBtn.addEventListener('click', closeHealingModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const resultsModal = document.getElementById('results-modal');
        const healingModal = document.getElementById('healing-modal');
        
        if (event.target === resultsModal) {
            closeResultsModal();
        }
        if (event.target === healingModal) {
            closeHealingModal();
        }
    });
}

function closeResultsModal() {
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeHealingModal() {
    const modal = document.getElementById('healing-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Enhanced accessibility
function initAccessibility() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const resultsModal = document.getElementById('results-modal');
            const healingModal = document.getElementById('healing-modal');
            
            if (resultsModal && resultsModal.style.display === 'block') {
                closeResultsModal();
            }
            if (healingModal && healingModal.style.display === 'block') {
                closeHealingModal();
            }
        }
    });
    
    // Add focus management
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (firstElement && lastElement) {
            lastElement.addEventListener('keydown', function(event) {
                if (event.key === 'Tab' && !event.shiftKey) {
                    event.preventDefault();
                    firstElement.focus();
                }
            });
            
            firstElement.addEventListener('keydown', function(event) {
                if (event.key === 'Tab' && event.shiftKey) {
                    event.preventDefault();
                    lastElement.focus();
                }
            });
        }
    });
}

// Cleanup function
function cleanup() {
    if (AssessmentState.biometricData) {
        AssessmentState.biometricData.getTracks().forEach(track => track.stop());
    }
    if (AssessmentState.voiceRecognition && AssessmentState.isRecording) {
        AssessmentState.voiceRecognition.stop();
    }
    if (AssessmentState.timer) {
        clearInterval(AssessmentState.timer);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup); 