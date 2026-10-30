import React from 'react';
import { TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RADIUS } from '@/styles/global';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
  variant?: 'default' | 'primary' | 'danger';
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton = ({
  icon,
  onPress,
  label,
  variant = 'default',
  size = 44,
  disabled = false,
  style,
}: IconButtonProps) => {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.errorContainer
        : theme.colors.surfaceVariant;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
