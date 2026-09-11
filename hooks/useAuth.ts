import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user } = res.data.data;
    setAuth(user, accessToken);
    return user;
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { accessToken, user } = res.data.data;
    setAuth(user, accessToken);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearAuth();
  };

  return { user, isAuthenticated, login, register, logout, updateUser };
}
