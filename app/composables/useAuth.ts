// Xử lý đăng nhập và phân quyền người dùng

import type { AuthUser } from "~/types";
import { generateId } from "~/utils/seed-data";
import { usePosStorage } from "~/composables/usePosStorage";

const authUser = ref<AuthUser | null>(null);

export function useAuth() {
  const storage = usePosStorage();

  function init() {
    const saved = storage.getAuth();
    if (saved) {
      authUser.value = saved as AuthUser;
    }
  }

  function login(name: string, phone: string, role: "admin" | "employee") {
    const user: AuthUser = {
      id: generateId(),
      name,
      role,
      phone,
    };
    authUser.value = user;
    storage.saveAuth(user);
    return user;
  }

  function logout() {
    authUser.value = null;
    storage.clearAuth();
    navigateTo("/");
  }

  function isLoggedIn(): boolean {
    return !!authUser.value;
  }

  function isAdmin(): boolean {
    return authUser.value?.role === "admin";
  }

  return {
    user: authUser,
    init,
    login,
    logout,
    isLoggedIn,
    isAdmin,
  };
}
