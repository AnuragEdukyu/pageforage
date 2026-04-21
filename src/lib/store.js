"use client";

const SETTINGS_KEY = "pageforge_settings";

export const DEFAULT_SETTINGS = {
  activeTemplate: "editorial",
  figmaUrl: "",
  figmaToken: "",
  // Design Tokens (Specs provided by user)
  theme: {
    fontPrimary: "Outfit",
    sectionPaddingDesktop: 56,
    sectionPaddingMobile: 20,
    sectionGap: 64,
    titleSizeDesktop: 48,
    titleSizeMobile: 28,
    titleColor: "#025E68",
    subHeadingSizeDesktop: 20,
    subHeadingSizeMobile: 14,
    subHeadingColor: "#525862",
    paragraphSizeDesktop: 20,
    paragraphSizeMobile: 14,
    borderRadius: 16,
    primaryColor: "#4f46e5",
    primaryColorDark: "#818cf8", // Indigo 400
    animationType: "fade", // none, fade, slide, bounce
    showSpacingGuide: false,
  },
  mappingRules: [
    { pattern: "*.md", template: "editorial" },
    { pattern: "*.pdf", template: "whitepaper" },
  ]
};


export function getSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return DEFAULT_SETTINGS;
  
  try {
    const parsed = JSON.parse(saved);
    // Deep merge theme to prevent "undefined" errors for existing users
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: {
        ...DEFAULT_SETTINGS.theme,
        ...(parsed.theme || {})
      }
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}


export function saveSettings(settings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateSettings(updates) {
  const current = getSettings();
  const next = { ...current, ...updates };
  saveSettings(next);
  return next;
}
