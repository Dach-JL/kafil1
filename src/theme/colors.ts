export const palette = {
  gold: '#C89B3C',       // CharityTrust Warm Gold
  goldLight: 'rgba(200, 155, 60, 0.15)', // Light Gold tint
  goldDark: '#A87E2A',   // Darker gold
  goldBadgeBg: '#F5E6BE', // Gold badge background
  cream: '#FFF5E6',      // Main Screen Background
  creamLight: '#FFF9F0',  // Light warm tint for sections
  white: '#FFFFFF',      // Card/Surface backgrounds
  navy: '#0F1B2D',       // Dark Navy for text and hero cards
  navyLight: '#1C2541',  // Muted navy
  gray: '#6B7280',       // Muted text gray
  grayLight: '#F3F4F6',  // Light gray for fields/tracks
};

export const colors = {
  // Brand Tokens
  primary: palette.gold,
  primaryDark: palette.goldDark,
  background: palette.cream,
  surface: palette.white,
  accent: palette.gold,
  
  // Text Tokens
  textPrimary: palette.navy,            // Dark navy text on cream/white
  textSecondary: palette.gray,          // Muted gray text
  textOnPrimary: palette.white,         // White text on primary buttons
  textInverse: palette.navy,            // Matching dark text for compatibility
  textAccent: palette.gold,             // Gold highlights
  textOnDark: palette.white,            // White text on navy background sections
  
  // UI Elements
  border: palette.goldLight,            // Gold-tinted border
  cardBackground: palette.white,
  evidenceBackground: palette.creamLight,
  
  // Status
  success: '#2D6A4F',                   // Humanitarian Deep Green
  error: '#B91C1C',                     // Humanitatian Deep Red
  warning: '#D97706',

  // Navigation
  tabIconDefault: '#9CA3AF',
  tabIconSelected: palette.gold,
};


