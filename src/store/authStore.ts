import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { User } from '@/types/user';
import { STORAGE_KEYS } from '@/utils/constants';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secureStorage';

type AuthState = {
  user: User | null;
  token: string | null;
  remember: boolean;
  isHydrated: boolean;
  setSession: (user: User, token: string, remember: boolean) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
  isAuthenticated: () => boolean;
};

let hydrationPromise: Promise<void> | null = null;

async function persistUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {
    // Persistence is best-effort; the in-memory session still works.
  }
}

async function clearPersistedSession(): Promise<void> {
  await Promise.all([
    deleteSecureItem(STORAGE_KEYS.TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.USER).catch(() => undefined),
    AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER).catch(() => undefined),
  ]);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  remember: false,
  isHydrated: false,

  setSession: async (user, token, remember) => {
    set({ user, token, remember, isHydrated: true });

    if (!remember) {
      await clearPersistedSession();
      return;
    }

    await Promise.all([
      setSecureItem(STORAGE_KEYS.TOKEN, token),
      persistUser(user),
      AsyncStorage.setItem(STORAGE_KEYS.REMEMBER, 'true').catch(() => undefined),
    ]);
  },

  updateUser: async (partial) => {
    const current = get().user;
    if (!current) return;

    const next = { ...current, ...partial };
    set({ user: next });

    if (get().remember) {
      await persistUser(next);
    }
  },

  clearSession: async () => {
    set({ user: null, token: null, remember: false, isHydrated: true });
    await clearPersistedSession();
  },

  hydrate: async () => {
    if (get().isHydrated) return;
    if (hydrationPromise) return hydrationPromise;

    const promise = (async () => {
      try {
        const remember = (await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER)) === 'true';

        if (!remember) {
          await clearPersistedSession();
          set({ user: null, token: null, remember: false });
          return;
        }

        const [token, rawUser] = await Promise.all([
          getSecureItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
        ]);

        if (!token || !rawUser) {
          await clearPersistedSession();
          set({ user: null, token: null, remember: false });
          return;
        }

        const user = JSON.parse(rawUser) as User;
        if (!user?.id || !user?.email) {
          await clearPersistedSession();
          set({ user: null, token: null, remember: false });
          return;
        }

        set({ user, token, remember: true });
      } catch {
        await clearPersistedSession();
        set({ user: null, token: null, remember: false });
      } finally {
        set({ isHydrated: true });
        hydrationPromise = null;
      }
    })();

    hydrationPromise = promise;
    return promise;
  },

  isAuthenticated: () => Boolean(get().token),
}));
