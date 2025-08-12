// import { changeAdminPassword } from "../../utils/api.js";

// export default {
//   name: "AdminSettings",
//   data() {
//     return {
//       oldPassword: "",
//       password: "",
//       confirmPassword: "",
//       message: "",
//       messageType: "", // "success" or "error"
//       showOldPassword: false,
//       showPassword: false,
//       showConfirmPassword: false,
//     };
//   },
//   methods: {
//     toggleVisibility(field) {
//       this[field] = !this[field];
//     },
//     async updatePassword() {
//       this.message = "";
//       this.messageType = "";

//       if (!this.oldPassword || !this.password || !this.confirmPassword) {
//         this.message = "Please fill in all fields.";
//         this.messageType = "error";
//         return;
//       }

//       if (this.password !== this.confirmPassword) {
//         this.message = "New passwords do not match.";
//         this.messageType = "error";
//         return;
//       }

//       try {
//         const token = localStorage.getItem("auth-token");
//         const payload = {
//           old_password: this.oldPassword,
//           new_password: this.password,
//         };

//         const response = await changeAdminPassword(payload, token);

//         if (response.error) {
//           this.message = response.error;
//           this.messageType = "error";
//           return;
//         }

//         this.message = "Password updated successfully.";
//         this.messageType = "success";

//         this.oldPassword = "";
//         this.password = "";
//         this.confirmPassword = "";
//         this.showOldPassword = false;
//         this.showPassword = false;
//         this.showConfirmPassword = false;
//       } catch (err) {
//         console.error(err);
//         this.message = "Failed to update password. Please check your old password.";
//         this.messageType = "error";
//       }
//     },
//   },
//   template: `
//     <div class="admin-settings container p-4" style="max-width: 400px;">
//       <h2 class="mb-4">Change Admin Password</h2>

//       <div class="mb-3 position-relative">
//         <input
//           :type="showOldPassword ? 'text' : 'password'"
//           class="form-control"
//           v-model="oldPassword"
//           placeholder="Old Password"
//           autocomplete="current-password"
//         />
//         <span
//           class="password-toggle"
//           @click="toggleVisibility('showOldPassword')"
//           style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
//           :title="showOldPassword ? 'Hide Password' : 'Show Password'"
//         >
//           <i :class="showOldPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
//         </span>
//       </div>

//       <div class="mb-3 position-relative">
//         <input
//           :type="showPassword ? 'text' : 'password'"
//           class="form-control"
//           v-model="password"
//           placeholder="New Password"
//           autocomplete="new-password"
//         />
//         <span
//           class="password-toggle"
//           @click="toggleVisibility('showPassword')"
//           style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
//           :title="showPassword ? 'Hide Password' : 'Show Password'"
//         >
//           <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
//         </span>
//       </div>

//       <div class="mb-3 position-relative">
//         <input
//           :type="showConfirmPassword ? 'text' : 'password'"
//           class="form-control"
//           v-model="confirmPassword"
//           placeholder="Confirm New Password"
//           autocomplete="new-password"
//         />
//         <span
//           class="password-toggle"
//           @click="toggleVisibility('showConfirmPassword')"
//           style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
//           :title="showConfirmPassword ? 'Hide Password' : 'Show Password'"
//         >
//           <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
//         </span>
//       </div>

//       <button class="btn btn-primary w-100" @click="updatePassword">Update Password</button>

//       <div v-if="message" class="mt-3" :class="{'text-success': messageType === 'success', 'text-danger': messageType === 'error'}">
//         <i :class="messageType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
//         <span class="ms-2">{{ message }}</span>
//       </div>
//     </div>
//   `
// // };

import { changeAdminPassword } from "../../utils/api.js";

export default {
  name: "AdminSettings",
  data() {
    return {
      oldPassword: "",
      password: "",
      confirmPassword: "",
      message: "",
      messageType: "", // "success" or "error"
      showOldPassword: false,
      showPassword: false,
      showConfirmPassword: false,
      passwordStrength: "", // Weak / Medium / Strong
    };
  },
  watch: {
    password(value) {
      this.passwordStrength = this.getPasswordStrength(value);
    }
  },
  methods: {
    toggleVisibility(field) {
      this[field] = !this[field];
    },
    getPasswordStrength(password) {
      if (!password) return "";
      const strongRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      const mediumRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
      if (strongRegex.test(password)) return "Strong";
      if (mediumRegex.test(password)) return "Medium";
      return "Weak";
    },
    async updatePassword() {
      this.message = "";
      this.messageType = "";

      if (!this.oldPassword || !this.password || !this.confirmPassword) {
        this.message = "Please fill in all fields.";
        this.messageType = "error";
        return;
      }

      if (this.oldPassword.length < 4) {
        this.message = "Old password seems too short.";
        this.messageType = "error";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.message = "New passwords do not match.";
        this.messageType = "error";
        return;
      }

      if (this.passwordStrength === "Weak") {
        this.message = "New password is too weak.";
        this.messageType = "error";
        return;
      }

      try {
        const token = localStorage.getItem("auth-token");
        const payload = {
          old_password: this.oldPassword,
          new_password: this.password,
        };

        const response = await changeAdminPassword(payload, token);

        if (response.error) {
          this.message = response.error;
          this.messageType = "error";
          return;
        }

        this.message = "Password updated successfully.";
        this.messageType = "success";

        this.oldPassword = "";
        this.password = "";
        this.confirmPassword = "";
        this.showOldPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;

        setTimeout(() => {
          this.message = "";
        }, 3000); // clear success after 3s
      } catch (err) {
        console.error(err);
        this.message = "Failed to update password. Please check your old password.";
        this.messageType = "error";
      }
    }
  },
  computed: {
    isFormValid() {
      return (
        this.oldPassword &&
        this.password &&
        this.confirmPassword &&
        this.password === this.confirmPassword &&
        this.passwordStrength !== "Weak"
      );
    }
  },
  template: `
    <div class="admin-settings container p-4" style="max-width: 400px;">
      <h2 class="mb-4">Change Admin Password</h2>

      <!-- Old password -->
      <div class="mb-3 position-relative">
        <input
          :type="showOldPassword ? 'text' : 'password'"
          class="form-control"
          v-model="oldPassword"
          placeholder="Old Password"
          autocomplete="current-password"
          @keyup.enter="updatePassword"
        />
        <span
          class="password-toggle"
          @click="toggleVisibility('showOldPassword')"
          style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
        >
          <i :class="showOldPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </span>
      </div>

      <!-- New password -->
      <div class="mb-3 position-relative">
        <input
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          v-model="password"
          placeholder="New Password"
          autocomplete="new-password"
          @keyup.enter="updatePassword"
        />
        <span
          class="password-toggle"
          @click="toggleVisibility('showPassword')"
          style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
        >
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </span>
        <small v-if="passwordStrength" 
               :class="{
                  'text-danger': passwordStrength === 'Weak', 
                  'text-warning': passwordStrength === 'Medium', 
                  'text-success': passwordStrength === 'Strong'
               }">
          Strength: {{ passwordStrength }}
        </small>
      </div>

      <!-- Confirm password -->
      <div class="mb-3 position-relative">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          class="form-control"
          v-model="confirmPassword"
          placeholder="Confirm New Password"
          autocomplete="new-password"
          @keyup.enter="updatePassword"
        />
        <span
          class="password-toggle"
          @click="toggleVisibility('showConfirmPassword')"
          style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
        >
          <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </span>
      </div>

      <button 
        class="btn btn-primary w-100" 
        @click="updatePassword"
        :disabled="!isFormValid">
        Update Password
      </button>

      <div v-if="message" class="mt-3" 
           :class="{'text-success': messageType === 'success', 'text-danger': messageType === 'error'}">
        <i :class="messageType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
        <span class="ms-2">{{ message }}</span>
      </div>
    </div>
  `
};






// This code defines an AdminSettings component for managing admin settings in a Vue.js application.
// It includes fields for admin profile, preferences like dark mode and two-factor authentication, and app controls like maintenance mode and user approval.
// The component provides a form for updating these settings and displays success or error messages based on the actions taken.
// The saveSettings method checks for password confirmation and simulates saving settings, updating the message accordingly.
// The template uses Bootstrap classes for styling and layout, ensuring a responsive design.
// The component is structured to be user-friendly, with clear labels and organized sections for easy navigation and understanding of the settings available to the admin user.
// This code defines an AdminSettings component for managing admin settings in a Vue.js application.