// Middleware kiểm tra đăng nhập

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const auth = useAuth();
  auth.init();

  if (to.path === "/") return;

  if (!auth.isLoggedIn()) {
    return navigateTo("/");
  }

  if (to.path.startsWith("/admin") && !auth.isAdmin()) {
    return navigateTo("/employee");
  }

  if (to.path.startsWith("/employee") && auth.isAdmin()) {
    return navigateTo("/admin");
  }
});
