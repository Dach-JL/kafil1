export const palette = {
  gold: '#D4AF37',       // Metallic Gold
  goldLight: '#F5E6BE',  // Light Gold for tints
  goldDark: '#996515',   // Golden Brown
  navy: '#0A1128',       // Deep Navy Background
  navyLight: '#1C2541',  // Lighter Navy for surfaces
  white: '#FFFFFF',      // Surface White
  black: '#1A1A1A',      // Dark Text
  gray: '#94A3B8',       // Muted Gray
  border: '#1E293B',     // Dark Border
  warmTint: '#FFF9F0',   // Light warm tint
};

export const colors = {
  // Brand Tokens
  primary: palette.gold,
  primaryDark: palette.goldDark,
  background: palette.navy,
  surface: palette.navyLight,
  accent: palette.gold,
  
  // Text Tokens
  textPrimary: palette.white,           // Default text for navy theme
  textSecondary: '#94A3B8',             // Muted text
  textOnPrimary: palette.white,         // For primary buttons
  textInverse: palette.white,           // Consistent inverse
  textAccent: palette.gold,             // Gold highlights
  
  // UI Elements
  border: '#334155',                    // Refined border for navy
  cardBackground: palette.navyLight,
  evidenceBackground: 'rgba(245, 230, 190, 0.05)', // Subtle gold tint on dark
  
  // Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  // Navigation
  tabIconDefault: '#64748B',
  tabIconSelected: palette.gold,
};

