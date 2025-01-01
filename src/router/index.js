import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import DashboardView from '../views/Dashboard.vue'
import NotFoundView from '../views/NotFound.vue'
import SettingsView from '../views/Settings.vue'
import { auth } from '../main';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:catchAll(.*)', // Catch-all route
      name: 'not-found',
      component: NotFoundView,
     
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})


// Handle route guards
router.beforeEach(async (to, from) => {
  // Ensure Firebase auth state is resolved before proceeding
  const checkAuthState = () => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Unsubscribe to prevent memory leaks
        resolve(user);
      });
    });
  };

  const user = await checkAuthState();

  // Redirect logged-in users from login page to dashboard
  if (to.name === 'login' && user) {
    console.log(`User is already logged in. Redirecting to /dashboard`);
    return { path: '/dashboard' };
  }

  // Redirect unauthenticated users trying to access protected routes
  if (to.meta.requiresAuth && !user) {
    console.log(`Redirecting to login from ${to.fullPath}`);
    return {
      path: '/',
      query: { redirect: to.fullPath }, // Save the intended destination
    };
  }
});


// Function to reset the router
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false },
      },
    ], // Only keep the login route
  });

  router.matcher = newRouter.matcher; // Reset the matcher
}

export default router
