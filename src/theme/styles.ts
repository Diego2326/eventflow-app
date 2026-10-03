import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F7F5F0',
  },

  authScreen: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },

  authScroll: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 22,
  },

  authContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  screen: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    backgroundColor: '#F7F5F0',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },

  brand: {
    fontSize: 23,
    fontWeight: '800',
    color: '#14243B',
    letterSpacing: -0.8,
  },

  title: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '700',
    color: '#14243B',
    marginBottom: 12,
    letterSpacing: -1.1,
  },

  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#14243B',
    letterSpacing: -1,
  },

  muted: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
  },

  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D4CC',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 14,
    fontSize: 16,
    color: '#1F2937',
  },

  button: {
    width: '100%',
    backgroundColor: '#14243B',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 22,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },

  centerLink: {
    color: '#14243B',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
  },

  loginLinks: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },

  notice: {
    color: '#25643D',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },

  demoNote: {
    color: '#8A5428',
    backgroundColor: '#FFF3DF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },

  error: {
    color: '#A53B35',
    backgroundColor: '#FDEDEC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },

  link: {
    color: '#E85F3E',
    fontWeight: '700',
    fontSize: 14,
  },

  kicker: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: '#E85F3E',
    fontWeight: '800',
    marginBottom: 7,
    textTransform: 'uppercase',
  },

  list: {
    gap: 12,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3DED5',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  pill: {
    alignSelf: 'flex-start',
    fontSize: 10,
    color: '#B94B32',
    backgroundColor: '#FFF0EA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  section: {
    fontSize: 19,
    fontWeight: '800',
    color: '#253044',
    marginTop: 30,
    marginBottom: 15,
    letterSpacing: -0.3,
  },

  featured: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  feature: {
    width: '31%',
    backgroundColor: '#14243B',
    padding: 14,
    borderRadius: 12,
    minHeight: 105,
    justifyContent: 'space-between',
  },

  icon: {
    color: '#F3B59F',
    fontWeight: '800',
    fontSize: 12,
  },

  featureText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },

  module: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E3DED5',
  },

  moduleIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleCode: {
    fontWeight: '800',
    color: '#B94B32',
    fontSize: 11,
    letterSpacing: 0.4,
  },

  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#273246',
    marginBottom: 2,
  },

  chevron: {
    marginLeft: 'auto',
    fontSize: 26,
    color: '#9CA3AF',
  },
})