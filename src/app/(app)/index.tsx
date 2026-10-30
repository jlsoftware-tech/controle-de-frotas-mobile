import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import {
  Building2,
  ChevronRight,
  Settings,
  ShieldCheck,
  ShieldX,
  Users,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { AppHeader, UserAvatar } from '@/components/layout/Header';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppCard, StatCard } from '@/components/ui/Card';
import { useUsers } from '@/hooks/useUsers';
import { useProfiles } from '@/hooks/useProfiles';
import { useSecretariats } from '@/hooks/useSecretariats';
import { useUserPermissions } from '@/hooks/usePermissions';
import { SPACING, FONT_SIZE, RADIUS } from '@/styles/global';
import { getApiErrorMessage } from '@/utils/errors';

const BLUE = '#2563EB';
const GREEN = '#16A34A';
const GOLD = '#EBA42C';

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const QuickAction = ({ icon, title, onPress }: QuickActionProps) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.quickAction, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <View style={[styles.quickIcon, { backgroundColor: theme.colors.surface }]}>{icon}</View>
      <Text style={[styles.quickTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
        {title}
      </Text>
      <ChevronRight size={16} color={theme.colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);

  const permissions = useUserPermissions();
  const canViewUsers = permissions.can('users', 'view');
  const canViewProfiles = permissions.can('profiles', 'view');
  const canViewSecretariats = permissions.can('secretariats', 'view');

  const usersQuery = useUsers(
    { page: 1, per_page: 5, sort: 'created_at', order: 'desc' },
    canViewUsers,
  );
  const profilesQuery = useProfiles({ page: 1, per_page: 1 }, canViewProfiles);
  const secretariatsQuery = useSecretariats({ page: 1, per_page: 1 }, canViewSecretariats);

  const refreshing =
    usersQuery.isRefetching || profilesQuery.isRefetching || secretariatsQuery.isRefetching;

  const onRefresh = () => {
    void Promise.all([
      usersQuery.refetch(),
      profilesQuery.refetch(),
      secretariatsQuery.refetch(),
    ]);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'usuário';

  const recentUsers = usersQuery.data?.items ?? [];
  const usersTotal = usersQuery.data?.pagination.totalEntries ?? 0;
  const profilesTotal = profilesQuery.data?.pagination.totalEntries ?? 0;
  const secretariatsTotal = secretariatsQuery.data?.pagination.totalEntries ?? 0;

  const hasAnyModuleAccess = canViewUsers || canViewProfiles || canViewSecretariats;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Dashboard" subtitle={`${greeting}, ${firstName}`} />

      {permissions.isLoading ? (
        <Loading label="Carregando painel..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <AppCard variant="elevated" style={styles.heroCard}>
            <View style={styles.heroRow}>
              <UserAvatar name={user?.name ?? '?'} size={54} />
              <View style={styles.heroInfo}>
                <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
                  {user?.name ?? 'Usuário'}
                </Text>
                <Text style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  {user?.profile?.name ?? 'Sem perfil'}
                  {user?.secretariat
                    ? ` · ${user.secretariat.acronym || user.secretariat.name}`
                    : ''}
                </Text>
                <Text style={[styles.heroEmail, { color: theme.colors.onSurfaceVariant }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </AppCard>

          {!hasAnyModuleAccess ? (
            <EmptyState
              icon={<ShieldX size={34} color={theme.colors.onSurfaceVariant} />}
              title="Sem módulos liberados"
              description="Sua conta ainda não possui permissão para acessar os módulos. Fale com um administrador."
            />
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Visão geral
              </Text>

              <View style={styles.statsRow}>
                {canViewUsers && (
                  <StatCard
                    icon={<Users size={20} color={BLUE} />}
                    label="Usuários"
                    value={usersTotal}
                    color={BLUE}
                    onPress={() => router.push('/(app)/users')}
                  />
                )}
                {canViewProfiles && (
                  <StatCard
                    icon={<ShieldCheck size={20} color={GOLD} />}
                    label="Perfis"
                    value={profilesTotal}
                    color={GOLD}
                    onPress={() => router.push('/(app)/profiles')}
                  />
                )}
              </View>

              {canViewSecretariats && (
                <View style={styles.fullWidthRow}>
                  <StatCard
                    icon={<Building2 size={20} color={GREEN} />}
                    label="Secretarias"
                    value={secretariatsTotal}
                    color={GREEN}
                    onPress={() => router.push('/(app)/secretariats')}
                  />
                </View>
              )}

              {canViewUsers && (
                <AppCard style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                      Usuários recentes
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/(app)/users')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>
                        Ver todos
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {usersQuery.isLoading ? (
                    <Loading size="small" label="Carregando usuários..." />
                  ) : usersQuery.isError ? (
                    <Text style={[styles.sectionEmpty, { color: theme.colors.error }]}>
                      {getApiErrorMessage(usersQuery.error)}
                    </Text>
                  ) : recentUsers.length === 0 ? (
                    <Text style={[styles.sectionEmpty, { color: theme.colors.onSurfaceVariant }]}>
                      Nenhum usuário cadastrado.
                    </Text>
                  ) : (
                    recentUsers.map((recentUser, index) => (
                      <View
                        key={recentUser.id}
                        style={[
                          styles.recentRow,
                          index > 0
                            ? { borderTopWidth: 1, borderTopColor: theme.colors.outline }
                            : undefined,
                        ]}
                      >
                        <UserAvatar name={recentUser.name} size={36} />
                        <View style={styles.recentInfo}>
                          <Text
                            style={[styles.recentName, { color: theme.colors.onSurface }]}
                            numberOfLines={1}
                          >
                            {recentUser.name}
                          </Text>
                          <Text
                            style={[styles.recentEmail, { color: theme.colors.onSurfaceVariant }]}
                            numberOfLines={1}
                          >
                            {recentUser.email}
                          </Text>
                        </View>
                        {recentUser.profile && (
                          <Text
                            style={[styles.recentProfile, { color: theme.colors.onSurfaceVariant }]}
                            numberOfLines={1}
                          >
                            {recentUser.profile.name}
                          </Text>
                        )}
                      </View>
                    ))
                  )}
                </AppCard>
              )}
            </>
          )}

          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Ações rápidas
          </Text>

          <View style={styles.quickGrid}>
            {canViewUsers && (
              <QuickAction
                icon={<Users size={20} color={BLUE} />}
                title="Usuários"
                onPress={() => router.push('/(app)/users')}
              />
            )}
            {canViewProfiles && (
              <QuickAction
                icon={<ShieldCheck size={20} color={GOLD} />}
                title="Perfis"
                onPress={() => router.push('/(app)/profiles')}
              />
            )}
            {canViewSecretariats && (
              <QuickAction
                icon={<Building2 size={20} color={GREEN} />}
                title="Secretarias"
                onPress={() => router.push('/(app)/secretariats')}
              />
            )}
            <QuickAction
              icon={<Settings size={20} color={theme.colors.onSurfaceVariant} />}
              title="Configurações"
              onPress={() => router.push('/(app)/settings')}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  heroCard: {
    padding: SPACING.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  heroEmail: {
    fontSize: FONT_SIZE.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  sectionCard: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  sectionLink: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  sectionEmpty: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  recentInfo: {
    flex: 1,
    gap: 1,
  },
  recentName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  recentEmail: {
    fontSize: FONT_SIZE.xs,
  },
  recentProfile: {
    maxWidth: 96,
    fontSize: 10,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    minWidth: '47%',
    flexGrow: 1,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTitle: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
