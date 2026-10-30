import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS } from '@/styles/global';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const AppCard = ({ children, style, onPress, variant = 'default' }: AppCardProps) => {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...(variant === 'elevated' ? SHADOWS.md : variant === 'outlined'
      ? { borderWidth: 1, borderColor: theme.colors.outline }
      : SHADOWS.sm),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};

// Stat Card
interface StatCardProps {
  icon: React.ReactNode | string;
  label: string;
  value: number | string;
  color: string;
  onPress?: () => void;
}

export const StatCard = ({ icon, label, value, color, onPress }: StatCardProps) => {
  const theme = useTheme();

  const content = (
    <View style={styles.statContent}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {typeof icon === 'string' ? (
          <Text style={styles.statIconText}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
      </View>
      <View style={[styles.statDot, { backgroundColor: color }]} />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.statCard,
          { backgroundColor: theme.colors.surface, borderLeftColor: color },
          SHADOWS.sm,
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[
      styles.statCard,
      { backgroundColor: theme.colors.surface, borderLeftColor: color },
      SHADOWS.sm,
    ]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 22,
  },
  statInfo: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});