// Import Vue and Firebase
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';


// Import Firebase app and specific services
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (replace with your credentials)
const firebaseConfig = {
  apiKey: "AIzaSyByKk3_CWEVV6j_IpQtuqlnaHThprYryCo",
  authDomain: "my-rent-work-4c9d6.firebaseapp.com",
  databaseURL: "https://my-rent-work-4c9d6-default-rtdb.firebaseio.com",
  projectId: "my-rent-work-4c9d6",
  storageBucket: "my-rent-work-4c9d6.appspot.com",
  messagingSenderId: "317496606232",
  appId: "1:317496606232:web:922442389a71ad07a00d6d",
  measurementId: "G-2M20N29PPV",
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseapp);
const db = getFirestore(firebaseapp);


// Initialize Vue application
const app = createApp(App);

// Use Vue Router
app.use(router);


// Mount the Vue application
app.mount('#app');

export { auth, db }