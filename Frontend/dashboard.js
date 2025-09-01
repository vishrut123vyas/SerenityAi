// Dashboard Page JavaScript - Refactored & Enhanced
import { 
    getAssessmentResults,
    getHealingHistory,
    getProfile,
    isLoggedIn 
} from './api.js';

// Dashboard state management
const DashboardState = {
    userData: {},
    assessmentHistory: [],
    therapyHistory: [],
    moodHistory: [],
    goals: [],
    achievements: [],
    isLoading: false,
    charts: {}
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Initializing Dashboard...');
    
    // Check authentication
    if (!isLoggedIn()) {
        showMessage('Please log in to access your dashboard.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html#auth-section';
        }, 2000);
        return;
    }
    
    await initializeDashboard();
    setupEventListeners();
    initAccessibility();
    
    console.log('✅ Dashboard initialized!');
});

async function initializeDashboard() {
    try {
        DashboardState.isLoading = true;
        showLoadingState();
        
        // Load user profile
        await loadUserProfile();
        
        // Load data in parallel
        await Promise.all([
            loadAssessmentHistory(),
            loadTherapyHistory(),
            loadMoodHistory(),
            loadGoals(),
            loadAchievements()
        ]);
        
        // Render all components
        renderDashboard();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showMessage('Failed to load dashboard data. Please try again.', 'error');
        loadFallbackData();
    } finally {
        DashboardState.isLoading = false;
        hideLoadingState();
    }
}

async function loadUserProfile() {
    try {
        const profile = await getProfile();
        if (profile.success) {
            DashboardState.userData = profile.user;
        } else {
            throw new Error('Failed to load user profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        DashboardState.userData = {
            name: 'User',
            email: 'user@example.com'
        };
    }
}

async function loadAssessmentHistory() {
    try {
        const response = await getAssessmentResults();
        if (response.success) {
            DashboardState.assessmentHistory = response.results || [];
        } else {
            throw new Error(response.message || 'Failed to load assessment history');
        }
    } catch (error) {
        console.error('Error loading assessment history:', error);
        DashboardState.assessmentHistory = generateSampleAssessmentData();
    }
}

async function loadTherapyHistory() {
    try {
        const response = await getHealingHistory();
        if (response.success) {
            DashboardState.therapyHistory = response.sessions || [];
        } else {
            throw new Error(response.message || 'Failed to load therapy history');
        }
    } catch (error) {
        console.error('Error loading therapy history:', error);
        DashboardState.therapyHistory = generateSampleTherapyData();
    }
}

function loadMoodHistory() {
    try {
        const stored = localStorage.getItem('moodHistory');
        DashboardState.moodHistory = stored ? JSON.parse(stored) : generateSampleMoodData();
    } catch (error) {
        console.error('Error loading mood history:', error);
        DashboardState.moodHistory = generateSampleMoodData();
    }
}

function loadGoals() {
    try {
        const stored = localStorage.getItem('userGoals');
        DashboardState.goals = stored ? JSON.parse(stored) : generateSampleGoals();
    } catch (error) {
        console.error('Error loading goals:', error);
        DashboardState.goals = generateSampleGoals();
    }
}

function loadAchievements() {
    try {
        const stored = localStorage.getItem('userAchievements');
        DashboardState.achievements = stored ? JSON.parse(stored) : generateSampleAchievements();
    } catch (error) {
        console.error('Error loading achievements:', error);
        DashboardState.achievements = generateSampleAchievements();
    }
}

function loadFallbackData() {
    DashboardState.assessmentHistory = generateSampleAssessmentData();
    DashboardState.therapyHistory = generateSampleTherapyData();
    DashboardState.moodHistory = generateSampleMoodData();
    DashboardState.goals = generateSampleGoals();
    DashboardState.achievements = generateSampleAchievements();
    renderDashboard();
}

function showLoadingState() {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent) {
        dashboardContent.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading your wellness dashboard...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    // Loading state will be replaced by renderDashboard
}

function renderDashboard() {
    renderWelcomeSection();
    renderProgressChart();
    renderAssessmentHistory();
    renderTherapyHistory();
    renderMoodTracker();
    renderGoals();
    renderAchievements();
    renderInsights();
}

function renderWelcomeSection() {
    const welcomeSection = document.querySelector('.dashboard-content h1');
    if (welcomeSection && DashboardState.userData.name) {
        welcomeSection.textContent = `Welcome back, ${DashboardState.userData.name}!`;
    }
}

function renderProgressChart() {
    const chartCanvas = document.getElementById('progress-chart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    // Prepare data for the chart
    const chartData = DashboardState.assessmentHistory
        .slice(-7) // Last 7 assessments
        .map((assessment, index) => ({
            x: `Assessment ${index + 1}`,
            y: assessment.score || 0
        }));
    
    if (DashboardState.charts.progress) {
        DashboardState.charts.progress.destroy();
    }
    
    DashboardState.charts.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(d => d.x),
            datasets: [{
                label: 'Assessment Score',
                data: chartData.map(d => d.y),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}

function renderAssessmentHistory() {
    const container = document.getElementById('assessment-history');
    if (!container) return;
    
    if (DashboardState.assessmentHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No assessments yet</p>
                <a href="assessment.html" class="btn btn-primary">Take Assessment</a>
            </div>
        `;
        return;
    }
    
    const recentAssessments = DashboardState.assessmentHistory
        .slice(-3) // Show last 3 assessments
        .reverse();
    
    container.innerHTML = recentAssessments.map(assessment => `
        <div class="history-item">
            <div class="history-icon">
                <i class="fas fa-clipboard-list" aria-hidden="true"></i>
            </div>
            <div class="history-details">
                <h4>Assessment Score: ${assessment.score || 'N/A'}</h4>
                <p>${assessment.emotionalLevel || 'Not specified'} • ${formatDate(assessment.completedAt)}</p>
                <div class="score-indicator ${getScoreClass(assessment.score)}">
                    ${getScoreLabel(assessment.score)}
                </div>
            </div>
        </div>
    `).join('');
}

function renderTherapyHistory() {
    const container = document.getElementById('therapy-history');
    if (!container) return;
    
    if (DashboardState.therapyHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>No therapy sessions yet</p>
                <a href="healing.html" class="btn btn-primary">Start Healing</a>
            </div>
        `;
        return;
    }
    
    const recentSessions = DashboardState.therapyHistory
        .slice(-3) // Show last 3 sessions
        .reverse();
    
    container.innerHTML = recentSessions.map(session => `
        <div class="history-item">
            <div class="history-icon">
                <i class="${getSessionIcon(session.type)}" aria-hidden="true"></i>
            </div>
            <div class="history-details">
                <h4>${getSessionTitle(session.type)}</h4>
                <p>${formatDuration(session.duration)} • ${formatDate(session.startTime)}</p>
                ${session.frequency ? `<small>${session.frequency}Hz</small>` : ''}
                ${session.mode ? `<small>${session.mode} mode</small>` : ''}
            </div>
        </div>
    `).join('');
}

function renderMoodTracker() {
    const moodContainer = document.querySelector('.mood-tracker');
    if (!moodContainer) return;
    
    // Show current mood if available
    const today = new Date().toISOString().split('T')[0];
    const todayMood = DashboardState.moodHistory.find(m => m.date === today);
    
    if (todayMood) {
        moodContainer.innerHTML = `
            <div class="mood-display">
                <h3>Today's Mood</h3>
                <div class="mood-score">${todayMood.mood}/10</div>
                <div class="mood-emoji">${getMoodEmoji(todayMood.mood)}</div>
                <p>${getMoodDescription(todayMood.mood)}</p>
            </div>
        `;
    } else {
        moodContainer.innerHTML = `
            <div class="mood-input">
                <h3>How are you feeling today?</h3>
                <div class="mood-buttons">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => `
                        <button class="mood-btn" data-rating="${rating}" aria-label="Rate mood as ${rating}">
                            ${getMoodEmoji(rating)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners to mood buttons
        moodContainer.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                logMood(rating);
            });
        });
    }
}

function renderGoals() {
    const goalsContainer = document.querySelector('.goals-section');
    if (!goalsContainer) return;
    
    goalsContainer.innerHTML = `
        <h3>Your Goals</h3>
        <div class="goals-grid">
            ${DashboardState.goals.map(goal => `
                <div class="goal-card">
                    <div class="goal-icon">
                        <i class="${goal.icon}" aria-hidden="true"></i>
                    </div>
                    <div class="goal-content">
                        <h4>${goal.title}</h4>
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${goal.progress}%"></div>
                            </div>
                            <span>${goal.current}/${goal.target}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAchievements() {
    const achievementsContainer = document.querySelector('.achievements-section');
    if (!achievementsContainer) return;
    
    achievementsContainer.innerHTML = `
        <h3>Achievements</h3>
        <div class="achievements-grid">
            ${DashboardState.achievements.map(achievement => `
                <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">
                        <i class="${achievement.icon}" aria-hidden="true"></i>
                    </div>
                    <div class="achievement-content">
                        <h4>${achievement.title}</h4>
                        <p>${achievement.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderInsights() {
    const insightsContainer = document.querySelector('.insights-section');
    if (!insightsContainer) return;
    
    const insights = generateInsights();
    
    insightsContainer.innerHTML = `
        <h3>Your Insights</h3>
        <div class="insights-grid">
            ${insights.map(insight => `
                <div class="insight-card">
                    <div class="insight-icon">
                        <i class="${insight.icon}" aria-hidden="true"></i>
                    </div>
                    <div class="insight-content">
                        <h4>${insight.title}</h4>
                        <p>${insight.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Add any dashboard-specific event listeners here
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    // Export data button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
}

// ===== MOOD TRACKING =====
function logMood(rating) {
    const today = new Date().toISOString().split('T')[0];
    
    // Add to history
    DashboardState.moodHistory.push({
        date: today,
        mood: rating,
        timestamp: Date.now()
    });
    
    // Keep only last 30 days
    if (DashboardState.moodHistory.length > 30) {
        DashboardState.moodHistory = DashboardState.moodHistory.slice(-30);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('moodHistory', JSON.stringify(DashboardState.moodHistory));
    } catch (error) {
        console.error('Error saving mood history:', error);
    }
    
    // Re-render mood tracker
    renderMoodTracker();
    
    showMessage(`Mood logged: ${getMoodDescription(rating)}`, 'success');
}

function getMoodEmoji(rating) {
    const emojis = ['😢', '😞', '😐', '🙂', '😊', '😄', '😁', '🤗', '😍', '🥰'];
    return emojis[Math.min(rating - 1, emojis.length - 1)] || '😐';
}

function getMoodDescription(rating) {
    const descriptions = [
        'Very Poor', 'Poor', 'Fair', 'Okay', 'Good', 
        'Very Good', 'Great', 'Excellent', 'Amazing', 'Perfect'
    ];
    return descriptions[Math.min(rating - 1, descriptions.length - 1)] || 'Unknown';
}

// ===== UTILITY FUNCTIONS =====
function generateSampleAssessmentData() {
    return [
        { score: 75, emotionalLevel: 'Good', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { score: 68, emotionalLevel: 'Fair', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { score: 82, emotionalLevel: 'Very Good', completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    ];
}

function generateSampleTherapyData() {
    return [
        { type: 'sound', duration: 600, startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), frequency: 432 },
        { type: 'light', duration: 900, startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), mode: 'calm' },
        { type: 'meditation', duration: 1200, startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ];
}

function generateSampleMoodData() {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            mood: Math.floor(Math.random() * 3) + 6, // 6-8 range
            timestamp: date.getTime()
        });
    }
    
    return data;
}

function generateSampleGoals() {
    return [
        { id: 1, title: 'Practice meditation daily', progress: 70, target: 7, current: 5, icon: 'fas fa-spa' },
        { id: 2, title: 'Complete weekly assessment', progress: 100, target: 1, current: 1, icon: 'fas fa-clipboard-list' },
        { id: 3, title: 'Track mood for 30 days', progress: 23, target: 30, current: 7, icon: 'fas fa-chart-line' }
    ];
}

function generateSampleAchievements() {
    return [
        { id: 1, title: 'First Steps', description: 'Completed your first assessment', icon: 'fas fa-star', unlocked: true },
        { id: 2, title: 'Mindful Week', description: '7 days of meditation', icon: 'fas fa-spa', unlocked: true },
        { id: 3, title: 'Consistent Tracker', description: 'Tracked mood for 7 days', icon: 'fas fa-chart-line', unlocked: true },
        { id: 4, title: 'Healing Journey', description: 'Completed 10 healing sessions', icon: 'fas fa-heart', unlocked: false },
        { id: 5, title: 'Chat Champion', description: 'Had 5 meaningful conversations', icon: 'fas fa-comments', unlocked: false },
        { id: 6, title: 'Wellness Master', description: 'Achieved 30-day streak', icon: 'fas fa-trophy', unlocked: false }
    ];
}

function generateInsights() {
    const insights = [];
    
    // Mood trend insight
    if (DashboardState.moodHistory.length >= 7) {
        const recentMoods = DashboardState.moodHistory.slice(-7).map(m => m.mood);
        const avgMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
        
        if (avgMood > 7) {
            insights.push({
                title: 'Positive Trend',
                description: 'Your mood has been consistently positive over the past week!',
                icon: 'fas fa-chart-line'
            });
        } else if (avgMood < 5) {
            insights.push({
                title: 'Mood Support',
                description: 'Consider trying some healing sessions to boost your mood.',
                icon: 'fas fa-heart'
            });
        }
    }
    
    // Assessment insight
    if (DashboardState.assessmentHistory.length > 0) {
        const latestAssessment = DashboardState.assessmentHistory[DashboardState.assessmentHistory.length - 1];
        if (latestAssessment.score < 60) {
            insights.push({
                title: 'Assessment Alert',
                description: 'Your recent assessment suggests you might benefit from additional support.',
                icon: 'fas fa-exclamation-triangle'
            });
        }
    }
    
    // Activity insight
    if (DashboardState.therapyHistory.length === 0) {
        insights.push({
            title: 'Try Healing Sessions',
            description: 'You haven\'t tried any healing sessions yet. They can be very beneficial!',
            icon: 'fas fa-spa'
            });
    }
    
    return insights;
}

function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

function getScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
}

function getSessionIcon(type) {
    const icons = {
        sound: 'fas fa-music',
        light: 'fas fa-lightbulb',
        meditation: 'fas fa-spa'
    };
    return icons[type] || 'fas fa-heart';
}

function getSessionTitle(type) {
    const titles = {
        sound: 'Sound Therapy',
        light: 'Light Therapy',
        meditation: 'Guided Meditation'
    };
    return titles[type] || 'Healing Session';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        return 'Today';
    } else if (diff < 48 * 60 * 60 * 1000) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
}

async function refreshDashboard() {
    showMessage('Refreshing dashboard...', 'info');
    await initializeDashboard();
    showMessage('Dashboard refreshed!', 'success');
}

function exportData() {
    const data = {
        user: DashboardState.userData,
        assessments: DashboardState.assessmentHistory,
        therapy: DashboardState.therapyHistory,
        mood: DashboardState.moodHistory,
        goals: DashboardState.goals,
        achievements: DashboardState.achievements,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serenityai-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Dashboard data exported successfully!', 'success');
}

// ===== ACCESSIBILITY =====
function initAccessibility() {
    // Add ARIA labels
    const chartCanvas = document.getElementById('progress-chart');
    if (chartCanvas) {
        chartCanvas.setAttribute('aria-label', 'Progress chart showing assessment scores over time');
    }
    
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#dashboard-content';
    skipLink.textContent = 'Skip to dashboard content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-bright);
        color: var(--text-primary);
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('.dashboard-content');
    if (mainContent) {
        mainContent.id = 'dashboard-content';
    }
}

// ===== UTILITY FUNCTIONS =====
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 5000);
}

// ===== GLOBAL FUNCTIONS (for backward compatibility) =====
window.logMood = logMood;
window.refreshDashboard = refreshDashboard;
window.exportData = exportData;
window.toggleMobileMenu = function() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    if (navMenu && navToggle) {
        navToggle.click();
    }
}; 