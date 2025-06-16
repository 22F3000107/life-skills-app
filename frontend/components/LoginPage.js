export default {
  name: "LoginPage",
  data() {
    return {
      email: '',
      password: '',
      role: 'user', // or 'admin' via dropdown
      error: ''
    };
  },
  template: `
    <div class="container mt-5" style="max-width: 400px;">
      <h2 class="text-center mb-4">Login</h2>
      <div class="mb-3">
        <label>Email</label>
        <input v-model="email" class="form-control" type="email" required>
      </div>
      <div class="mb-3">
        <label>Password</label>
        <input v-model="password" class="form-control" type="password" required>
      </div>
      <div class="mb-3">
        <label>Role</label>
        <select v-model="role" class="form-select">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="d-grid">
        <button class="btn btn-primary" @click="handleLogin">Login</button>
      </div>
      <p v-if="error" class="text-danger mt-3">{{ error }}</p>
    </div>
  `,
  methods: {
    handleLogin() {
      // Dummy check – Replace with actual API call in future
      if (this.email && this.password) {
        localStorage.setItem("auth-token", "dummy-token");
        localStorage.setItem("role", this.role);
        this.$router.push(this.role === 'admin' ? '/admin' : '/');
      } else {
        this.error = "Please enter valid credentials.";
      }
    }
  }
};
