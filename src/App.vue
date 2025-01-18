<script setup>
import { ref, onMounted } from 'vue';
import { auth } from './main';
import { onAuthStateChanged } from 'firebase/auth';

import SideBarMenu from './views/SideBarMenu.vue';
import HeaderView from './views/Header.vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false); // Tracks login state
const isAuthInitialized = ref(false); // Tracks whether Firebase auth state is initialized
const router = useRouter(); // Access the router

// Listen to authentication state changes
onAuthStateChanged(auth, (user) => {
  isAuthInitialized.value = true; // Firebase initialization is complete

  if (user) {
    isLoggedIn.value = true; // User is logged in
    // Redirect to dashboard if on login page
    if (router.currentRoute.value.name === 'login') {
      router.push('/dashboard');
    }
  } else {
    isLoggedIn.value = false; // User is logged out
    // Redirect to login page if not already there
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push('/');
    }
  }
});

// Ensure the app waits for Firebase initialization before showing any components
onMounted(() => {
  if (!isAuthInitialized.value) {
    console.log('Waiting for Firebase to initialize...');
  }
});
</script>

<template>
  
    <!-- Show a loading spinner or placeholder until Firebase is initialized -->
    <div v-if="!isAuthInitialized" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Main application UI -->
    <div v-else>
      <HeaderView />
      <div class="container-fluid">
        <div class="row">
          <!-- Sidebar is visible only when logged in -->
          <div v-if="isLoggedIn" :class="{ ['sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary']: isLoggedIn }">
            <SideBarMenu />
          </div>

        
            <!-- Main content -->
            <router-view />
         
        </div>
      </div>
    </div>
  
</template>

<style>
/* Center the loading spinner on the screen */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
