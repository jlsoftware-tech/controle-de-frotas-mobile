import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ArrowLeft, CheckCircle2, Lock, Mail } from 'lucide-react-native';
import { resetPasswordSchema, type ResetPasswordSchema } from '@/schemas/password.schema';
import { useResetPassword } from '@/hooks/useAuth';
import { AppInput } from '@/components/ui/Input';
import { AppButton } from '@/components/ui/Button';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS } from '@/styles/global';
import { getApiErrorMessage } from '@/utils/errors';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const emailParam = typeof params.email === 'string' ? params.email : '';

  const resetPassword = useResetPassword();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailParam, password: '', password_confirmation: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const message = await resetPassword.mutateAsync({ ...values, token });
      setSuccessMessage(message || 'Senha redefinida com sucesso.');
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Não foi possível redefinir a senha.'));
    }
  });

  const goToLogin = () => router.replace('/(auth)/login');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={goToLogin}
            style={[styles.backButton, { backgroundColor: theme.colors.surfaceVariant }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o login"
          >
            <ArrowLeft size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }, SHADOWS.md]}>
            {!token ? (
              <View style={styles.centeredContent}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.errorContainer }]}>
                  <AlertTriangle size={34} color={theme.colors.error} />
                </View>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Link inválido
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Este link de redefinição está incompleto ou expirou. Solicite um novo link
                  para continuar.
                </Text>
                <AppButton
                  title="Solicitar novo link"
                  onPress={() => router.replace('/(auth)/forgot-password')}
                  size="lg"
                  style={styles.fullWidth}
                />
                <TouchableOpacity onPress={goToLogin} style={styles.linkButton} activeOpacity={0.7}>
                  <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                    Voltar para o login
                  </Text>
                </TouchableOpacity>
              </View>
            ) : successMessage ? (
              <View style={styles.centeredContent}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <CheckCircle2 size={34} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Senha redefinida
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  {successMessage}
                </Text>
                <AppButton
                  title="Ir para o login"
                  onPress={goToLogin}
                  size="lg"
                  style={styles.fullWidth}
                />
              </View>
            ) : (
              <>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Redefinir senha
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Escolha uma nova senha para acessar sua conta.
                </Text>

                <AppInput<ResetPasswordSchema>
                  control={control}
                  name="email"
                  label="E-mail"
                  placeholder="seu.nome@instituicao.gov.br"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  leftIcon={<Mail size={18} color={theme.colors.onSurfaceVariant} />}
                  error={errors.email?.message}
                />

                <AppInput<ResetPasswordSchema>
                  control={control}
                  name="password"
                  label="Nova senha"
                  placeholder="Mínimo de 6 caracteres"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  secureTextEntry
                  secureTextEntryToggle
                  leftIcon={<Lock size={18} color={theme.colors.onSurfaceVariant} />}
                  error={errors.password?.message}
                />

                <AppInput<ResetPasswordSchema>
                  control={control}
                  name="password_confirmation"
                  label="Confirmar nova senha"
                  placeholder="Repita a nova senha"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  secureTextEntry
                  secureTextEntryToggle
                  leftIcon={<Lock size={18} color={theme.colors.onSurfaceVariant} />}
                  error={errors.password_confirmation?.message}
                />

                {serverError && (
                  <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer }]}>
                    <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
                      {serverError}
                    </Text>
                  </View>
                )}

                <AppButton
                  title="Redefinir senha"
                  onPress={onSubmit}
                  loading={resetPassword.isPending}
                  size="lg"
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  centeredContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  errorBox: {
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  linkText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
