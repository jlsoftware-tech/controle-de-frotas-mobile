import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS } from '@/styles/global';

type ButtonVariant = 'filled' | 'outlined' | 'ghost' | 'danger';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function AppButton({
  title,
  onPress,
  variant = 'filled',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  size = 'md',
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.base,
      ...(size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd),
    };

    switch (variant) {
      case 'outlined':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? theme.colors.outlineVariant : theme.colors.primary,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: isDisabled ? theme.colors.surfaceDisabled : theme.colors.error,
          ...SHADOWS.sm,
        };
      case 'filled':
      default:
        return {
          ...base,
          backgroundColor: isDisabled ? theme.colors.surfaceDisabled : theme.colors.primary,
          ...SHADOWS.sm,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outlined':
        return { color: isDisabled ? theme.colors.onSurfaceDisabled : theme.colors.primary };
      case 'ghost':
        return { color: isDisabled ? theme.colors.onSurfaceDisabled : theme.colors.primary };
      case 'danger':
        return { color: isDisabled ? theme.colors.onSurfaceDisabled : theme.colors.onError };
      case 'filled':
      default:
        return { color: isDisabled ? theme.colors.onSurfaceDisabled : theme.colors.onPrimary };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[getContainerStyle(), style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'filled'
              ? theme.colors.onPrimary
              : variant === 'danger'
                ? theme.colors.onError
                : theme.colors.primary
          }
        />
      ) : (
        <View style={styles.content}>
          {leftIcon &&
            (typeof leftIcon === 'string' ? (
              <Text style={styles.icon}>{leftIcon}</Text>
            ) : (
              leftIcon
            ))}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon &&
            (typeof rightIcon === 'string' ? (
              <Text style={styles.icon}>{rightIcon}</Text>
            ) : (
              rightIcon
            ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    height: 36,
    paddingHorizontal: SPACING.md,
  },
  sizeMd: {
    height: 52,
    paddingHorizontal: SPACING.xl,
  },
  sizeLg: {
    height: 60,
    paddingHorizontal: SPACING.xxl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  icon: {
    fontSize: 18,
  },
});