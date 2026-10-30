import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface LoadingProps {
  size?: 'small' | 'large';
  label?: string;
  fullScreen?: boolean;
}

export const Loading = ({ size = 'large', label, fullScreen = false }: LoadingProps) => {
  const theme = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.emoji}>🚌</Text>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {label && (
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {label && (
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emoji: {
    fontSize: 40,
  },
  inline: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});