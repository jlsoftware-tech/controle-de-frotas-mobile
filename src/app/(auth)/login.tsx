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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusFront, Check, Lock, Mail } from 'lucide-react-native';
import { loginSchema, type LoginSchema } from '@/schemas/login.schema';
import { useLogin } from '@/hooks/useAuth';
import { AppInput } from '@/components/ui/Input';
import { AppButton } from '@/components/ui/Button';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS, GOLD, SIDEBAR } from '@/styles/global';
import { TEST_CREDENTIALS } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const theme = useTheme();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'E-mail ou senha inválidos.'));
    }
  });

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
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: SIDEBAR }]}>
              <BusFront size={34} color={GOLD} strokeWidth={2} />
            </View>
            <Text style={[styles.brandTitle, { color: theme.colors.onBackground }]}>Frota</Text>
            <Text style={[styles.brandSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Gestão de veículos e equipes
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }, SHADOWS.md]}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Entrar</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Acesse com suas credenciais institucionais.
            </Text>

            <AppInput<LoginSchema>
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

            <AppInput<LoginSchema>
              control={control}
              name="password"
              label="Senha"
              placeholder="Sua senha"
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              secureTextEntry
              secureTextEntryToggle
              leftIcon={<Lock size={18} color={theme.colors.onSurfaceVariant} />}
              error={errors.password?.message}
            />

            <Controller
              control={control}
              name="remember"
              render={({ field: { value, onChange } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  activeOpacity={0.8}
                  style={styles.rememberRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: value ? theme.colors.primary : theme.colors.outline,
                        backgroundColor: value ? theme.colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {value && <Check size={14} color={theme.colors.onPrimary} strokeWidth={3} />}
                  </View>
                  <Text style={[styles.rememberText, { color: theme.colors.onSurfaceVariant }]}>
                    Lembrar de mim
                  </Text>
                </TouchableOpacity>
              )}
            />

            {serverError && (
              <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer }]}>
                <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
                  {serverError}
                </Text>
              </View>
            )}

            <AppButton
              title="Entrar"
              onPress={onSubmit}
              loading={login.isPending}
              size="lg"
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>

            {__DEV__ && (
              <View style={[styles.devHint, { borderColor: theme.colors.outline }]}>
                <Text style={[styles.devHintText, { color: theme.colors.onSurfaceVariant }]}>
                  Ambiente de teste: {TEST_CREDENTIALS.email} / {TEST_CREDENTIALS.password}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
            Frota • v1.0.0
          </Text>
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
    gap: SPACING.xl,
  },
  brand: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: FONT_SIZE.sm,
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
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
  forgotButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  forgotText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  devHint: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  devHintText: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
