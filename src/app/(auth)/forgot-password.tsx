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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react-native';
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '@/schemas/password.schema';
import { useForgotPassword } from '@/hooks/useAuth';
import { AppInput } from '@/components/ui/Input';
import { AppButton } from '@/components/ui/Button';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS } from '@/styles/global';
import { getApiErrorMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const forgotPassword = useForgotPassword();
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const message = await forgotPassword.mutateAsync(values);
      setSentMessage(message || 'Enviamos as instruções de recuperação para o seu e-mail.');
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Não foi possível enviar o e-mail.'));
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
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={[styles.backButton, { backgroundColor: theme.colors.surfaceVariant }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o login"
          >
            <ArrowLeft size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>

          <View style={[styles.card, { backgroundColor: theme.colors.surface }, SHADOWS.md]}>
            {sentMessage ? (
              <View style={styles.successContent}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <CheckCircle2 size={34} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Verifique seu e-mail
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  {sentMessage}
                </Text>
                <AppButton
                  title="Voltar para o login"
                  onPress={() => router.replace('/(auth)/login')}
                  size="lg"
                  style={styles.fullWidth}
                />
              </View>
            ) : (
              <>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                  Recuperar senha
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
                </Text>

                <AppInput<ForgotPasswordSchema>
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

                {serverError && (
                  <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer }]}>
                    <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
                      {serverError}
                    </Text>
                  </View>
                )}

                <AppButton
                  title="Enviar instruções"
                  onPress={onSubmit}
                  loading={forgotPassword.isPending}
                  size="lg"
                />

                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  style={styles.linkButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                    Voltar para o login
                  </Text>
                </TouchableOpacity>
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
  successContent: {
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
