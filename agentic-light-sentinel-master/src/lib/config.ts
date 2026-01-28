export const agentConfig = {
  // Thresholds for hotspot detection
  hotspots: {
    minBrightness: 15, // nW/cm²/sr
    minDelta: 5, // year-over-year change
    severityLevels: {
      low: 15,
      medium: 20,
      high: 25,
      extreme: 30
    }
  },
  
  // Autonomous loop timing (in minutes)
  loopIntervals: {
    sense: 60, // Fetch new VIIRS data hourly
    reason: 15, // Run hotspot detection every 15min
    act: 30,   // Check & send notifications every 30min
    learn: 360 // Update ML models every 6 hours
  },

  // Email notification settings  
  notifications: {
    fromEmail: "lightsentinel@example.com",
    reportSubject: "Light Pollution Dashboard Report",
    alertSubject: "New Light Pollution Hotspot Detected",
    dailyDigest: true
  }
};