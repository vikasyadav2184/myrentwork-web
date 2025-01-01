<template>
    <!-- Normal navigation links -->
    <router-link v-if="!logout" :to="to" custom>
      <template v-slot="{ href, navigate, isActive }">
        <a
          :href="href"
          @click.prevent="handleClick(navigate)"
          :class="['nav-link', customClass, { active: isActive }]"
          aria-current="page"
        >
          <slot />
        </a>
      </template>
    </router-link>
  
    <!-- Logout link -->
    <a
      v-else
      href="#"
      @click.prevent="handleClick()"
      :class="['nav-link', customClass]"
    >
      <slot />
    </a>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  // Props for the component
  const props = defineProps({
    to: {
      type: [String, Object],
      default: null, // Optional: No route needed for logout links
    },
    customClass: {
      type: String,
      default: '', // Additional CSS classes for styling
    },
    logout: {
      type: Boolean,
      default: false, // Determines if this is a logout link
    },
  });
  
  // Emits custom click events
  const emit = defineEmits(['click']);
  
  // Handle click events
  const handleClick = (navigate) => {
    emit('click'); // Emit the click event
    if (navigate && typeof navigate === 'function') {
      // Call navigate only if it exists and is a function
      navigate();
    }
  };
  </script>
  