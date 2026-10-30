import { StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from './global';

/**
 * Shared layout for the CRUD list screens (users, profiles, secretariats).
 * Colors stay inline so light/dark themes keep working.
 */
export const listStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  toolbar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  itemCard: {
    padding: SPACING.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  footerButton: {
    flex: 1,
  },
  errorBox: {
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
});
