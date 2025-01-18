<template>
  <!-- Full Page Loading Overlay -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
    <!-- Page Heading -->
    <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
      <h3>Users Logs</h3>
      <!-- Export Button -->
      <button class="btn btn-success" @click="exportToCSV">Export to CSV</button>
    </div>

    <!-- Search and Filter Section -->
    <div class="d-flex align-items-center mb-3">
      <!-- Search Box -->
      <div class="me-3">
        <input type="text" class="form-control" placeholder="Search by phone number" v-model="searchQuery"
          @input="searchPhoneNumber" />
      </div>

      <!-- Filter Dropdown -->
      <div>
        <div class="dropdown">
          <button class="btn btn-primary dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown"
            aria-expanded="false">
            Filter: {{ currentFilter }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="filterDropdown">
            <li><a class="dropdown-item" href="#" @click="applyFilter('48 hrs')">48 Hours</a></li>
            <li><a class="dropdown-item" href="#" @click="applyFilter('7 days')">7 Days</a></li>
            <li><a class="dropdown-item" href="#" @click="applyFilter('15 days')">15 Days</a></li>
            <li><a class="dropdown-item" href="#" @click="applyFilter('30 days')">30 Days</a></li>
            <li><a class="dropdown-item" href="#" @click="applyFilter('60 days')">60 Days</a></li>
            <li><a class="dropdown-item" href="#" @click="applyFilter('90 days')">90 Days</a></li>
            <li><a class="dropdown-item" href="#" @click="applyFilter('All users')">All Users</a></li>
          </ul>

        </div>
      </div>
    </div>

    <!-- Total Records Display -->
    <div class="text-end mb-3">
      <h5><strong>Total Records:</strong> {{ totalRecords }}</h5>
    </div>

    <!-- User List Table -->
    <table class="table table-bordered user-log-table">
      <thead>
        <tr>
          <th @click="sortBy('u_name')">
            Name
            <span v-if="sortColumn === 'u_name'" class="ms-1">
              <i :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </span>
          </th>
          <th @click="sortBy('u_phone')">
            Phone Number
            <span v-if="sortColumn === 'u_phone'" class="ms-1">
              <i :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </span>
          </th>
          <th @click="sortBy('createdAt')">
            A/C Created On
            <span v-if="sortColumn === 'createdAt'" class="ms-1">
              <i :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </span>
          </th>
          <th @click="sortBy('lastLoginTime')">
            Last Login/Sign-In Date
            <span v-if="sortColumn === 'lastLoginTime'" class="ms-1">
              <i :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
            </span>
          </th>
          <th>Days Before (Last Login)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.u_name || "N/A" }}</td>
          <td>{{ user.u_phone }}
            <button class="btn btn-sm btn-outline-secondary ms-2" :title="'Copy ' + user.u_phone"
              @click="copyToClipboard(user.u_phone, $event)">
              <i class="bi bi-clipboard"></i>
            </button>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td>{{ formatDate(user.lastLoginTime) }}</td>
          <td>{{ calculateDaysBefore(user.lastLoginTime) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav>
      <ul class="pagination">
        <!-- Previous Button -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="changePage('previous')">
          <a class="page-link" href="#">Previous</a>
        </li>

        <!-- First Page -->
        <li class="page-item" v-if="startPage > 1" @click="changePage(1)">
          <a class="page-link" href="#">1</a>
        </li>

        <!-- Ellipsis Before -->
        <li class="page-item disabled" v-if="startPage > 2">
          <a class="page-link" href="#">...</a>
        </li>

        <!-- Dynamic Page Numbers -->
        <li class="page-item" :class="{ active: page === currentPage }" v-for="page in displayedPages" :key="page"
          @click="changePage(page)">
          <a class="page-link" href="#">{{ page }}</a>
        </li>

        <!-- Ellipsis After -->
        <li class="page-item disabled" v-if="endPage < totalPages">
          <a class="page-link" href="#">...</a>
        </li>

        <!-- Last Page -->
        <li class="page-item" v-if="endPage < totalPages" @click="changePage(totalPages)">
          <a class="page-link" href="#">{{ totalPages }}</a>
        </li>

        <!-- Next Button -->
        <li class="page-item" :class="{ disabled: !hasNextPage }" @click="changePage('next')">
          <a class="page-link" href="#">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";

import {
  collection,
  query,
  orderBy,
  where,
  startAfter,
  limit,
  getCountFromServer,
  getDocs,
} from "firebase/firestore";

import { db } from "../main";

export default {
  setup() {
    const users = ref([]);
    const allUsers = ref([]);
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;
      return users.value.filter((user) =>
        user.u_phone?.toString().includes(searchQuery.value.toString())
      );
    });
    const searchQuery = ref("");
    const currentPage = ref(1);
    const pageSize = 15;
    const totalRecords = ref(0);
    const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize));
    const lastVisible = ref(null);
    const hasNextPage = ref(true);
    const sortColumn = ref("lastLoginTime");
    const sortOrder = ref("desc");
    const currentFilter = ref("48 hrs");
    const isLoading = ref(false);
    const maxVisiblePages = 10;

    const startPage = computed(() => Math.max(currentPage.value - Math.floor(maxVisiblePages / 2), 1));
    const endPage = computed(() => Math.min(startPage.value + maxVisiblePages - 1, totalPages.value));


    const pageSnapshots = ref([]); // Track snapshots for each page

    const hasPreviousPage = computed(() => currentPage.value > 1);



    const copyToClipboard = (text, userId, event) => {
    navigator.clipboard.writeText(text)
        .then(() => {
          console.log("Copied:", text);  // Feedback in console (optional)
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    };


    const searchPhoneNumber = async () => {
      try {
        isLoading.value = true;
        currentPage.value = 1; // Reset to the first page
        lastVisible.value = null; // Reset pagination

        const now = Date.now();
        let filterTimestamp;

        // Determine the filter timestamp based on the selected filter
        switch (currentFilter.value) {
          case "48 hrs":
            filterTimestamp = now - 48 * 60 * 60 * 1000;
            break;
          case "7 days":
            filterTimestamp = now - 7 * 24 * 60 * 60 * 1000;
            break;
          case "15 days":
            filterTimestamp = now - 15 * 24 * 60 * 60 * 1000;
            break;
          case "30 days":
            filterTimestamp = now - 30 * 24 * 60 * 60 * 1000;
            break;
          case "60 days":
            filterTimestamp = now - 60 * 24 * 60 * 60 * 1000;
            break;
          case "90 days":
            filterTimestamp = now - 90 * 24 * 60 * 60 * 1000;
            break;
          case "All users":
          default:
            filterTimestamp = null;
        }

        // Query to count total records matching the search query and filter
        const countQuery = query(
          collection(db, "users"),
          ...(filterTimestamp !== null
            ? [where("lastLoginTime", ">=", filterTimestamp)]
            : []),
          where("u_phone", ">=", searchQuery.value),
          where("u_phone", "<=", searchQuery.value + "\uf8ff")
        );

        const countSnapshot = await getCountFromServer(countQuery);
        totalRecords.value = countSnapshot.data().count; // Update total records

        // Query to fetch the first page of matching users
        const baseQuery = query(
          collection(db, "users"),
          ...(filterTimestamp !== null
            ? [where("lastLoginTime", ">=", filterTimestamp)]
            : []),
          orderBy("u_phone"),
          where("u_phone", ">=", searchQuery.value),
          where("u_phone", "<=", searchQuery.value + "\uf8ff"),
          limit(pageSize)
        );

        const querySnapshot = await getDocs(baseQuery);

        if (!querySnapshot.empty) {
          users.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          lastVisible.value = querySnapshot.docs[querySnapshot.docs.length - 1];
          hasNextPage.value = querySnapshot.docs.length === pageSize;
        } else {
          users.value = [];
          hasNextPage.value = false;
        }
      } catch (error) {
        console.error("Error searching phone numbers:", error);
      } finally {
        isLoading.value = false;  // Stop loading
      }

    };

    const displayedPages = computed(() => {
      const maxPages = 5;
      const pages = [];
      const start = Math.max(currentPage.value - Math.floor(maxPages / 2), 1);
      const end = Math.min(start + maxPages - 1, totalPages.value);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    });

    const fetchTotalRecords = async (filter) => {
      try {
        isLoading.value = true;
        const now = Date.now();
        let filterTimestamp;

        switch (filter) {
          case "48 hrs":
            filterTimestamp = now - 48 * 60 * 60 * 1000;
            break;
          case "7 days":
            filterTimestamp = now - 7 * 24 * 60 * 60 * 1000;
            break;
          case "15 days":
            filterTimestamp = now - 15 * 24 * 60 * 60 * 1000;
            break;
          case "30 days":
            filterTimestamp = now - 30 * 24 * 60 * 60 * 1000;
            break;
          case "60 days":
            filterTimestamp = now - 60 * 24 * 60 * 60 * 1000;
            break;
          case "90 days":
            filterTimestamp = now - 90 * 24 * 60 * 60 * 1000;
            break;
          case "All users":
          default:
            filterTimestamp = null;
        }

        const baseQuery = query(
          collection(db, "users"),
          ...(filterTimestamp !== null
            ? [where("lastLoginTime", ">=", filterTimestamp)]
            : []),
          where("u_phone", ">=", searchQuery.value),
          where("u_phone", "<=", searchQuery.value + "\uf8ff")

        );

        const snapshot = await getCountFromServer(baseQuery);
        totalRecords.value = await snapshot.data().count;
        totalPages.value = await Math.ceil(totalRecords.value / pageSize);
      }
      catch (error) {
        console.error("Error fetching total records:", error);
      } finally {
        isLoading.value = false;  // Stop loading
      }

    };

    const fetchUsers = async (direction = "next", filter = "48 hrs") => {
      try {
        isLoading.value = false;
        const now = Date.now();
        let filterTimestamp;

        switch (filter) {
          case "48 hrs":
            filterTimestamp = now - 48 * 60 * 60 * 1000;
            break;
          case "7 days":
            filterTimestamp = now - 7 * 24 * 60 * 60 * 1000;
            break;
          case "15 days":
            filterTimestamp = now - 15 * 24 * 60 * 60 * 1000;
            break;
          case "30 days":
            filterTimestamp = now - 30 * 24 * 60 * 60 * 1000;
            break;
          case "60 days":
            filterTimestamp = now - 60 * 24 * 60 * 60 * 1000;
            break;
          case "90 days":
            filterTimestamp = now - 90 * 24 * 60 * 60 * 1000;
            break;
          case "All users":
          default:
            filterTimestamp = null;
        }
        let baseQuery = query(
          collection(db, "users"),
          orderBy(sortColumn.value, sortOrder.value),
          ...(filterTimestamp !== null
            ? [where("lastLoginTime", ">=", filterTimestamp)]
            : []),

          where("u_phone", ">=", searchQuery.value),
          where("u_phone", "<=", searchQuery.value + "\uf8ff"),

          limit(pageSize)

        );

        if (direction === "next" && pageSnapshots.value[currentPage.value - 1]) {
          baseQuery = query(baseQuery, startAfter(pageSnapshots.value[currentPage.value - 1]));
        }

        const snapshot = await getDocs(baseQuery);
        if (!snapshot.empty) {
          users.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (direction === "next") {
            pageSnapshots.value[currentPage.value] = snapshot.docs[snapshot.docs.length - 1];
          }

          hasNextPage.value = snapshot.docs.length === pageSize;
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      finally {
        isLoading.value = false;  // Stop loading
      }
    };

    const changePage = async (pageOrDirection) => {
      if (pageOrDirection === "next" && hasNextPage.value) {
        currentPage.value++;
        await fetchUsers("next", currentFilter.value);
      } else if (pageOrDirection === "previous" && hasPreviousPage.value) {
        currentPage.value--;
        await fetchUsers("next", currentFilter.value);
      } else if (typeof pageOrDirection === "number" && pageOrDirection !== currentPage.value) {
        currentPage.value = pageOrDirection;
        await fetchUsers("next", currentFilter.value);
      }
    };

    const sortBy = async (column) => {
      if (sortColumn.value === column) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
      } else {
        sortColumn.value = column;
        sortOrder.value = "asc";
      }
      currentPage.value = 1;
      lastVisible.value = null;
      await fetchUsers("next", currentFilter.value);
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return "N/A";
      const date = new Date(Number(timestamp));
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const calculateDaysBefore = (timestamp) => {
      if (!timestamp) return "N/A";
      const now = Date.now();
      const lastLogin = Number(timestamp);
      const differenceInDays = Math.floor((now - lastLogin) / (24 * 60 * 60 * 1000));
      return differenceInDays;
    };

    const applyFilter = async (filter) => {
      currentFilter.value = filter;
      currentPage.value = 1;
      pageSnapshots.value = [];
      await fetchTotalRecords(filter); // Fetch total records for the new filter
      await fetchUsers("next", filter);
    };


    const exportToCSV = async () => {
      const csvRows = [
        ["Name", "Phone Number", "Created On", "Last Sign-In", "Days Before (Last Login)"]
      ];

      // Fetch all filtered users based on the current filter
      const now = Date.now();
      let filterTimestamp;

      switch (currentFilter.value) {
        case "48 hrs":
          filterTimestamp = now - 48 * 60 * 60 * 1000;
          break;
        case "7 days":
          filterTimestamp = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "15 days":
          filterTimestamp = now - 15 * 24 * 60 * 60 * 1000;
          break;
        case "30 days":
          filterTimestamp = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case "60 days":
          filterTimestamp = now - 60 * 24 * 60 * 60 * 1000;
          break;
        case "90 days":
          filterTimestamp = now - 90 * 24 * 60 * 60 * 1000;
          break;
        case "All users":
        default:
          filterTimestamp = null;
      }

      const baseQuery = query(
        collection(db, "users"),
        orderBy("lastLoginTime", sortOrder.value),
        ...(filterTimestamp !== null
          ? [where("lastLoginTime", ">=", filterTimestamp)]
          : []),
        ...(searchQuery.value
          ? [
            where("u_phone", ">=", searchQuery.value),
            where("u_phone", "<=", searchQuery.value + "\uf8ff")
          ]
          : [])
      );

      const querySnapshot = await getDocs(baseQuery);

      // Generate rows for the new records only
      const usersToExport = [];
      querySnapshot.forEach((doc) => {
        usersToExport.push({ id: doc.id, ...doc.data() });
      });

      usersToExport.forEach((user) => {
        csvRows.push([
          user.u_name || "N/A",
          user.u_phone,
          formatDate(user.createdAt),
          formatDate(user.notificationToken?.lastupdated),
          calculateDaysBefore(user.notificationToken?.lastupdated)
        ]);
      });

      // Create and trigger CSV download
      const csvContent = csvRows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "filtered_users.csv";
      link.click();
      URL.revokeObjectURL(url);
    };

    onMounted(async () => {
      await fetchTotalRecords("48 hrs");
      await fetchUsers("next", "48 hrs");
    });

    return {
      users,
      filteredUsers,
      searchQuery,
      searchPhoneNumber,
      currentPage,
      totalPages,
      displayedPages,
      startPage,
      endPage,
      hasNextPage,
      exportToCSV,
      fetchUsers,
      changePage,
      sortBy,
      applyFilter,
      currentFilter,
      calculateDaysBefore,
      formatDate,
      totalRecords,
      sortColumn,
      sortOrder,
      isLoading,
      copyToClipboard
    };
  },
};
</script>


<style>
.tooltip {
  pointer-events: none !important;
}
</style>
