import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  type ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS } from '@/styles/global';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface AppSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  error?: string;
  style?: ViewStyle;
  leftIcon?: string | React.ReactNode;
}

export function AppSelector<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Selecione...',
  options,
  error,
  style,
  leftIcon,
}: AppSelectorProps<T>) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const selected = options.find((o) => o.value === value);

        return (
          <View style={[styles.wrapper, style]}>
            {label && (
              <Text style={[styles.label, { color: error ? theme.colors.error : theme.colors.onSurfaceVariant }]}>
                {label}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => setIsOpen(true)}
              activeOpacity={0.85}
              style={[
                styles.trigger,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: error
                    ? theme.colors.error
                    : selected
                    ? theme.colors.primary
                    : theme.colors.outline,
                },
              ]}
            >
              {leftIcon &&
                (typeof leftIcon === 'string' ? (
                  <Text style={styles.leftIcon}>{leftIcon}</Text>
                ) : (
                  <View style={styles.leftIconNode}>{leftIcon}</View>
                ))}
              <Text
                style={[
                  styles.triggerText,
                  { color: selected ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {selected ? selected.label : placeholder}
              </Text>
              <Text style={[styles.arrow, { color: theme.colors.onSurfaceVariant }]}>▼</Text>
            </TouchableOpacity>

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>⚠ {error}</Text>
            )}

            {/* Options Modal */}
            <Modal
              visible={isOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setIsOpen(false)}
            >
              <TouchableOpacity
                style={styles.backdrop}
                onPress={() => setIsOpen(false)}
                activeOpacity={1}
              >
                <View
                  style={[
                    styles.optionsContainer,
                    { backgroundColor: theme.colors.surface },
                    SHADOWS.lg,
                  ]}
                >
                  <View style={[styles.optionsHeader, { borderBottomColor: theme.colors.outline }]}>
                    <Text style={[styles.optionsTitle, { color: theme.colors.onSurface }]}>
                      {label ?? 'Selecione'}
                    </Text>
                    <TouchableOpacity onPress={() => setIsOpen(false)}>
                      <Text style={[styles.closeBtn, { color: theme.colors.onSurfaceVariant }]}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={options}
                    keyExtractor={(item) => String(item.value)}
                    renderItem={({ item }) => {
                      const isSelected = item.value === value;
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            onChange(item.value);
                            setIsOpen(false);
                          }}
                          style={[
                            styles.option,
                            isSelected && { backgroundColor: theme.colors.primaryContainer },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color: isSelected
                                  ? theme.colors.primary
                                  : theme.colors.onSurface,
                                fontWeight: isSelected ? '700' : '400',
                              },
                            ]}
                          >
                            {item.label}
                          </Text>
                          {isSelected && (
                            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                    style={styles.optionsList}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        );
      }}
    />
  );
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
    gap: SPACING.sm,
  },
  leftIcon: {
    fontSize: 18,
  },
  leftIconNode: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
  },
  arrow: {
    fontSize: 10,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  optionsContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    maxHeight: 400,
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  optionsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionsList: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
});
