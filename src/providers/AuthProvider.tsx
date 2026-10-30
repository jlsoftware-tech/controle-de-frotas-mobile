import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';

/**
 * Restores the persisted session before any protected route renders.
 *
 * The axios client reads the token directly from the store, so there is no
 * separate "set token in header" step. While the session is being hydrated we
 * render a neutral loading screen to avoid a redirect flash.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
