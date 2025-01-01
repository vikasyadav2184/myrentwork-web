<script setup>
import { useRouter } from 'vue-router';
import { resetRouter } from '@/router';
import AppLink from '../components/AppLink.vue';
</script>
<template>
<header class="navbar sticky-top bg-dark flex-md-nowrap p-0 shadow" data-bs-theme="dark">
    <AppLink to="/dashboard" customClass="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 text-white">
            My Rent Work
            </AppLink>
   
  
    <ul class="navbar-nav flex-row d-md-none">
      
      <li class="nav-item text-nowrap">
        <button class="nav-link px-3 text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
            <i class="bi bi-list"></i>
        </button>
      </li>
    </ul>
  
   
  </header>
</template>

<style scoped>
/*
 * Navbar
 */

 .navbar-brand {
  padding-top: .75rem;
  padding-bottom: .75rem;
  background-color: rgba(0, 0, 0, .25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
}

.navbar .form-control {
  padding: .75rem 1rem;
}
</style>
