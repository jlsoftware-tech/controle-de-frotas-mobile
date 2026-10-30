import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Check } from 'lucide-react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/styles/global';
import { ACTION_LABELS, MODULE_LABELS } from '@/utils/constants';
import type { Permission } from '@/types/profile';

interface PermissionPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  permissions: Permission[];
  error?: string;
}

const ACTION_ORDER = ['view', 'create', 'update', 'delete'];

function groupPermissions(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const module = String(permission.module);
    const items = groups.get(module) ?? [];
    items.push(permission);
    groups.set(module, items);
  }

  return Array.from(groups.entries()).map(([module, items]) => ({
    module,
    items: [...items].sort(
      (a, b) => ACTION_ORDER.indexOf(String(a.action)) - ACTION_ORDER.indexOf(String(b.action)),
    ),
  }));
}

export function PermissionPicker<T extends FieldValues>({
  control,
  name,
  permissions,
  error,
}: PermissionPickerProps<T>) {
  const theme = useTheme();
  const groups = useMemo(() => groupPermissions(permissions), [permissions]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const selected = Array.isArray(value) ? (value as number[]) : [];

        const togglePermission = (id: number) => {
          onChange(
            selected.includes(id)
              ? selected.filter((permissionId) => permissionId !== id)
              : [...selected, id],
          );
        };

        const toggleModule = (ids: number[]) => {
          const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
          onChange(
            allSelected
              ? selected.filter((id) => !ids.includes(id))
              : Array.from(new Set([...selected, ...ids])),
          );
        };

        return (
          <View style={styles.wrapper}>
            <Text
              style={[
                styles.label,
                { color: error ? theme.colors.error : theme.colors.onSurfaceVariant },
              ]}
            >
              Permissões
            </Text>

            {groups.length === 0 ? (
              <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
                Nenhuma permissão disponível.
              </Text>
            ) : (
              groups.map(({ module, items }) => {
                const ids = items.map((item) => item.id);
                const allSelected = ids.every((id) => selected.includes(id));

                return (
                  <View
                    key={module}
                    style={[
                      styles.moduleCard,
                      {
                        borderColor: theme.colors.outline,
                        backgroundColor: theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => toggleModule(ids)}
                      activeOpacity={0.8}
                      style={styles.moduleHeader}
                    >
                      <Text style={[styles.moduleTitle, { color: theme.colors.onSurface }]}>
                        {MODULE_LABELS[module] ?? module}
                      </Text>
                      <Text style={[styles.moduleAction, { color: theme.colors.primary }]}>
                        {allSelected ? 'Limpar' : 'Selecionar tudo'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.actions}>
                      {items.map((item) => {
                        const isSelected = selected.includes(item.id);

                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => togglePermission(item.id)}
                            activeOpacity={0.8}
                            style={[
                              styles.chip,
                              {
                                borderColor: isSelected
                                  ? theme.colors.primary
                                  : theme.colors.outline,
                                backgroundColor: isSelected
                                  ? theme.colors.primary
                                  : 'transparent',
                              },
                            ]}
                          >
                            {isSelected && (
                              <Check size={13} color={theme.colors.onPrimary} strokeWidth={3} />
                            )}
                            <Text
                              style={[
                                styles.chipText,
                                {
                                  color: isSelected
                                    ? theme.colors.onPrimary
                                    : theme.colors.onSurfaceVariant,
                                },
                              ]}
                            >
                              {ACTION_LABELS[String(item.action)] ?? String(item.action)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            )}

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>⚠ {error}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  empty: {
    fontSize: FONT_SIZE.sm,
  },
  moduleCard: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  moduleTitle: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  moduleAction: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
});
