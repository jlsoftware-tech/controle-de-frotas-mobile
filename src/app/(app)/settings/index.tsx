import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  Save,
  Sun,
  User as UserIcon,
} from 'lucide-react-native';
import { AppHeader, UserAvatar } from '@/components/layout/Header';
import { AppButton } from '@/components/ui/Button';
import { AppInput } from '@/components/ui/Input';
import { AppCard } from '@/components/ui/Card';
import { useUpdateOwnInfo, useResetOwnPassword } from '@/hooks/useSettings';
import { useLogout } from '@/hooks/useAuth';
import {
  personalInfoSchema,
  changePasswordSchema,
  type PersonalInfoSchema,
  type ChangePasswordSchema,
} from '@/schemas/settings.schema';
import { useAuthStore } from '@/store/authStore';
import { useAppTheme } from '@/providers/ThemeProvider';
import { getApiErrorMessage } from '@/utils/errors';
import { confirmAction } from '@/utils/confirm';
import { SPACING, FONT_SIZE, RADIUS } from '@/styles/global';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDark, toggleTheme } = useAppTheme();
  const user = useAuthStore((state) => state.user);

  const updateInfo = useUpdateOwnInfo();
  const resetPassword = useResetOwnPassword();
  const logout = useLogout();

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const infoForm = useForm<PersonalInfoSchema>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const { reset: resetInfoForm } = infoForm;
  const { reset: resetPasswordForm } = passwordForm;

  useEffect(() => {
    resetInfoForm({ name: user?.name ?? '', email: user?.email ?? '' });
  }, [user?.name, user?.email, resetInfoForm]);

  const onSaveInfo = infoForm.handleSubmit(async (values) => {
    setInfoMessage(null);
    setInfoError(null);

    try {
      await updateInfo.mutateAsync(values);
      setInfoMessage('Informações atualizadas com sucesso.');
    } catch (error) {
      setInfoError(getApiErrorMessage(error));
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordMessage(null);
    setPasswordError(null);

    try {
      await resetPassword.mutateAsync(values);
      setPasswordMessage('Senha alterada com sucesso.');
      resetPasswordForm({ password: '', password_confirmation: '' });
    } catch (error) {
      setPasswordError(getApiErrorMessage(error));
    }
  });

  const confirmLogout = () => {
    confirmAction({
      title: 'Sair da conta',
      message: 'Deseja encerrar a sessão neste dispositivo?',
      confirmLabel: 'Sair',
      onConfirm: () => logout.mutate(),
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Configurações" subtitle="Conta, segurança e aparência" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <UserAvatar name={user?.name ?? '?'} size={56} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
                {user?.name ?? 'Usuário'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>
                {user?.email}
              </Text>
              <Text style={[styles.profileMeta, { color: theme.colors.onSurfaceVariant }]}>
                {user?.profile?.name ?? 'Sem perfil'}
                {user?.secretariat
                  ? ` · ${user.secretariat.acronym || user.secretariat.name}`
                  : ''}
              </Text>
            </View>
          </View>
        </AppCard>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Informações pessoais
        </Text>

        <AppCard style={styles.sectionCard}>
          <AppInput<PersonalInfoSchema>
            control={infoForm.control}
            name="name"
            label="Nome completo"
            placeholder="Seu nome"
            autoCapitalize="words"
            leftIcon={<UserIcon size={18} color={theme.colors.onSurfaceVariant} />}
            error={infoForm.formState.errors.name?.message}
          />

          <AppInput<PersonalInfoSchema>
            control={infoForm.control}
            name="email"
            label="E-mail"
            placeholder="seu.nome@instituicao.gov.br"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<Mail size={18} color={theme.colors.onSurfaceVariant} />}
            error={infoForm.formState.errors.email?.message}
          />

          {infoMessage && (
            <View style={[styles.feedback, { backgroundColor: theme.colors.secondaryContainer }]}>
              <CheckCircle2 size={16} color={theme.colors.secondary} />
              <Text style={[styles.feedbackText, { color: theme.colors.onSecondaryContainer }]}>
                {infoMessage}
              </Text>
            </View>
          )}

          {infoError && (
            <View style={[styles.feedback, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={[styles.feedbackText, { color: theme.colors.onErrorContainer }]}>
                {infoError}
              </Text>
            </View>
          )}

          <AppButton
            title="Salvar informações"
            onPress={onSaveInfo}
            loading={updateInfo.isPending}
            leftIcon={<Save size={18} color={theme.colors.onPrimary} />}
          />
        </AppCard>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Alterar senha
        </Text>

        <AppCard style={styles.sectionCard}>
          <AppInput<ChangePasswordSchema>
            control={passwordForm.control}
            name="password"
            label="Nova senha"
            placeholder="Mínimo de 8 caracteres"
            autoCapitalize="none"
            autoComplete="new-password"
            secureTextEntry
            secureTextEntryToggle
            leftIcon={<KeyRound size={18} color={theme.colors.onSurfaceVariant} />}
            error={passwordForm.formState.errors.password?.message}
          />

          <AppInput<ChangePasswordSchema>
            control={passwordForm.control}
            name="password_confirmation"
            label="Confirmar nova senha"
            placeholder="Repita a nova senha"
            autoCapitalize="none"
            autoComplete="new-password"
            secureTextEntry
            secureTextEntryToggle
            leftIcon={<KeyRound size={18} color={theme.colors.onSurfaceVariant} />}
            error={passwordForm.formState.errors.password_confirmation?.message}
          />

          {passwordMessage && (
            <View style={[styles.feedback, { backgroundColor: theme.colors.secondaryContainer }]}>
              <CheckCircle2 size={16} color={theme.colors.secondary} />
              <Text style={[styles.feedbackText, { color: theme.colors.onSecondaryContainer }]}>
                {passwordMessage}
              </Text>
            </View>
          )}

          {passwordError && (
            <View style={[styles.feedback, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={[styles.feedbackText, { color: theme.colors.onErrorContainer }]}>
                {passwordError}
              </Text>
            </View>
          )}

          <AppButton
            title="Alterar senha"
            onPress={onChangePassword}
            loading={resetPassword.isPending}
          />
        </AppCard>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Aparência</Text>

        <AppCard style={styles.sectionCard}>
          <View style={styles.themeRow}>
            <View
              style={[styles.themeIcon, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              {isDark ? (
                <Moon size={20} color={theme.colors.secondary} />
              ) : (
                <Sun size={20} color={theme.colors.secondary} />
              )}
            </View>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeTitle, { color: theme.colors.onSurface }]}>
                Tema escuro
              </Text>
              <Text style={[styles.themeSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {isDark ? 'Ativado' : 'Desativado'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.outline, true: theme.colors.secondary }}
              thumbColor={isDark ? theme.colors.onSecondary : '#FFFFFF'}
            />
          </View>
        </AppCard>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Sessão</Text>

        <AppCard style={styles.sectionCard}>
          <Text style={[styles.sessionText, { color: theme.colors.onSurfaceVariant }]}>
            Encerrar a sessão neste dispositivo. Você precisará informar suas credenciais
            novamente para entrar.
          </Text>
          <AppButton
            title="Sair da conta"
            variant="danger"
            onPress={confirmLogout}
            loading={logout.isPending}
            leftIcon={<LogOut size={18} color={theme.colors.onError} />}
          />
        </AppCard>

        <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
          Frota • v1.0.0
        </Text>
      </ScrollView>
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
  profileCard: {
    padding: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: FONT_SIZE.sm,
  },
  profileMeta: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
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
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  feedbackText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  themeIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeInfo: {
    flex: 1,
    gap: 2,
  },
  themeTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  themeSubtitle: {
    fontSize: FONT_SIZE.xs,
  },
  sessionText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  version: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
