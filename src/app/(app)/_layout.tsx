import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Settings,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

type TabIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type TabIconProps = {
  icon: TabIconComponent;
  label: string;
  focused: boolean;
};

const TabIcon = ({ icon: Icon, label, focused }: TabIconProps) => {
  const theme = useTheme();
  const color = focused ? theme.colors.primary : theme.colors.onSurfaceVariant;

  return (
    <View style={styles.tabIconContainer}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
      <Text style={[styles.tabLabel, { color }, focused ? styles.tabLabelFocused : undefined]}>
        {label}
      </Text>
    </View>
  );
};

export default function AppLayout() {
  const theme = useTheme();
  const { token } = useAuthStore();

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={LayoutDashboard} label="Dashboard" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="users/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Users} label="Usuários" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profiles/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ShieldCheck} label="Perfis" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="secretariats/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Building2} label="Secretarias" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Settings} label="Config" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
});
