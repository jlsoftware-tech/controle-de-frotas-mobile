import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLogout } from '@/hooks/useAuth';
import { Bus, LogOut } from 'lucide-react-native';
import { SPACING, FONT_SIZE, GOLD, SIDEBAR } from '@/styles/global';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showLogout?: boolean;
}

export const AppHeader = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  showLogout = false,
}: AppHeaderProps) => {
  const theme = useTheme();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
        {/* Left */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Text style={[styles.backIcon, { color: theme.colors.onSurface }]}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logoMark}>
              <Bus size={20} color={GOLD} strokeWidth={2.2} />
            </View>
          )}
        </View>

        {/* Center */}
        <View style={styles.centerSection}>
          <Text
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right */}
        <View style={styles.rightSection}>
          {rightAction || (showLogout && (
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isPending}
              style={[styles.iconButton, { backgroundColor: theme.colors.errorContainer }]}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <LogOut size={18} color={theme.colors.error} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

// UserAvatar helper
export const UserAvatar = ({
  name,
  size = 40,
  color,
}: { name: string; size?: number; color?: string }) => {
  const theme = useTheme();
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  const bgColor = color ?? theme.colors.primaryContainer;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.avatarText, { color: theme.colors.onPrimaryContainer, fontSize: size * 0.4 }]}>
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    height: 64,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '300',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SIDEBAR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
  },
  logoutIcon: {
    fontSize: 18,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },
});