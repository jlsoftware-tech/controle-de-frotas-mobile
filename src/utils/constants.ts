const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

/**
 * The mobile app talks to the Laravel API through the LAN address so a
 * physical device running Expo Go can reach it. `10.0.2.2` only works inside
 * the Android emulator, so it is deliberately not used here.
 */
export const API_URL = (configuredApiUrl || 'http://192.168.0.104:8000/api/v1').replace(
  /\/+$/,
  '',
);

export const DEFAULT_PAGE_SIZE = 10;

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  REMEMBER: 'auth_remember',
  THEME: 'app_theme_mode',
} as const;

export const QUERY_KEYS = {
  AUTH: ['auth'],
  USERS: ['users'],
  PROFILES: ['profiles'],
  SECRETARIATS: ['secretariats'],
  PERMISSIONS: ['permissions'],
  USER_PERMISSIONS: ['userPermissions'],
  SIDEBAR: ['sidebar'],
} as const;

export const MODULE_LABELS: Record<string, string> = {
  users: 'Usuários',
  profiles: 'Perfis de acesso',
  secretariats: 'Secretarias',
  vehicles: 'Veículos',
};

export const ACTION_LABELS: Record<string, string> = {
  view: 'Visualizar',
  create: 'Criar',
  update: 'Editar',
  delete: 'Excluir',
};

/** Seeded by the development backend; only shown in development builds. */
export const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'senha123',
} as const;
