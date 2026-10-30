# Controle de Frotas - Mobile

**Expo / React Native** - Aplicativo mobile para controle de frotas, convertendo o frontend web (`controle-de-frotas-fe`).

## 📱 Status

✅ Port concluído em 29/10/2026 com paridade funcional das telas web.

- Login, recuperação e redefinição de senha
- Dashboard, usuários, perfis, secretarias e configurações
- Autenticação com `expo-secure-store` + `AsyncStorage`
- Tema claro/escuro persistente
- Listas com busca debounced, paginação, ordenação
- API integrada (`192.168.0.104:8000`)

## 🚀 Tecnologias

- **Expo SDK 58** + **Expo Router** (file-based navigation)
- **React Native 0.88.1**
- **TypeScript** com validação **Zod**
- **Zustand** + **expo-secure-store** + **AsyncStorage** (auth)
- **React Query** (data fetching + caching)
- **Axios** com interceptors
- **ESLint** + **Expo Linter**
- **Lucide React Native** (ícones)

## 📂 Estrutura

```
src/
  app/           # Rotas: (auth) + (app) com tabs
  api/           # axios, endpoints, helpers, errors, queryClient
  components/    # Layout (Header) + UI (Button, Card, EmptyState, etc.)
  hooks/         # useAuth, useUsers, useProfiles, useSecretariats, usePermissions, useSettings, useDebouncedValue
  providers/     # AuthProvider, QueryProvider, ThemeProvider
  schemas/       # Validação Zod para todos os formulários
  store/         # authStore (Zustand + SecureStore + AsyncStorage)
  styles/        # global.ts, theme.ts, fonts.ts, lists.ts
  types/         # Tipos TypeScript espelhando a API
  utils/         # constants.ts, errors.ts, confirm.ts
```

## 📋 Telas Implementadas

| Tela | Rota | Status |
|------|------|--------|
| Login | `/(auth)/login` | ✅ react-hook-form, "lembrar de mim", erro inline |
| Esqueci a senha | `/(auth)/forgot-password` | ✅ envio e estado de sucesso |
| Redefinir senha | `/(auth)/reset-password` | ✅ token/e-mail, link inválido e sucesso |
| Dashboard | `/(app)` | ✅ saudação, totais, ações rápidas, pull-to-refresh |
| Usuários | `/(app)/users` | ✅ CRUD, busca debounced, ordenação, paginação |
| Perfis | `/(app)/profiles` | ✅ CRUD e multi-seleção de permissões |
| Secretarias | `/(app)/secretariats` | ✅ CRUD com edição e exclusão confirmada |
| Configurações | `/(app)/settings` | ✅ dados, senha, tema claro/escuro e logout |

## 🛠 Comandos

```bash
npx expo start           # iniciar dev server
npx expo start --android # Android
npx expo start --ios     # iOS
npx expo start --web     # web (http://localhost:8081)
npx expo lint            # lint
npx tsc --noEmit         # typecheck
npx expo-doctor          # diagnose issues
```

## 🧪 Login de Teste

```
email:    test@example.com
senha:    senha123
```

## 📄 Licença

Este projeto não possui licença definida (o arquivo `LICENSE` foi removido). Consulte o repositório original ou entre em contato com o mantenedor para definição de licenciamento.