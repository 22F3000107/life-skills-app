// export default {
//   name: "AdminSettings",
//   data() {
//     return {
//       admin: {
//         name: "Admin",
//         email: "admin@lifeskillsapp.com",
//         password: "",
//         confirmPassword: ""
//       },
//       darkMode: false,
//       twoFactorAuth: true,
//       maintenanceMode: false,
//       userApprovalRequired: true,
//       message: ""
//     };
//   },
//   methods: {
//     saveSettings() {
//       if (this.admin.password !== this.admin.confirmPassword) {
//         this.message = "❌ Passwords do not match.";
//         return;
//       }
//       // Placeholder for real backend save
//       this.message = "✅ Settings saved successfully.";
//     }
//   },
//   template: `
//     <div class="container mt-4 mb-5">
//       <div class="text-center mb-4">
//         <i class="bi bi-gear-fill fs-1 text-primary"></i>
//         <h2 class="fw-bold mt-2">Admin Settings</h2>
//         <p class="text-muted">Manage your admin preferences and system settings.</p>
//       </div>

//       <div class="card shadow-sm p-4">
//         <!-- Admin Profile -->
//         <h5 class="mb-3">
//           <i class="bi bi-person-fill-gear me-2 text-secondary"></i>Admin Profile
//         </h5>
//         <div class="row mb-3">
//           <div class="col-md-6">
//             <label class="form-label">Name</label>
//             <input v-model="admin.name" class="form-control" type="text" />
//           </div>
//           <div class="col-md-6">
//             <label class="form-label">Email</label>
//             <input v-model="admin.email" class="form-control" type="email" />
//           </div>
//         </div>

//         <!-- Password Section -->
//         <div class="row mb-3">
//           <div class="col-md-6">
//             <label class="form-label">New Password</label>
//             <input v-model="admin.password" class="form-control" type="password" placeholder="Enter new password" />
//           </div>
//           <div class="col-md-6">
//             <label class="form-label">Confirm Password</label>
//             <input v-model="admin.confirmPassword" class="form-control" type="password" placeholder="Re-enter password" />
//           </div>
//         </div>

//         <hr />

//         <!-- Preferences -->
//         <h5 class="mb-3">
//           <i class="bi bi-sliders2-vertical me-2 text-secondary"></i>Preferences
//         </h5>
//         <div class="form-check form-switch mb-2">
//           <input class="form-check-input" type="checkbox" v-model="darkMode" id="darkModeSwitch" />
//           <label class="form-check-label" for="darkModeSwitch">
//             <i class="bi bi-moon-stars-fill me-1"></i> Enable Dark Mode
//           </label>
//         </div>
//         <div class="form-check form-switch mb-2">
//           <input class="form-check-input" type="checkbox" v-model="twoFactorAuth" id="twoFASwitch" />
//           <label class="form-check-label" for="twoFASwitch">
//             <i class="bi bi-shield-lock-fill me-1"></i> Enable Two-Factor Authentication
//           </label>
//         </div>

//         <hr />

//         <!-- App Controls -->
//         <h5 class="mb-3">
//           <i class="bi bi-tools me-2 text-secondary"></i>App Controls
//         </h5>
//         <div class="form-check form-switch mb-2">
//           <input class="form-check-input" type="checkbox" v-model="maintenanceMode" id="maintenanceSwitch" />
//           <label class="form-check-label" for="maintenanceSwitch">
//             <i class="bi bi-wrench-adjustable-circle-fill me-1"></i> Put App in Maintenance Mode
//           </label>
//         </div>
//         <div class="form-check form-switch mb-4">
//           <input class="form-check-input" type="checkbox" v-model="userApprovalRequired" id="approvalSwitch" />
//           <label class="form-check-label" for="approvalSwitch">
//             <i class="bi bi-person-check-fill me-1"></i> Require Admin Approval for New Academic Users
//           </label>
//         </div>

//         <!-- Save Button -->
//         <div class="d-grid">
//           <button class="btn btn-primary" @click="saveSettings">
//             <i class="bi bi-save2 me-1"></i> Save Settings
//           </button>
//         </div>

//         <!-- Message -->
//         <p class="mt-3 text-center" 
//            :class="{ 'text-success': message.includes('✅'), 'text-danger': message.includes('❌') }">
//           <i v-if="message.includes('✅')" class="bi bi-check-circle-fill me-1"></i>
//           <i v-if="message.includes('❌')" class="bi bi-x-circle-fill me-1"></i>
//           {{ message }}
//         </p>
//       </div>
//     </div>
//   `
// };

import { getAdminSettings, updateAdminSettings } from "../utils/api.js";

export default {
  name: "AdminSettings",
  data() {
    return {
      admin: {
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      },
      darkMode: false,
      twoFactorAuth: false,
      maintenanceMode: false,
      userApprovalRequired: false,
      message: ""
    };
  },
  methods: {
    async loadSettings() {
      try {
        const token = localStorage.getItem("auth-token");
        const res = await getAdminSettings(token);
        this.admin.name = res.name;
        this.admin.email = res.email;
        this.darkMode = res.preferences.darkMode;
        this.twoFactorAuth = res.preferences.twoFactorAuth;
        this.maintenanceMode = res.preferences.maintenanceMode;
        this.userApprovalRequired = res.preferences.userApprovalRequired;
      } catch (err) {
        this.message = "❌ Failed to load settings.";
        console.error(err);
      }
    },

    async saveSettings() {
      if (this.admin.password && this.admin.password !== this.admin.confirmPassword) {
        this.message = "❌ Passwords do not match.";
        return;
      }

      try {
        const token = localStorage.getItem("auth-token");
        const payload = {
          name: this.admin.name,
          email: this.admin.email,
          password: this.admin.password || null,
          preferences: {
            darkMode: this.darkMode,
            twoFactorAuth: this.twoFactorAuth,
            maintenanceMode: this.maintenanceMode,
            userApprovalRequired: this.userApprovalRequired
          }
        };

        const res = await updateAdminSettings(payload, token);
        this.message = "✅ Settings saved successfully.";
      } catch (err) {
        console.error(err);
        this.message = "❌ Failed to save settings.";
      }
    }
  },
  mounted() {
    this.loadSettings();
  }
};



// This code defines an AdminSettings component for managing admin settings in a Vue.js application.
// It includes fields for admin profile, preferences like dark mode and two-factor authentication, and app controls like maintenance mode and user approval.
// The component provides a form for updating these settings and displays success or error messages based on the actions taken.
// The saveSettings method checks for password confirmation and simulates saving settings, updating the message accordingly.
// The template uses Bootstrap classes for styling and layout, ensuring a responsive design.
// The component is structured to be user-friendly, with clear labels and organized sections for easy navigation and understanding of the settings available to the admin user.
// This code defines an AdminSettings component for managing admin settings in a Vue.js application.