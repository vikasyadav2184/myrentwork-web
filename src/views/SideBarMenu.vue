<script setup>
import { ref } from 'vue';
import { auth } from '../main';
import { signOut } from 'firebase/auth';

import { useRouter } from 'vue-router';
import { resetRouter } from '@/router';
import AppLink from '../components/AppLink.vue';

const router = useRouter();



// Sign-out function
const handleSignOut = async () => {
  try {
    await signOut(auth); // Sign out the user
    resetRouter(); // Update reactive state
    router.push('/'); // Redirect to the home page or login page
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

</script>

<template>
    <div class="offcanvas-md offcanvas-end bg-body-tertiary" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="sidebarMenuLabel">My Rent Work</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
        <ul class="nav flex-column">
          <li class="nav-item">
            <!-- Example 1: Basic Usage -->
            <AppLink to="/dashboard" customClass="d-flex gap-2">
              <i class="bi bi-house-fill"></i>Dashboard
            </AppLink>
          </li>

          <li class="nav-item">
            <!-- Example 1: Basic Usage -->
            <AppLink to="/activeusers" customClass="d-flex gap-2">
              <i class="bi bi-people-fill"></i>Users Logs
            </AppLink>
          </li>
          
          
        </ul>

        <!-- <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-body-secondary text-uppercase">
          <span>Saved reports</span>
          <a class="link-secondary" href="#" aria-label="Add a new report">
            <svg class="bi"><use xlink:href="#plus-circle"></use></svg>
          </a>
        </h6> -->
        <!-- <ul class="nav flex-column mb-auto">
          <li class="nav-item">
            <a class="nav-link d-flex align-items-center gap-2" href="#">
              <svg class="bi"><use xlink:href="#file-earmark-text"></use></svg>
              Current month
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link d-flex align-items-center gap-2" href="#">
              <svg class="bi"><use xlink:href="#file-earmark-text"></use></svg>
              Last quarter
            </a>
          </li>
        </ul> -->

        <hr class="my-3">

        <ul class="nav flex-column mb-auto">

          <li class="nav-item">
            <AppLink logout customClass="nav-link d-flex gap-2 text-danger" @click="handleSignOut">
              <i class="bi bi-door-closed-fill"></i>
              Sign out
            </AppLink>
           
          </li>
        </ul>
      </div>
    </div>

</template>

<style scoped>
.bi {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}

/*
 * Sidebar
 */

@media (min-width: 768px) {
  .sidebar .offcanvas-lg {
    position: -webkit-sticky;
    position: sticky;
    top: 48px;
  }
}

.sidebar .nav-link {
  color: #555;

}

.sidebar .nav-link.active {
  color: #2470dc;
  font-weight: 600;
}

.sidebar-heading {
  font-size: .75rem;
}

</style>