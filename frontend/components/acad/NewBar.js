export default {
  name: "NewBar",
  data() {
    return {
      role: null
    };
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
        <router-link to="/acad/home" exact-active-class="router-link-exact-active" class="nav-link text-dark">
          🏠 Home
        </router-link>
        <router-link to="/acad/modules" exact-active-class="router-link-exact-active" class="nav-link text-dark">
          ✍️ Modules
        </router-link>
        <router-link to="/acad/question-bank" exact-active-class="router-link-exact-active" class="nav-link text-dark">
          📚 Question Bank
        </router-link>
        <router-link to="/acad/concepts" exact-active-class="router-link-exact-active" class="nav-link text-dark">
          🔍 Concepts
        </router-link>
      </nav>

      <!-- Back / Forward Buttons -->
      <div class="p-3 border-top d-flex gap-2 justify-content-between">
        <button class="btn btn-outline-secondary btn-sm w-50" @click="goBack">⬅️ Back</button>
        <button class="btn btn-outline-secondary btn-sm w-50" @click="goForward">➡️ Next</button>
      </div>

      <!-- Logout -->
      <div class="p-3 border-top">
        <button class="btn btn-outline-danger btn-sm w-100" @click="logout">🚪 Logout</button>
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
      this.$router.go(-1);
    },
    goForward() {
      this.$router.go(1);
    }
  },
  mounted() {
    this.role = localStorage.getItem('role');
  }
};
