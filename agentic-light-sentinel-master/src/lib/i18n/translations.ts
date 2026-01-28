export const defaultLocale = 'en';

export const locales = ['en', 'hi', 'ta', 'te', 'kn', 'ml'] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം'
};

interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  [locale: string]: Translation;
}

// Example translations for key features
export const translations: Translations = {
  en: {
    common: {
      lightPollution: 'Light Pollution',
      dashboard: 'Dashboard',
      alerts: 'Alerts',
      insights: 'Insights',
      settings: 'Settings'
    },
    metrics: {
      radiance: 'Radiance',
      hotspots: 'Hotspots',
      energySaved: 'Energy Saved',
      co2Reduced: 'CO2 Reduced'
    },
    alerts: {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
      newAlert: 'New Alert',
      acknowledge: 'Acknowledge'
    }
  },
  hi: {
    common: {
      lightPollution: 'प्रकाश प्रदूषण',
      dashboard: 'डैशबोर्ड',
      alerts: 'चेतावनियाँ',
      insights: 'अंतर्दृष्टि',
      settings: 'सेटिंग्स'
    },
    metrics: {
      radiance: 'विकिरण',
      hotspots: 'हॉटस्पॉट',
      energySaved: 'बचाई गई ऊर्जा',
      co2Reduced: 'CO2 में कमी'
    },
    alerts: {
      high: 'उच्च प्राथमिकता',
      medium: 'मध्यम प्राथमिकता',
      low: 'निम्न प्राथमिकता',
      newAlert: 'नई चेतावनी',
      acknowledge: 'स्वीकार करें'
    }
  },
  // Add other language translations similarly
};

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let translation: any = translations[locale];
  
  for (const k of keys) {
    if (!translation[k]) return key;
    translation = translation[k];
  }
  
  return translation as string;
}