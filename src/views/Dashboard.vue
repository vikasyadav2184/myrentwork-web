<script setup>
import { ref, computed, onMounted } from "vue";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../main";

const createdUsersCount = ref(0);
const loggedInUsersCount = ref(0);


const fetch48HoursCounts = async () => {
  const now = Date.now();
  const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

  // Query for createdAt in the last 48 hours
  const createdAtQuery = query(
    collection(db, "users"),
    where("createdAt", ">=", fortyEightHoursAgo.toString()),
  );

  // Query for lastLoginTime in the last 48 hours
  const lastLoginQuery = query(
    collection(db, "users"),
    where("lastLoginTime", ">=", fortyEightHoursAgo),
  );

  // Fetch counts
  const [createdAtSnapshot, lastLoginSnapshot] = await Promise.all([
    getCountFromServer(createdAtQuery),
    getCountFromServer(lastLoginQuery)
  ]);

  const totalCreatedUsers = createdAtSnapshot.data().count;
  const totalLoggedInUsers = lastLoginSnapshot.data().count;

  console.log("Users created in last 48 hours:", totalCreatedUsers);
  console.log("Users logged in last 48 hours:", totalLoggedInUsers);

  // Optional: Update reactive variables
  createdUsersCount.value = totalCreatedUsers;
  loggedInUsersCount.value = totalLoggedInUsers;
};


onMounted(async () => {
  await fetch48HoursCounts();
    
});
</script>

<template>
    <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <h3 class="mt-3">Users Log of 48 hours</h3>
        <div class="text-center mt-5">
            <div class="row align-items-center">
                <div class="col-3 me-3 fs-5 fw-semibold bg-info py-5 bg-opacity-50">
                    New Users
                    <div class="mt-2">
                        {{ createdUsersCount }}
                    </div>
                </div>

                <div class="col-3 bg-info fs-5 fw-semibold bg-info py-5 bg-opacity-50">
                    Re-Visited Users
                    <div class="mt-2">
                        {{ loggedInUsersCount }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>