import { Typography as BaseTypography } from '../constants/Typography';

export const typography = {
  fontFamily: BaseTypography.fontFamily,
  size: {
    title: 24,
    section: 18,
    body: 14,
    caption: 12,
  },
  weight: {
    regular: BaseTypography.fontFamily.regular,
    semibold: BaseTypography.fontFamily.medium,
    bold: BaseTypography.fontFamily.bold,
  },
};

export const textStyles = {
  title: {
    fontSize: typography.size.title,
    fontFamily: typography.fontFamily.heading, // Using Outfit for titles for premium feel
  },
  section: {
    fontSize: typography.size.section,
    fontFamily: typography.fontFamily.medium,
  },
  body: {
    fontSize: typography.size.body,
    fontFamily: typography.fontFamily.regular,
  },
  caption: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontFamily.regular,
  },
};
