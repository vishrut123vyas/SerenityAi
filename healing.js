// Healing Page JavaScript - Refactored & Enhanced
import { 
    submitHealingSession, 
    getHealingHistory,
    isLoggedIn 
} from './api.js';

// Healing state management
const HealingState = {
    audioContext: null,
    oscillator: null,
    gainNode: null,
    isPlaying: false,
    sessionTimer: null,
    sessionStartTime: null,
    currentSession: null,
    sessionHistory: []
};

// Initialize healing features
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Initializing Healing Features...');
    
    // Check authentication
    if (!isLoggedIn()) {
        showMessage('Please log in to access healing sessions.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html#auth-section';
        }, 2000);
        return;
    }
    
    initializeAudioContext();
    setupEventListeners();
    await loadSessionHistory();
    initAccessibility();
    
    console.log('✅ Healing Features initialized!');
});

function initializeAudioContext() {
    try {
        HealingState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🎵 Audio context initialized');
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
        showMessage('Audio features may not work in your browser.', 'warning');
    }
}

function setupEventListeners() {
    // Volume control
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', function() {
            volumeValue.textContent = this.value + '%';
            if (HealingState.gainNode) {
                HealingState.gainNode.gain.value = this.value / 100;
            }
        });
    }

    // Intensity control
    const intensitySlider = document.getElementById('intensity-slider');
    const intensityValue = document.getElementById('intensity-value');
    
    if (intensitySlider && intensityValue) {
        intensitySlider.addEventListener('input', function() {
            intensityValue.textContent = this.value + '%';
            updateLightTherapy();
        });
    }

    // Frequency selector
    const frequencySelect = document.getElementById('frequency-select');
    if (frequencySelect) {
        frequencySelect.addEventListener('change', function() {
            if (HealingState.isPlaying && HealingState.oscillator) {
                HealingState.oscillator.frequency.value = parseInt(this.value);
            }
        });
    }

    // Light mode selector
    const lightModeSelect = document.getElementById('light-mode-select');
    if (lightModeSelect) {
        lightModeSelect.addEventListener('change', function() {
            updateLightTherapy();
        });
    }
    
    // Session control buttons
    const playSoundBtn = document.getElementById('play-sound');
    const startLightBtn = document.getElementById('start-light');
    const startMeditationBtn = document.getElementById('start-meditation');
    
    if (playSoundBtn) {
        playSoundBtn.addEventListener('click', toggleSound);
    }
    
    if (startLightBtn) {
        startLightBtn.addEventListener('click', toggleLight);
    }
    
    if (startMeditationBtn) {
        startMeditationBtn.addEventListener('click', startMeditation);
    }
    
    // Active session controls
    const pauseBtn = document.getElementById('pause-session-btn');
    const stopBtn = document.getElementById('stop-session-btn');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseSession);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopSession);
    }
}

// ===== SOUND THERAPY =====
function toggleSound() {
    const playButton = document.getElementById('play-sound');
    const timer = document.getElementById('sound-timer');
    
    if (!HealingState.isPlaying) {
        startSoundTherapy();
        if (playButton) {
            playButton.innerHTML = '<i class="fas fa-pause"></i> Pause Session';
        }
        startTimer('sound-timer');
    } else {
        stopSoundTherapy();
        if (playButton) {
            playButton.innerHTML = '<i class="fas fa-play"></i> Start Session';
        }
        stopTimer();
    }
}

function startSoundTherapy() {
    if (!HealingState.audioContext) {
        showMessage('Audio not supported in your browser. Please try a different browser.', 'error');
        return;
    }

    try {
        const frequencySelect = document.getElementById('frequency-select');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (!frequencySelect || !volumeSlider) {
            showMessage('Sound therapy controls not found.', 'error');
            return;
        }
        
        const frequency = parseInt(frequencySelect.value);
        const volume = parseInt(volumeSlider.value) / 100;

        HealingState.oscillator = HealingState.audioContext.createOscillator();
        HealingState.gainNode = HealingState.audioContext.createGain();

        HealingState.oscillator.connect(HealingState.gainNode);
        HealingState.gainNode.connect(HealingState.audioContext.destination);

        HealingState.oscillator.frequency.value = frequency;
        HealingState.oscillator.type = 'sine';
        HealingState.gainNode.gain.value = volume;

        HealingState.oscillator.start();
        HealingState.isPlaying = true;
        HealingState.sessionStartTime = Date.now();
        HealingState.currentSession = {
            type: 'sound',
            frequency: frequency,
            volume: volume,
            startTime: HealingState.sessionStartTime
        };
        
        showActiveSession('Sound Therapy', `Playing ${frequency}Hz frequency`);
        showMessage('Sound therapy session started.', 'success');
        
    } catch (error) {
        console.error('Error starting sound therapy:', error);
        showMessage('Failed to start sound therapy. Please try again.', 'error');
    }
}

function stopSoundTherapy() {
    if (HealingState.oscillator) {
        try {
            HealingState.oscillator.stop();
            HealingState.oscillator.disconnect();
            HealingState.oscillator = null;
            HealingState.gainNode = null;
        } catch (error) {
            console.error('Error stopping oscillator:', error);
        }
    }
    
    HealingState.isPlaying = false;
    stopTimer();
    
    if (HealingState.currentSession) {
        endSession();
    }
}

// ===== LIGHT THERAPY =====
function toggleLight() {
    const startButton = document.getElementById('start-light');
    const timer = document.getElementById('light-timer');
    
    if (!HealingState.isPlaying) {
        startLightTherapy();
        if (startButton) {
            startButton.innerHTML = '<i class="fas fa-pause"></i> Pause Therapy';
        }
        startTimer('light-timer');
    } else {
        stopLightTherapy();
        if (startButton) {
            startButton.innerHTML = '<i class="fas fa-play"></i> Start Therapy';
        }
        stopTimer();
    }
}

function startLightTherapy() {
    const lightModeSelect = document.getElementById('light-mode-select');
    const intensitySlider = document.getElementById('intensity-slider');
    
    if (!lightModeSelect || !intensitySlider) {
        showMessage('Light therapy controls not found.', 'error');
        return;
    }
    
    const mode = lightModeSelect.value;
    const intensity = parseInt(intensitySlider.value);
    
    HealingState.isPlaying = true;
    HealingState.sessionStartTime = Date.now();
    HealingState.currentSession = {
        type: 'light',
        mode: mode,
        intensity: intensity,
        startTime: HealingState.sessionStartTime
    };
    
    updateLightTherapy();
    showActiveSession('Light Therapy', `${mode} mode at ${intensity}% intensity`);
    showMessage('Light therapy session started.', 'success');
}

function stopLightTherapy() {
    HealingState.isPlaying = false;
    stopTimer();
    
    // Reset light animation
    const lightAnimation = document.getElementById('light-animation');
    if (lightAnimation) {
        lightAnimation.style.background = 'transparent';
    }
    
    if (HealingState.currentSession) {
        endSession();
    }
}

function updateLightTherapy() {
    if (!HealingState.isPlaying) return;
    
    const lightModeSelect = document.getElementById('light-mode-select');
    const intensitySlider = document.getElementById('intensity-slider');
    const lightAnimation = document.getElementById('light-animation');
    
    if (!lightModeSelect || !intensitySlider || !lightAnimation) return;
    
    const mode = lightModeSelect.value;
    const intensity = parseInt(intensitySlider.value) / 100;
    
    const colors = {
        calm: `rgba(59, 130, 246, ${intensity})`,
        warm: `rgba(245, 158, 11, ${intensity})`,
        nature: `rgba(34, 197, 94, ${intensity})`,
        sunset: `rgba(236, 72, 153, ${intensity})`,
        ocean: `rgba(20, 184, 166, ${intensity})`
    };
    
    const color = colors[mode] || colors.calm;
    lightAnimation.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
    
    // Add breathing animation
    lightAnimation.style.animation = `breathing ${4 + (1 - intensity) * 2}s ease-in-out infinite`;
}

// ===== MEDITATION =====
function startMeditation() {
    const meditationSelect = document.getElementById('meditation-select');
    const durationSelect = document.getElementById('duration-select');
    
    if (!meditationSelect || !durationSelect) {
        showMessage('Meditation controls not found.', 'error');
        return;
    }
    
    const type = meditationSelect.value;
    const duration = parseInt(durationSelect.value);
    
    HealingState.isPlaying = true;
    HealingState.sessionStartTime = Date.now();
    HealingState.currentSession = {
        type: 'meditation',
        meditationType: type,
        duration: duration,
        startTime: HealingState.sessionStartTime
    };
    
    startMeditationVisualization(type);
    startTimer('meditation-timer', duration * 60);
    
    const sessionTitle = getSessionTitle(type);
    showActiveSession('Guided Meditation', `${sessionTitle} - ${duration} minutes`);
    showMessage('Meditation session started.', 'success');
}

function startMeditationVisualization(type) {
    const visualization = document.getElementById('visualization');
    if (!visualization) return;
    
    const visualizations = {
        breathing: `
            <div class="breathing-circle">
                <div class="breath-in">Breathe In</div>
                <div class="breath-out">Breathe Out</div>
            </div>
        `,
        mindfulness: `
            <div class="mindfulness-visual">
                <div class="floating-elements">
                    <div class="element"></div>
                    <div class="element"></div>
                    <div class="element"></div>
                </div>
            </div>
        `,
        'loving-kindness': `
            <div class="loving-kindness-visual">
                <div class="heart-container">
                    <div class="heart"></div>
                    <div class="heart"></div>
                    <div class="heart"></div>
                </div>
            </div>
        `,
        'body-scan': `
            <div class="body-scan-visual">
                <div class="body-outline">
                    <div class="scan-point"></div>
                </div>
            </div>
        `,
        sleep: `
            <div class="sleep-visual">
                <div class="stars">
                    <div class="star"></div>
                    <div class="star"></div>
                    <div class="star"></div>
                </div>
                <div class="moon"></div>
            </div>
        `
    };
    
    visualization.innerHTML = visualizations[type] || visualizations.breathing;
}

// ===== TIMER FUNCTIONS =====
function startTimer(timerId, duration = null) {
    const timerElement = document.getElementById(timerId);
    if (!timerElement) return;
    
    const startTime = Date.now();
    const endTime = duration ? startTime + (duration * 1000) : null;
    
    HealingState.sessionTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        
        if (endTime && Date.now() >= endTime) {
            stopTimer();
            endSession();
            showSessionComplete();
            return;
        }
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (HealingState.sessionTimer) {
        clearInterval(HealingState.sessionTimer);
        HealingState.sessionTimer = null;
    }
}

// ===== SESSION MANAGEMENT =====
function showActiveSession(title, description) {
    const activeSession = document.getElementById('active-session');
    const sessionTitle = document.getElementById('session-title');
    const sessionDescription = document.getElementById('session-description');
    
    if (activeSession) {
        activeSession.style.display = 'block';
    }
    
    if (sessionTitle) {
        sessionTitle.textContent = title;
    }
    
    if (sessionDescription) {
        sessionDescription.textContent = description;
    }
}

function hideActiveSession() {
    const activeSession = document.getElementById('active-session');
    if (activeSession) {
        activeSession.style.display = 'none';
    }
}

function pauseSession() {
    if (HealingState.isPlaying) {
        HealingState.isPlaying = false;
        stopTimer();
        
        if (HealingState.oscillator) {
            HealingState.oscillator.stop();
        }
        
        showMessage('Session paused.', 'info');
    } else {
        HealingState.isPlaying = true;
        
        if (HealingState.currentSession?.type === 'sound') {
            startSoundTherapy();
        }
        
        startTimer('sound-timer');
        showMessage('Session resumed.', 'info');
    }
}

function stopSession() {
    if (HealingState.currentSession?.type === 'sound') {
        stopSoundTherapy();
    } else if (HealingState.currentSession?.type === 'light') {
        stopLightTherapy();
    } else {
        HealingState.isPlaying = false;
        stopTimer();
    }
    
    hideActiveSession();
    endSession();
}

function endSession() {
    if (!HealingState.currentSession) return;
    
    const sessionDuration = Math.floor((Date.now() - HealingState.currentSession.startTime) / 1000);
    const sessionData = {
        ...HealingState.currentSession,
        duration: sessionDuration,
        endTime: Date.now()
    };
    
    saveSession(sessionData);
    HealingState.currentSession = null;
}

function showSessionComplete() {
    showMessage('Session completed! How do you feel?', 'success');
    
    // Show feedback section
    const feedbackSection = document.getElementById('feedback-section');
    if (feedbackSection) {
        feedbackSection.style.display = 'block';
    }
}

// ===== SESSION STORAGE =====
async function saveSession(sessionData) {
    try {
        const response = await submitHealingSession(sessionData);
        if (response.success) {
            console.log('Session saved successfully');
            await loadSessionHistory(); // Refresh history
        } else {
            console.error('Failed to save session:', response.message);
        }
    } catch (error) {
        console.error('Error saving session:', error);
        // Fallback to localStorage
        saveSessionToLocalStorage(sessionData);
    }
}

function saveSessionToLocalStorage(sessionData) {
    try {
        const sessions = JSON.parse(localStorage.getItem('healingSessions') || '[]');
        sessions.push(sessionData);
        localStorage.setItem('healingSessions', JSON.stringify(sessions));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

async function loadSessionHistory() {
    try {
        const response = await getHealingHistory();
        if (response.success) {
            HealingState.sessionHistory = response.sessions || [];
        } else {
            // Fallback to localStorage
            HealingState.sessionHistory = JSON.parse(localStorage.getItem('healingSessions') || '[]');
        }
        
        displaySessionHistory();
    } catch (error) {
        console.error('Error loading session history:', error);
        // Fallback to localStorage
        HealingState.sessionHistory = JSON.parse(localStorage.getItem('healingSessions') || '[]');
        displaySessionHistory();
    }
}

function displaySessionHistory() {
    const historyContainer = document.getElementById('session-history');
    if (!historyContainer) return;
    
    if (HealingState.sessionHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>No sessions yet. Start your first healing session!</p>
            </div>
        `;
        return;
    }
    
    const recentSessions = HealingState.sessionHistory
        .slice(-6) // Show last 6 sessions
        .reverse(); // Most recent first
    
    historyContainer.innerHTML = recentSessions.map(session => `
        <div class="history-card">
            <div class="history-icon">
                <i class="${getSessionIcon(session.type)}"></i>
            </div>
            <div class="history-details">
                <h4>${getSessionTitle(session.type)}</h4>
                <p>${formatDuration(session.duration)} • ${formatDate(session.startTime)}</p>
                ${session.frequency ? `<small>${session.frequency}Hz</small>` : ''}
                ${session.mode ? `<small>${session.mode} mode</small>` : ''}
                ${session.meditationType ? `<small>${session.meditationType}</small>` : ''}
            </div>
        </div>
    `).join('');
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

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== ACCESSIBILITY =====
function initAccessibility() {
    // Add ARIA labels to controls
    const volumeSlider = document.getElementById('volume-slider');
    const intensitySlider = document.getElementById('intensity-slider');
    
    if (volumeSlider) {
        volumeSlider.setAttribute('aria-label', 'Volume control');
    }
    
    if (intensitySlider) {
        intensitySlider.setAttribute('aria-label', 'Light intensity control');
    }
    
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#healing-dashboard';
    skipLink.textContent = 'Skip to healing controls';
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
    const mainContent = document.querySelector('.healing-dashboard');
    if (mainContent) {
        mainContent.id = 'healing-dashboard';
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
window.toggleSound = toggleSound;
window.toggleLight = toggleLight;
window.startMeditation = startMeditation;
window.pauseSession = pauseSession;
window.stopSession = stopSession;
window.closeModal = function() {
    const modal = document.getElementById('healing-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};
window.toggleMobileMenu = function() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    if (navMenu && navToggle) {
        navToggle.click();
    }
}; 