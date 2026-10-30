This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Port mobile concluído — 29/10/2026

Port do frontend web (`controle-de-frotas-fe`) para o mobile concluído, com paridade funcional nas telas existentes.

- [x] Diagnóstico: `tsc` quebrado por 3 listas sem `}`, `can` indefinido, hooks ausentes e telas copiadas do web usando APIs web-only.
- [x] Backend validado em `127.0.0.1:8000` e `192.168.0.104:8000` (login, listas, permissões e sidebar); CORS local preservado.
- [x] Layer compartilhado: `Input` com toggle de senha, `Selector` com ícone `ReactNode`, `EmptyState` com ícone, `PaginationBar`, `PermissionPicker`, `IconButton`, fontes Geist no root layout e ícones lucide na tab bar/header.
- [x] Autenticação reescrita com react-hook-form, `useLocalSearchParams`, “lembrar de mim”, estado de link inválido e mensagens de erro centralizadas.
- [x] Listas de usuários/perfis/secretarias com busca debounced, paginação, ordenação, edição real, exclusão confirmada e gating por permissão.
- [x] Dashboard com saudação, totais, usuários recentes, ações rápidas, pull-to-refresh e gating por permissão.
- [x] Configurações com edição de dados, troca de senha, tema claro/escuro e logout confirmado.
- [x] Verificação: `tsc --noEmit`, `expo lint`, `expo-doctor` (20/20 quando o React Native Directory está acessível), `expo export --platform web` e smoke test em Chrome headless contra a API (login, dashboard, lista, busca, ordenação, edição e restauração).
- [x] Dados temporários de QA removidos do SQLite do backend.

Decisões: sem MMKV (compatibilidade com Expo Go) — token no `SecureStore` e usuário/tema no `AsyncStorage`. Não remover as mudanças locais do backend (`bootstrap/app.php` e `config/cors.php`). O splash usa o plugin `expo-splash-screen`; `newArchEnabled` foi removido do `app.json` porque o schema do SDK 58 não aceita mais essa chave (a nova arquitetura é padrão).

## Arquitetura do Projeto

Este app é uma conversão mobile do frontend web (`controle-de-frotas-fe`). A estrutura segue o mesmo domínio:

```
src/
  app/
    (auth)/         # Rotas públicas: login, forgot-password, reset-password
    (app)/          # Rotas protegidas (tabs): index (dashboard), users, profiles, secretariats, settings
  api/              # axios.ts (cliente + interceptors), endpoints.ts, helpers.ts, errors.ts
  components/
    layout/         # Header.tsx (AppHeader + UserAvatar)
    ui/             # Button, Card, EmptyState, IconButton, Input, Loading, Modal, PaginationBar, PermissionPicker, Selector
  hooks/            # useAuth, useUsers, useProfiles, useSecretariats, usePermissions, useSettings, useDebouncedValue
  providers/        # AuthProvider, QueryProvider, ThemeProvider
  schemas/          # Validação Zod para todos os formulários
  store/            # authStore (Zustand + SecureStore + AsyncStorage), secureStorage.ts
  styles/           # global.ts, theme.ts, fonts.ts, lists.ts
  types/            # Tipos TypeScript espelhando a API
  utils/            # constants.ts (API_URL, QUERY_KEYS, STORAGE_KEYS), errors.ts, confirm.ts
```

**Autenticação**: o token fica no `expo-secure-store` e o usuário no `AsyncStorage`, persistidos apenas quando “lembrar de mim” está marcado. O `AuthProvider` hidrata a sessão e sincroniza o token no header do axios. Redirecionamentos são feitos nos `_layout.tsx` de cada grupo de rotas.

**Tema**: a preferência claro/escuro persiste no `AsyncStorage` (`app_theme_mode`). O toggle fica em Configurações e usa `useAppTheme()`.

**Rede**: `getPaginated()` trata o `400` que a API retorna para listas vazias como uma lista vazia válida. `getApiErrorMessage()` centraliza mensagens de validação (422), rede e erros genéricos.

## Gotchas e Decisões Técnicas

### Zod + `.refine()` + `.partial()`
Não é possível chamar `.partial()` em um `ZodEffects` (resultado de `.refine()`). Para schemas de update, reescreva o objeto explicitamente com campos `.optional()` e aplique um novo `.refine()`.

### TypeScript — style condicional no RN
Em arrays de estilo do React Native, usar `condition ? style : undefined` em vez de `condition && style`, pois `false` não é um valor válido de `StyleProp` em modo strict.

### Tema escuro — nunca fixar `#FFFFFF`
No tema escuro, `primary` é branco. Botões preenchidos e ícones dentro deles devem usar `theme.colors.onPrimary` (e variantes `danger` devem usar `theme.colors.onError`), nunca `#FFFFFF` fixo, para não criar texto/ícone branco sobre fundo branco.

### Splash screen
O splash é configurado no plugin `expo-splash-screen` em `app.json` (não existe mais a chave legada `splash`). O root layout mantém o splash visível até as fontes Geist carregarem e o esconde via `SplashScreen.hideAsync()`.

### `expo-router` como entrypoint
`package.json` usa `"main": "expo-router/entry"`. Não recriar `App.tsx`/`index.ts`; todas as rotas ficam em `src/app/`. A tab bar é configurada diretamente no `(app)/_layout.tsx`, sem `CustomTabBar`.

### API retorna 400 para busca sem resultados
As listas retornam `400` com a mensagem “Nenhum … encontrado” quando a busca não acha nada. O app trata isso como lista vazia e mostra o `EmptyState`; o navegador ainda registra o 400 no console, o que é esperado.

### Confirmações destrutivas no web
`Alert.alert` do React Native Web ignora os callbacks dos botões, então exclusões e logout não funcionariam no navegador. Use `confirmAction()` e `showAlert()` de `src/utils/confirm.ts`: no nativo eles delegam para `Alert.alert`; no web usam `window.confirm`/`window.alert`.

### tsconfig.json — baseUrl
O aviso de depreciação de `baseUrl` no TypeScript 6 é esperado. Não adicionar `ignoreDeprecations` ao tsconfig — o valor `"6.0"` não é aceito pelo language server do VS Code.

## Telas Implementadas

| Tela | Rota | Status |
|------|------|--------|
| Login | `/(auth)/login` | ✅ react-hook-form, “lembrar de mim”, erro inline e credenciais de teste em `__DEV__` |
| Esqueci a senha | `/(auth)/forgot-password` | ✅ envio e estado de sucesso |
| Redefinir senha | `/(auth)/reset-password?token=&email=` | ✅ token/e-mail, link inválido e sucesso |
| Dashboard | `/(app)` | ✅ saudação, totais, usuários recentes, ações rápidas, refresh e gating |
| Usuários | `/(app)/users` | ✅ CRUD, busca debounced, ordenação, paginação e permissões |
| Perfis | `/(app)/profiles` | ✅ CRUD e multi-seleção de permissões (`PermissionPicker`) |
| Secretarias | `/(app)/secretariats` | ✅ CRUD com edição real e exclusão confirmada |
| Configurações | `/(app)/settings` | ✅ dados, senha, tema claro/escuro e logout |

## Verificação

Executado em 29/10/2026:

```bash
npx tsc --noEmit          # OK
npx expo lint             # 0 erros; 1 warning em src/api/axios.ts (import/no-named-as-default-member)
npx expo-doctor           # 20/20 quando o React Native Directory está acessível; 19/20 na última execução (DNS)
npx expo export --platform web --clear  # bundle web gerado em dist/
```

Na última execução, `expo-doctor` ficou em **19/20** porque o ambiente não resolveu `reactnative.directory` (DNS `ENOTFOUND`). O único check que falhou foi o de metadados do React Native Directory; os checks de configuração/dependências passaram.

Smoke test em Chrome headless contra a API real: login (`test@example.com` / `senha123`), dashboard, navegação para Usuários, busca com debounce, estado vazio, ordenação A→Z/Z→A, edição de nome com persistência e restauração, tema claro/escuro e logout com confirmação. Sem erros de página/console além do `400` esperado da busca vazia. CORS respondeu `204` com `Access-Control-Allow-Origin: *` para as origens locais.

