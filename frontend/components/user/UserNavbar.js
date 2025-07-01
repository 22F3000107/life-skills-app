export default {
  name: "UserNavbar",
  data() {
    return {
      role: null
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      this.$router.push('/login');
    }
  },
  mounted() {
    this.role = localStorage.getItem('role');
  },
  template: `
    <div class="sidebar d-flex flex-column bg-light vh-100 shadow-sm" style="width: 220px;">
      
      <!-- Logo + App Title -->
      <div class="p-3 border-bottom text-center">
        <img src="./images/lifeskills-logo.png" alt="Life Skills Logo" height="50" class="mb-2" />
        <h6 class="fw-bold text-primary">Life Skills</h6>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-grow-1 nav flex-column p-2">
        <router-link to="/" exact-active-class="router-link-exact-active" class="nav-link text-dark d-flex align-items-center">
          <i class="bi bi-house-door-fill me-2"></i> Home
        </router-link>
        <router-link to="/goals" exact-active-class="router-link-exact-active" class="nav-link text-dark d-flex align-items-center">
          <i class="bi bi-bullseye me-2"></i> Goal Tracker
        </router-link>
        <router-link to="/habits" exact-active-class="router-link-exact-active" class="nav-link text-dark d-flex align-items-center">
          <i class="bi bi-check2-square me-2"></i> Healthy Habits
        </router-link>
        <router-link to="/test" exact-active-class="router-link-exact-active" class="nav-link text-dark d-flex align-items-center">
          <i class="bi bi-lightbulb-fill me-2"></i> Take Test
        </router-link>
        <router-link to="/result" exact-active-class="router-link-exact-active" class="nav-link text-dark d-flex align-items-center">
          <i class="bi bi-bar-chart-line-fill me-2"></i> Summary
        </router-link>
        <router-link to="/settings" exact-active-class="router-link-exact-active" class="nav-link text-dark d-flex align-items-center">
          <i class="bi bi-gear-fill me-2"></i> Settings
        </router-link>
      </nav>

      <!-- Logout -->
      <div class="p-3 border-top">
        <button class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center" @click="logout">
          <i class="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </div>
  `
};



// This code defines a Vue.js component for a user navigation sidebar.
// It includes links to various sections of a life skills dashboard, such as home, goal tracker, healthy habits, tests, summary, and settings.
// The sidebar is styled with Bootstrap classes and includes a header with the title "Life Skills".
// A logout button is provided to clear authentication tokens and redirect the user to the login page.
