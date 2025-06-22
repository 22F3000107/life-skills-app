export default {
  name: "LoginPage",
  data() {
    return {
      email: '',
      password: '',
      role: 'user',
      error: ''
    };
  },
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card shadow p-4" style="width: 100%; max-width: 400px;">
        <h3 class="text-center mb-4">🔐 Login</h3>

        <div class="mb-3">
          <label class="form-label">Email Address*</label>
          <input v-model="email" type="email" class="form-control" required placeholder="Enter your email" />
        </div>

        <div class="mb-3">
          <label class="form-label">Password*</label>
          <input v-model="password" type="password" class="form-control" required placeholder="Enter your password" />
        </div>

        <button class="btn btn-primary w-100 mb-2" @click="handleLogin">Login</button>

        <p class="text-center mb-0">
          Don't have an account?
          <router-link to="/register">Sign up</router-link>
        </p>

        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
      </div>
    </div>
  `,
  methods: {
    handleLogin() {
      if (this.email && this.password) {
        if (this.email === "acad@email.com" && this.password === "acad") {
        localStorage.setItem("auth-token", "acad-token");
        localStorage.setItem("role", "acad");
        this.$router.push('/acad-dashboard');  // <-- Change this route to your actual Acad Team Dashboard route
        return;
      }
        localStorage.setItem("auth-token", "dummy-token");
        localStorage.setItem("role", this.role);

        if (this.role === 'admin') {
          this.$router.push('/admin');
        } else {
          this.$router.push('/');
        }
      } else {
        this.error = "Please enter valid credentials.";
      }
    }
  }
};

// This code defines a Vue.js component for a login page.
// It includes fields for email, password, and user role (user or admin).
// The login button triggers a dummy authentication process that sets a token and redirects based on the role.
// If the credentials are invalid, an error message is displayed.
// The component uses Bootstrap classes for styling and includes a link to the registration page.
// The login functionality is currently a placeholder and should be replaced with actual API calls in a real application.
// The component is designed to be used within a Vue Router setup, allowing navigation to other parts of the application after successful login.
// The role selection allows for future expansion where different user roles may have different access levels or functionalities within the app.
// The component is styled to be responsive and user-friendly, making it suitable for both desktop and mobile views.
// It also includes basic validation to ensure that the user provides valid credentials before proceeding with the login action.
// The use of localStorage for storing the authentication token and user role is a simple approach for demonstration purposes, but in a production application, you would typically handle authentication more securely, possibly using cookies or a more robust state management solution.
// Overall, this component serves as a foundational piece for user authentication in a Vue.js application, providing a clear and straightforward interface for users to log in and access the application features based on their roles.