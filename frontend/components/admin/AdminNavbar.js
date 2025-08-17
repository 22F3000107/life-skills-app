export default {
  name: "AdminNavbar",
  template: `
    <div class="sidebar d-flex flex-column bg-dark text-white vh-100 shadow-sm" style="width: 220px;">
      
      <!-- Logo + Admin Title -->
      <div class="p-3 border-bottom text-center">
        <img src="./images/lifeskills-logo.png" alt="Life Skills Logo" height="50" class="mb-2" />
        <h6 class="fw-bold text-white">Admin Panel</h6>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-grow-1 nav flex-column p-2">
        <router-link to="/admin" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-speedometer2 me-2"></i> Dashboard
        </router-link>
        <router-link to="/admin/users" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-people-fill me-2"></i> Manage Users
        </router-link>
        <router-link to="/admin/stories" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-journals me-2"></i> Manage Stories
        </router-link>
        <router-link to="/admin/quizzes" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-puzzle-fill me-2"></i> Manage Quizzes
        </router-link>
        <router-link to="/admin/flagged" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-flag-fill me-2"></i> Flagged Content
        </router-link>
        <router-link to="/admin/reports" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-bar-chart-line-fill me-2"></i> Reports & Analytics
        </router-link>
        <router-link to="/admin/reminders" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-bell-fill me-2"></i> Reminder Settings
        </router-link>
        <router-link to="/admin/settings" exact-active-class="router-link-exact-active" class="nav-link text-white">
          <i class="bi bi-gear-fill me-2"></i> Settings
        </router-link>
      </nav>

      <!-- Back / Forward Buttons -->
        <div class="p-3 border-top border-white border-opacity-20" v-if="!isCollapsed">
          <div class="d-flex gap-2 mb-3">
            <button 
              class="btn btn-outline-light btn-sm flex-fill"
              @click="goBack"
              style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
            >
              <i class="bi bi-arrow-left me-1"></i>
              Back
            </button>
            <button 
              class="btn btn-outline-light btn-sm flex-fill"
              @click="goForward"
              style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);"
            >
              Forward
              <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>

      <!-- Logout -->
      <div class="p-3 border-top">
        <button class="btn btn-outline-light btn-sm w-100" @click="logout">
          <i class="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </div>
  `,
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      this.$router.push('/login');
      },
    goBack() {
      this.$router.go(-1); // Go back one step in history
    },
    goForward() {
      this.$router.go(1); // Go forward one step in history
    }
  }
};


// This code defines an Admin Navbar component for a Vue.js application.
// It provides a sidebar navigation menu for admin users with links to various admin functionalities.
// The navbar includes links to the admin dashboard, user management, story management, quiz management,
// flagged content, reports, reminder settings, and general settings.
// It also includes a logout button that clears local storage and redirects to the login page.
// The component uses Bootstrap classes for styling and Vue Router for navigation.
// The navbar is designed to be responsive and fits within a vertical layout, making it suitable for admin interfaces.
// The `exact-active-class` ensures that the active link is highlighted when the user is on the corresponding route.
// The component is structured to be easily expandable with additional admin features in the future