// Production Configuration for SerenityAI Frontend
// Update these URLs with your actual deployment URLs

window.SERENITY_API_URL = 'https://your-backend-url.com/api'; // Update with your backend URL

// Optional: Analytics and monitoring
window.ANALYTICS_ID = ''; // Add Google Analytics ID if needed
window.SENTRY_DSN = ''; // Add Sentry DSN for error tracking if needed

// Feature flags for production
window.FEATURES = {
  chat: true,
  assessment: true,
  healing: true,
  analytics: true
};
