import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAppStore} from '../../core/state/appStore';
import * as authApi from './api';
import type {LoginRequest, RegisterRequest} from '../../core/api/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
} as const;

// Hooks
export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAppStore(state => state.setSession);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: session => {
      setSession(session);
      queryClient.setQueryData(authKeys.session(), session);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useAppStore(state => state.setSession);

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: session => {
      setSession(session);
      queryClient.setQueryData(authKeys.session(), session);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAppStore(state => state.clearSession);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({token, password}: {token: string; password: string}) =>
      authApi.resetPassword(token, password),
  });
}

// Session hook
export function useSession() {
  const session = useAppStore(state => state.session);
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  return {
    session,
    isAuthenticated,
    user: session?.user,
  };
}
