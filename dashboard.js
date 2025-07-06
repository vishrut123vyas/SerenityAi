// Dashboard Page JavaScript

let moodChart;
let userData = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeMoodChart();
    loadActivityList();
    loadInsights();
    loadGoals();
    loadAchievements();
});

function loadUserData() {
    // Load user data from localStorage
    userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Initialize default data if empty
    if (!userData.moodHistory) {
        userData.moodHistory = generateSampleMoodData();
    }
    if (!userData.activities) {
        userData.activities = generateSampleActivities();
    }
    if (!userData.goals) {
        userData.goals = generateSampleGoals();
    }
    if (!userData.achievements) {
        userData.achievements = generateSampleAchievements();
    }
    
    localStorage.setItem('userData', JSON.stringify(userData));
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
            activities: Math.floor(Math.random() * 3) + 1
        });
    }
    
    return data;
}

function generateSampleActivities() {
    return [
        { type: 'assessment', title: 'Completed Emotional Assessment', time: '2 hours ago', icon: 'fas fa-clipboard-list' },
        { type: 'healing', title: 'Sound Therapy Session', time: '1 day ago', icon: 'fas fa-music' },
        { type: 'chat', title: 'Chat with AI Assistant', time: '2 days ago', icon: 'fas fa-robot' },
        { type: 'meditation', title: 'Guided Meditation', time: '3 days ago', icon: 'fas fa-spa' },
        { type: 'mood', title: 'Mood Check-in', time: '4 days ago', icon: 'fas fa-smile' }
    ];
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

// Mood Chart
function initializeMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    
    const chartData = userData.moodHistory.map(item => ({
        x: new Date(item.date),
        y: item.mood
    }));
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Mood Score',
                data: chartData,
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
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    min: 1,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 6,
                    backgroundColor: '#8b5cf6'
                }
            }
        }
    });
}

// Activity List
function loadActivityList() {
    const activityList = document.getElementById('activity-list');
    
    activityList.innerHTML = userData.activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// AI Insights
function loadInsights() {
    const insightsContainer = document.getElementById('insights-container');
    
    const insights = generateInsights();
    
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <div class="insight-icon">
                <i class="${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        </div>
    `).join('');
}

function generateInsights() {
    const recentMood = userData.moodHistory[userData.moodHistory.length - 1];
    const avgMood = userData.moodHistory.reduce((sum, item) => sum + item.mood, 0) / userData.moodHistory.length;
    
    const insights = [];
    
    if (avgMood >= 7) {
        insights.push({
            title: "Excellent Progress",
            description: "Your mood has been consistently positive this week. Keep up the great work!",
            icon: "fas fa-star"
        });
    } else if (avgMood >= 5) {
        insights.push({
            title: "Steady Improvement",
            description: "You're making good progress. Consider trying our meditation sessions for further improvement.",
            icon: "fas fa-chart-line"
        });
    } else {
        insights.push({
            title: "Support Available",
            description: "We notice you might be having a challenging time. Our chat support is here to help.",
            icon: "fas fa-heart"
        });
    }
    
    if (userData.activities.filter(a => a.type === 'meditation').length > 0) {
        insights.push({
            title: "Meditation Benefits",
            description: "Regular meditation can improve focus and reduce stress. Great job incorporating it!",
            icon: "fas fa-spa"
        });
    }
    
    return insights;
}

// Goals Management
function loadGoals() {
    const goalsList = document.getElementById('goals-list');
    
    goalsList.innerHTML = userData.goals.map(goal => `
        <div class="goal-item">
            <div class="goal-icon">
                <i class="${goal.icon}"></i>
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
    `).join('');
}

function addNewGoal() {
    const goalTitle = prompt('Enter your new goal:');
    if (goalTitle) {
        const newGoal = {
            id: Date.now(),
            title: goalTitle,
            progress: 0,
            target: 7,
            current: 0,
            icon: 'fas fa-target'
        };
        
        userData.goals.push(newGoal);
        localStorage.setItem('userData', JSON.stringify(userData));
        loadGoals();
    }
}

// Achievements
function loadAchievements() {
    const achievementsGrid = document.getElementById('achievements-grid');
    
    achievementsGrid.innerHTML = userData.achievements.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
        </div>
    `).join('');
}

// Mood Logging
function logMood() {
    const moodModal = document.createElement('div');
    moodModal.className = 'modal';
    moodModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>How are you feeling?</h2>
            </div>
            <div class="modal-body">
                <div class="mood-selector">
                    <button onclick="selectMood(1)" class="mood-btn">😞</button>
                    <button onclick="selectMood(2)" class="mood-btn">😐</button>
                    <button onclick="selectMood(3)" class="mood-btn">🙂</button>
                    <button onclick="selectMood(4)" class="mood-btn">😊</button>
                    <button onclick="selectMood(5)" class="mood-btn">😄</button>
                </div>
                <div class="mood-labels">
                    <span>Very Poor</span>
                    <span>Poor</span>
                    <span>Okay</span>
                    <span>Good</span>
                    <span>Excellent</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(moodModal);
}

function selectMood(rating) {
    const today = new Date().toISOString().split('T')[0];
    
    // Update mood history
    const existingIndex = userData.moodHistory.findIndex(item => item.date === today);
    if (existingIndex >= 0) {
        userData.moodHistory[existingIndex].mood = rating;
    } else {
        userData.moodHistory.push({
            date: today,
            mood: rating,
            activities: 1
        });
    }
    
    // Add activity
    userData.activities.unshift({
        type: 'mood',
        title: 'Mood Check-in',
        time: 'Just now',
        icon: 'fas fa-smile'
    });
    
    // Keep only recent activities
    userData.activities = userData.activities.slice(0, 10);
    
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    moodChart.data.datasets[0].data = userData.moodHistory.map(item => ({
        x: new Date(item.date),
        y: item.mood
    }));
    moodChart.update();
    
    loadActivityList();
    loadInsights();
    
    // Close modal
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
    
    // Show confirmation
    showNotification('Mood logged successfully!');
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function viewMoodHistory() {
    alert('Mood history feature coming soon!');
}

function exportData() {
    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'serenityai-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function viewAllActivity() {
    alert('Full activity history coming soon!');
}

function refreshInsights() {
    loadInsights();
    showNotification('Insights refreshed!');
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Global functions
window.logMood = logMood;
window.selectMood = selectMood;
window.addNewGoal = addNewGoal;
window.viewMoodHistory = viewMoodHistory;
window.exportData = exportData;
window.viewAllActivity = viewAllActivity;
window.refreshInsights = refreshInsights;
window.toggleMobileMenu = toggleMobileMenu; 