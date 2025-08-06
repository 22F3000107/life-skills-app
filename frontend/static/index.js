import router from "../utils/router.js";
import AdminNavbar from "../components/admin/AdminNavbar.js";
import UserNavbar from "../components/user/UserNavbar.js";
import PublicNavbar from "../components/common/PublicNavbar.js";
import NewBar from "../components/acad/NewBar.js";

new Vue({
  el: "#app",
  router,
  data() {
    return {
      userRole: localStorage.getItem("role") || null,
      publicPages: ["Login", "Register"],
    };
  },
  computed: {
    navbarComponent() {
      if (this.publicPages.includes(this.$route.name)) {
        return "PublicNavbar";
      }
      return this.userRole === "admin"
        ? "AdminNavbar"
        : this.userRole === "academic"
        ? "Newbar"
        : "UserNavbar";
    },
    isPublicPage() {
      return this.publicPages.includes(this.$route.name);
    },
  },
  watch: {
    "$route.name": function () {
      this.userRole = localStorage.getItem("role");
    },
  },
  template: `
    <div style="min-height: 100vh; background-color: #C0C0C0;">
      <!-- Public layout: top navbar -->
      <div v-if="isPublicPage">
        <component :is="navbarComponent" />
        <div class="container py-4">
          <router-view />
        </div>
      </div>

      <!-- Authenticated layout: sidebar + main view -->
      <div v-else class="d-flex">
        <component :is="navbarComponent" />
        <div class="flex-grow-1 p-3 w-100">
          <router-view />
        </div>
      </div>
    </div>
  `,
  components: {
    AdminNavbar,
    UserNavbar,
    PublicNavbar,
    Newbar: NewBar,
  },
});

// This code initializes a Vue.js application with a dynamic navbar that changes based on the user's role.
// It uses Vue Router for navigation and includes dummy navbar components for admin and user roles.
// The application structure allows for easy expansion with additional components and routes as needed.
// The navbar component is determined by the user's role stored in localStorage, defaulting to 'user' if not set.
// The application is styled with a light gray background color, and the navbars are styled with Bootstrap classes for a consistent look and feel.
// The `updated` lifecycle hook ensures that the navbar updates if the user's role changes during the session, such as after logging in or out
