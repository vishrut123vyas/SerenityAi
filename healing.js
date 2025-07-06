// Healing Page JavaScript

let audioContext;
let oscillator;
let gainNode;
let isPlaying = false;
let sessionTimer;
let sessionStartTime;

// Initialize healing features
document.addEventListener('DOMContentLoaded', function() {
    initializeAudioContext();
    setupEventListeners();
    loadSessionHistory();
});

function initializeAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function setupEventListeners() {
    // Volume control
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    volumeSlider.addEventListener('input', function() {
        volumeValue.textContent = this.value + '%';
        if (gainNode) {
            gainNode.gain.value = this.value / 100;
        }
    });

    // Intensity control
    const intensitySlider = document.getElementById('intensity-slider');
    const intensityValue = document.getElementById('intensity-value');
    
    intensitySlider.addEventListener('input', function() {
        intensityValue.textContent = this.value + '%';
        updateLightTherapy();
    });

    // Frequency selector
    document.getElementById('frequency-select').addEventListener('change', function() {
        if (isPlaying && oscillator) {
            oscillator.frequency.value = parseInt(this.value);
        }
    });

    // Light mode selector
    document.getElementById('light-mode-select').addEventListener('change', function() {
        updateLightTherapy();
    });
}

// Sound Therapy Functions
function toggleSound() {
    const playButton = document.getElementById('play-sound');
    const timer = document.getElementById('sound-timer');
    
    if (!isPlaying) {
        startSoundTherapy();
        playButton.innerHTML = '<i class="fas fa-pause"></i> Pause Session';
        startTimer('sound-timer');
    } else {
        stopSoundTherapy();
        playButton.innerHTML = '<i class="fas fa-play"></i> Start Session';
        stopTimer();
    }
}

function startSoundTherapy() {
    if (!audioContext) {
        alert('Audio not supported in your browser');
        return;
    }

    const frequency = parseInt(document.getElementById('frequency-select').value);
    const volume = parseInt(document.getElementById('volume-slider').value) / 100;

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = volume;

    oscillator.start();
    isPlaying = true;
    sessionStartTime = Date.now();
}

function stopSoundTherapy() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
        gainNode = null;
    }
    isPlaying = false;
    stopTimer();
}

// Light Therapy Functions
function toggleLight() {
    const lightButton = document.getElementById('start-light');
    
    if (!isPlaying) {
        startLightTherapy();
        lightButton.innerHTML = '<i class="fas fa-pause"></i> Pause Therapy';
        startTimer('light-timer');
    } else {
        stopLightTherapy();
        lightButton.innerHTML = '<i class="fas fa-play"></i> Start Therapy';
        stopTimer();
    }
}

function startLightTherapy() {
    isPlaying = true;
    sessionStartTime = Date.now();
    updateLightTherapy();
    showActiveSession('Light Therapy', 'Experience the calming effects of adaptive light therapy');
}

function stopLightTherapy() {
    isPlaying = false;
    stopTimer();
    hideActiveSession();
    document.body.style.background = '';
}

function updateLightTherapy() {
    if (!isPlaying) return;

    const mode = document.getElementById('light-mode-select').value;
    const intensity = parseInt(document.getElementById('intensity-slider').value) / 100;
    
    let color;
    switch(mode) {
        case 'calm':
            color = `rgba(59, 130, 246, ${intensity * 0.3})`; // Blue
            break;
        case 'warm':
            color = `rgba(245, 158, 11, ${intensity * 0.3})`; // Orange
            break;
        case 'nature':
            color = `rgba(34, 197, 94, ${intensity * 0.3})`; // Green
            break;
        case 'sunset':
            color = `rgba(236, 72, 153, ${intensity * 0.3})`; // Pink
            break;
        case 'ocean':
            color = `rgba(20, 184, 166, ${intensity * 0.3})`; // Teal
            break;
    }
    
    document.body.style.background = `linear-gradient(135deg, ${color}, transparent)`;
}

// Meditation Functions
function startMeditation() {
    const sessionType = document.getElementById('meditation-select').value;
    const duration = parseInt(document.getElementById('duration-select').value);
    
    isPlaying = true;
    sessionStartTime = Date.now();
    
    showActiveSession('Guided Meditation', `Enjoy a ${duration}-minute ${sessionType} meditation session`);
    startTimer('meditation-timer', duration * 60);
    
    // Start meditation visualization
    startMeditationVisualization(sessionType);
}

function startMeditationVisualization(type) {
    const visualization = document.getElementById('visualization');
    
    switch(type) {
        case 'breathing':
            visualization.innerHTML = `
                <div class="breathing-circle">
                    <div class="breath-in">Breathe In</div>
                    <div class="breath-out">Breathe Out</div>
                </div>
            `;
            break;
        case 'mindfulness':
            visualization.innerHTML = `
                <div class="mindfulness-visual">
                    <div class="floating-elements">
                        <div class="element">🌿</div>
                        <div class="element">🌸</div>
                        <div class="element">🍃</div>
                    </div>
                </div>
            `;
            break;
        default:
            visualization.innerHTML = `
                <div class="meditation-visual">
                    <div class="peace-symbol">☮️</div>
                    <p>Find your center</p>
                </div>
            `;
    }
}

// Timer Functions
function startTimer(timerId, duration = null) {
    const timerElement = document.getElementById(timerId);
    let seconds = 0;
    
    sessionTimer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (duration && seconds >= duration) {
            stopTimer();
            endSession();
        }
    }, 1000);
}

function stopTimer() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
}

// Session Management
function showActiveSession(title, description) {
    const activeSession = document.getElementById('active-session');
    const sessionTitle = document.getElementById('session-title');
    const sessionDescription = document.getElementById('session-description');
    
    sessionTitle.textContent = title;
    sessionDescription.textContent = description;
    activeSession.style.display = 'block';
}

function hideActiveSession() {
    document.getElementById('active-session').style.display = 'none';
}

function pauseSession() {
    if (isPlaying) {
        if (oscillator) {
            oscillator.suspend();
        }
        stopTimer();
    }
}

function stopSession() {
    stopSoundTherapy();
    stopLightTherapy();
    hideActiveSession();
    saveSession();
}

function endSession() {
    stopSession();
    showSessionComplete();
}

function showSessionComplete() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Session Complete</h2>
            </div>
            <div class="modal-body">
                <p>Great job! Your healing session has been completed. How are you feeling?</p>
                <div class="mood-check">
                    <button onclick="rateMood(1)">😞</button>
                    <button onclick="rateMood(2)">😐</button>
                    <button onclick="rateMood(3)">🙂</button>
                    <button onclick="rateMood(4)">😊</button>
                    <button onclick="rateMood(5)">😄</button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">Continue</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function rateMood(rating) {
    // Save mood rating
    const sessionData = {
        type: getCurrentSessionType(),
        duration: Math.floor((Date.now() - sessionStartTime) / 1000),
        moodRating: rating,
        timestamp: new Date().toISOString()
    };
    
    saveSessionData(sessionData);
    closeModal();
}

function getCurrentSessionType() {
    if (oscillator) return 'sound';
    if (document.getElementById('light-mode-select').value) return 'light';
    return 'meditation';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Session History
function saveSession() {
    const sessionData = {
        type: getCurrentSessionType(),
        duration: Math.floor((Date.now() - sessionStartTime) / 1000),
        timestamp: new Date().toISOString()
    };
    
    saveSessionData(sessionData);
}

function saveSessionData(data) {
    let sessions = JSON.parse(localStorage.getItem('healingSessions') || '[]');
    sessions.push(data);
    localStorage.setItem('healingSessions', JSON.stringify(sessions));
    loadSessionHistory();
}

function loadSessionHistory() {
    const sessions = JSON.parse(localStorage.getItem('healingSessions') || '[]');
    const historyContainer = document.getElementById('session-history');
    
    if (sessions.length === 0) {
        historyContainer.innerHTML = '<p class="no-sessions">No sessions yet. Start your first healing session!</p>';
        return;
    }
    
    const recentSessions = sessions.slice(-6).reverse();
    historyContainer.innerHTML = recentSessions.map(session => `
        <div class="session-card">
            <div class="session-icon">
                <i class="fas ${getSessionIcon(session.type)}"></i>
            </div>
            <div class="session-info">
                <h4>${getSessionTitle(session.type)}</h4>
                <p>${formatDuration(session.duration)} • ${formatDate(session.timestamp)}</p>
                ${session.moodRating ? `<div class="mood-rating">Mood: ${'😊'.repeat(session.moodRating)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function getSessionIcon(type) {
    switch(type) {
        case 'sound': return 'fa-music';
        case 'light': return 'fa-lightbulb';
        case 'meditation': return 'fa-spa';
        default: return 'fa-heart';
    }
}

function getSessionTitle(type) {
    switch(type) {
        case 'sound': return 'Sound Therapy';
        case 'light': return 'Light Therapy';
        case 'meditation': return 'Meditation';
        default: return 'Healing Session';
    }
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Global functions
window.toggleSound = toggleSound;
window.toggleLight = toggleLight;
window.startMeditation = startMeditation;
window.pauseSession = pauseSession;
window.stopSession = stopSession;
window.rateMood = rateMood;
window.closeModal = closeModal;
window.toggleMobileMenu = toggleMobileMenu; 