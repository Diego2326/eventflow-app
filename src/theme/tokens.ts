export const colors = {
  background: '#F6F4EF',
  surface: '#FFFFFF',
  surfaceSoft: '#F9F8F5',

  navy950: '#0B1627',
  navy900: '#10213A',
  navy800: '#182C47',
  navy700: '#253B58',

  coral600: '#E85F3E',
  coral500: '#F06B49',
  coral100: '#FDEBE5',

  textPrimary: '#142033',
  textSecondary: '#687386',
  textMuted: '#9299A5',

  border: '#E1DED7',
  borderStrong: '#D2CEC5',

  success: '#2F7A4B',
  successSoft: '#EAF7EE',

  warning: '#A56A21',
  warningSoft: '#FFF4DE',

  danger: '#B54C42',
  dangerSoft: '#FDECEA',

  white: '#FFFFFF',
  black: '#000000',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 999,
}

export const typography = {
  display: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
  },

  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800' as const,
    letterSpacing: -0.9,
  },

  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },

  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
  },

  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },

  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700' as const,
  },

  small: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400' as const,
  },

  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700' as const,
  },

  eyebrow: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
}

export const shadows = {
  subtle: {
    shadowColor: '#10213A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  card: {
    shadowColor: '#10213A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  floating: {
    shadowColor: '#10213A',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 7,
  },
}