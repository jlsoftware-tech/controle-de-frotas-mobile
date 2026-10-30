import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/styles/global';

interface AppInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control?: Control<T>;
  name?: Path<T>;
  label?: string;
  error?: string;
  leftIcon?: string | React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Shows an eye button that toggles the password visibility. */
  secureTextEntryToggle?: boolean;
  style?: ViewStyle;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function AppInput<T extends FieldValues>({
  control,
  name,
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntryToggle = false,
  secureTextEntry,
  style,
  value: externalValue,
  onChangeText: externalOnChange,
  ...props
}: AppInputProps<T>) {
  const theme = useTheme();
  const [passwordHidden, setPasswordHidden] = useState(true);
  const hasError = !!error;

  const renderInput = (
    inputValue: string,
    onChange: (text: string) => void,
    ref?: React.Ref<TextInput>
  ) => (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: hasError ? theme.colors.error : theme.colors.onSurfaceVariant },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: hasError
              ? theme.colors.error
              : inputValue
              ? theme.colors.primary
              : theme.colors.outline,
          },
          hasError && styles.inputError,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {typeof leftIcon === 'string' ? (
              <Text style={styles.iconEmoji}>{leftIcon}</Text>
            ) : (
              leftIcon
            )}
          </View>
        )}
        <TextInput
          ref={ref as React.Ref<any>}
          value={inputValue}
          onChangeText={onChange}
          style={[
            styles.input,
            { color: theme.colors.onSurface },
            leftIcon ? styles.inputWithLeft : undefined,
          ]}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          selectionColor={theme.colors.primary}
          secureTextEntry={secureTextEntryToggle ? passwordHidden : secureTextEntry}
          {...props}
        />
        {secureTextEntryToggle ? (
          <TouchableOpacity
            onPress={() => setPasswordHidden((previous) => !previous)}
            style={styles.toggleButton}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            accessibilityRole="button"
            accessibilityLabel={passwordHidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            {passwordHidden ? (
              <Eye size={18} color={theme.colors.onSurfaceVariant} />
            ) : (
              <EyeOff size={18} color={theme.colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>⚠ {error}</Text>
      )}
    </View>
  );

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, ref } }) =>
          renderInput(String(value ?? ''), onChange, ref)
        }
      />
    );
  }

  return renderInput(externalValue ?? '', externalOnChange ?? (() => {}));
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
    gap: SPACING.sm,
  },
  inputError: {
    borderWidth: 2,
  },
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },
  iconEmoji: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    paddingVertical: SPACING.sm,
  },
  inputWithLeft: {
    paddingLeft: 4,
  },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
});