<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Correct import for useRouter
import { auth } from '../main';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Refs for DOM manipulation and state
const email = ref('vdrall624@gmail.com');
const password = ref('123456');
const message = ref('');
const router = useRouter(); // Initialize router instance

// Current year and next year
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

// Function to map Firebase error codes to friendly messages
const getFriendlyErrorMessage = (errorCode) => {

  const errorMessages = {
    'auth/invalid-email': 'The email address you entered is not valid. Please check and try again.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'The password you entered is incorrect. Please try again.',
    'auth/missing-password': 'The password should not be empty. Please try again.',
    'auth/weak-password': 'The password is weak. Please try again.',
    'auth/email-already-in-use': 'This email is already associated with another account. Try logging in instead.',
    'auth/invalid-credential': 'No account found with this email and password. Please try again.',
  };

  return errorMessages[errorCode] || 'An unknown error occurred. Please try again later.';
};

// Firebase auth instance


// Function to validate user and login
const loginUser = async (email, password) => {
  
  signInWithEmailAndPassword(auth, email.value, password.value).then((userCredential) => {
      console.log('Login successful', userCredential);

    // Reset the form fields
    email.value = '';
    password.value = '';
    message.value = '';

    // Navigate to the desired route after login
    router.push('/dashboard');

    }).catch((error) => {
      
       message.value = getFriendlyErrorMessage(error.code);

    });

  }

// Form submit handler
const handleLogin = async () => {
  console.log('Handling login...');
  await loginUser(email, password);
};
</script>

<template>
  <div class="row justify-content-center align-items-center vh-100">
    <div class="form-signin w-100 m-auto">
      <form class="login-form" method="post" @submit.prevent="handleLogin">
        <img class="mb-4 rounded-circle" src="../assets/myrentwork-logo.png" alt="" width="72" />
        <h3 class="mb-3 fw-normal">Admin - Please sign in</h3>

        <div class="form-floating">
          <input
            type="email"
            v-model="email"
            name="email"
            class="form-control formfields"
            id="floatingInput"
            placeholder="name@example.com"
            aria-describedby="validationServerEmailFeedback"
          />
          <label for="floatingInput" class="form-label">Email address</label>
        </div>

        <div class="form-floating">
          <input
            type="password"
            v-model="password"
            name="password"
            class="form-control formfields"
            id="floatingPassword"
            placeholder="Password"
            aria-describedby="validationServerEmailFeedback"
          />
          <label for="floatingPassword">Password</label>
         
        </div>

        <!-- Error Message -->
        <div v-if="message" class="alert alert-danger mt-3">
          {{ message }}
        </div>

        <button id="loadingButton" class="btn btn-primary w-100 py-2 login-btn" type="submit">
          <span class="spinner-border spinner-border-sm d-none" aria-hidden="true"></span>
          <span class="button-text">Sign in</span>
        </button>
        <p class="mt-5 mb-3 text-body-secondary">&copy; {{ currentYear + '-' + nextYear }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-signin {
  max-width: 330px;
  padding: 1rem;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>