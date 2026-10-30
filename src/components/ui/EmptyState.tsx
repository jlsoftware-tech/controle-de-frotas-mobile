import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SPACING, FONT_SIZE, RADIUS } from '@/styles/global';

interface EmptyStateProps {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  emoji = '📭',
  icon,
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
          {icon}
        </View>
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
            + {actionTitle}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emoji: {
    fontSize: 52,
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});