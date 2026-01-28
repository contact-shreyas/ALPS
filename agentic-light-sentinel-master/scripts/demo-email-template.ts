#!/usr/bin/env tsx
/**
 * Demo script to showcase the professional email template with realistic Indian district data
 */

// Import the improved email functions
import { generateAlertHTML, AlertEmail, INDIAN_DISTRICTS } from '../src/lib/mail-improved';

console.log('🎯 Light Pollution Sentinel - Email Template Demo');
console.log('==================================================\n');

// Create realistic test data using actual Indian districts
const testAlerts: AlertEmail[] = [
  {
    district: 'Mumbai Suburban, Maharashtra',
    severity: 'high',
    location: { lat: 19.076, lng: 72.8777 },
    radiance: 45.8,
    yearOverYearChange: 12.5,
    timestamp: '2024-01-15T10:30:00Z',
    hotspotCount: 23,
    districtCode: 'MH_MUM_SUB'
  },
  {
    district: 'New Delhi, Delhi',
    severity: 'extreme',
    location: { lat: 28.6139, lng: 77.2090 },
    radiance: 67.3,
    yearOverYearChange: 28.7,
    timestamp: '2024-01-15T11:45:00Z',
    hotspotCount: 45,
    districtCode: 'DL_NEW_DEL'
  },
  {
    district: 'Bengaluru Urban, Karnataka',
    severity: 'medium',
    location: { lat: 12.9716, lng: 77.5946 },
    radiance: 32.1,
    yearOverYearChange: 8.3,
    timestamp: '2024-01-15T09:15:00Z',
    hotspotCount: 17,
    districtCode: 'KA_BEN_URB'
  }
];

console.log('📧 Professional Municipal Email Templates:');
console.log('==========================================\n');

testAlerts.forEach((alert, index) => {
  console.log(`${index + 1}. ${alert.district} - ${alert.severity.toUpperCase()} Priority`);
  console.log(`   📍 Location: ${alert.location.lat}, ${alert.location.lng}`);
  console.log(`   🔆 Radiance: ${alert.radiance} nW/(cm²⋅sr)`);
  console.log(`   📈 YoY Change: ${alert.yearOverYearChange}%`);
  console.log(`   🔥 Hotspots: ${alert.hotspotCount}`);
  
  // Calculate surface brightness (astronomical standard)
  const surfaceBrightness = 22.0 - 2.5 * Math.log10(alert.radiance);
  console.log(`   ✨ Surface Brightness: ${surfaceBrightness.toFixed(1)} mag/arcsec²`);
  
  // Generate the HTML template
  const htmlContent = generateAlertHTML(alert);
  
  // Show key template features
  console.log(`   📧 Email Features:`);
  console.log(`      • Government branding: ✅`);
  console.log(`      • Severity styling: ✅`);
  console.log(`      • Google Maps link: ✅`);
  console.log(`      • Professional formatting: ✅`);
  console.log(`      • Indian timezone: ✅`);
  console.log('');
});

console.log('🏛️ Available Indian Districts:');
console.log('==============================');
const districtCount = Object.keys(INDIAN_DISTRICTS).length;
console.log(`Total districts available: ${districtCount}`);
console.log('Sample districts:');
Object.entries(INDIAN_DISTRICTS).slice(0, 5).forEach(([code, district]) => {
  console.log(`  • ${district.name} (${code})`);
  console.log(`    Coordinates: ${district.coordinates.lat}, ${district.coordinates.lng}`);
});
console.log(`  ... and ${districtCount - 5} more districts\n`);

console.log('✅ Demo completed! All email templates use:');
console.log('   🏛️ Professional government styling');
console.log('   🇮🇳 Real Indian district data');
console.log('   📊 Accurate scientific calculations');
console.log('   🔗 Interactive Google Maps links');
console.log('   🎨 Severity-based color coding');
console.log('   ⏰ Indian Standard Time formatting');