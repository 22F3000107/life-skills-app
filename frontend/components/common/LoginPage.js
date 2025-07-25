// import { loginUser } from '../utils/api.js';  

// export default {
//   name: "LoginPage",
//   data() {
//     return {
//       email: '',
//       password: '',
//       error: ''
//     };
//   },
//   methods: {
//     async handleLogin() {
//       if (!this.email || !this.password) {
//         this.error = "Please enter valid credentials.";
//         return;
//       }

//       try {
//         const response = await loginUser({
//           email: this.email,
//           password: this.password
//         });

//         if (response.access_token) {
//           localStorage.setItem("auth-token", response.access_token);
//           localStorage.setItem("role", response.roles);
//           localStorage.setItem("user_id", response.user_id);

//           if (response.roles === "admin") {
//             this.$router.push("/admin");
//           } else {
//             this.$router.push("/");
//           }
//         } else {
//           this.error = response.error || "Login failed. Please try again.";
//         }
//       } catch (err) {
//         console.error("Login error:", err);
//         this.error = "Server error. Please try again later.";
//       }
//     }
//   },
//   template: `
//     <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
//       <div class="card shadow p-4" style="width: 100%; max-width: 400px;">
//         <div class="text-center mb-4">
//           <i class="bi bi-shield-lock-fill fs-1 text-primary mb-2"></i>
//           <h3 class="fw-bold">Login</h3>
//         </div>

//         <!-- Email Field -->
//         <div class="mb-3">
//           <label class="form-label">Email Address*</label>
//           <input
//             v-model="email"
//             type="email"
//             class="form-control"
//             required
//             placeholder="Enter your email"
//           />
//         </div>

//         <!-- Password Field -->
//         <div class="mb-3">
//           <label class="form-label">Password*</label>
//           <input
//             v-model="password"
//             type="password"
//             class="form-control"
//             required
//             placeholder="Enter your password"
//           />
//         </div>

//         <!-- Login Button -->
//         <button class="btn btn-primary w-100 mb-2" @click="handleLogin">
//           <i class="bi bi-box-arrow-in-right me-1"></i>Login
//         </button>

//         <!-- Register Redirect -->
//         <p class="text-center mb-0">
//           Don't have an account?
//           <router-link to="/register">Sign up</router-link>
//         </p>

//         <!-- Error Message -->
//         <p v-if="error" class="text-danger mt-3 text-center">
//           <i class="bi bi-exclamation-circle-fill me-1"></i>{{ error }}
//         </p>
//       </div>
//     </div>
//   `
// };


import { loginUser } from '../utils/api.js';  

export default {
  name: "LoginPage",
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      if (!this.email || !this.password) {
        this.error = "Please enter valid credentials.";
        return;
      }

      try {
        const response = await loginUser({
          email: this.email,
          password: this.password
        });

        if (response.access_token) {
          localStorage.setItem("auth-token", response.access_token);
          localStorage.setItem("role", response.roles);
          localStorage.setItem("user_id", response.user_id);

          if (response.roles === "admin") {
            this.$router.push("/admin/dashboard");
          } else if (response.roles === "academic") {
            this.$router.push("/academic/dashboard");
          } else {
            this.$router.push("/user/home");
          }
        } else {
          this.error = response.error || "Login failed. Please try again.";
        }

      } catch (err) {
        console.error("Login error:", err);
        this.error = "Server error. Please try again later.";
      }
    }
  },
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card shadow p-4" style="width: 100%; max-width: 400px;">
        <div class="text-center mb-4">
          <i class="bi bi-shield-lock-fill fs-1 text-primary mb-2"></i>
          <h3 class="fw-bold">Login</h3>
        </div>

        <!-- Email Field -->
        <div class="mb-3">
          <label class="form-label">Email Address*</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            required
            placeholder="Enter your email"
          />
        </div>

        <!-- Password Field -->
        <div class="mb-3">
          <label class="form-label">Password*</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            required
            placeholder="Enter your password"
          />
        </div>

        <!-- Login Button -->
        <button class="btn btn-primary w-100 mb-2" @click="handleLogin">
          <i class="bi bi-box-arrow-in-right me-1"></i>Login
        </button>

        <!-- Register Redirect -->
        <p class="text-center mb-0">
          Don't have an account?
          <router-link to="/register">Sign up</router-link>
        </p>

        <!-- Error Message -->
        <p v-if="error" class="text-danger mt-3 text-center">
          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ error }}
        </p>
      </div>
    </div>
  `
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