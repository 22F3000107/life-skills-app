export default {
  name: "AdminSettings",
  data() {
    return {
      admin: {
        name: "Admin",
        email: "admin@lifeskillsapp.com",
        password: "",
        confirmPassword: ""
      },
      darkMode: false,
      twoFactorAuth: true,
      maintenanceMode: false,
      userApprovalRequired: true,
      message: ""
    };
  },
  methods: {
    saveSettings() {
      if (this.admin.password !== this.admin.confirmPassword) {
        this.message = "❌ Passwords do not match.";
        return;
      }
      // Save settings to backend (placeholder)
      this.message = "✅ Settings saved successfully.";
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center fw-bold mb-4">⚙️ Admin Settings</h2>

      <div class="card shadow-sm p-4">
        <!-- Profile Settings -->
        <h5 class="mb-3">👤 Admin Profile</h5>
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input v-model="admin.name" class="form-control" type="text" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input v-model="admin.email" class="form-control" type="email" />
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">New Password</label>
            <input v-model="admin.password" class="form-control" type="password" placeholder="Enter new password" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Confirm Password</label>
            <input v-model="admin.confirmPassword" class="form-control" type="password" placeholder="Re-enter password" />
          </div>
        </div>

        <!-- Preferences -->
        <hr />
        <h5 class="mb-3">🧩 Preferences</h5>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" v-model="darkMode" id="darkModeSwitch" />
          <label class="form-check-label" for="darkModeSwitch">Enable Dark Mode</label>
        </div>

        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" v-model="twoFactorAuth" id="twoFASwitch" />
          <label class="form-check-label" for="twoFASwitch">Enable Two-Factor Authentication</label>
        </div>

        <!-- App Controls -->
        <hr />
        <h5 class="mb-3">🛠️ App Controls</h5>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" v-model="maintenanceMode" id="maintenanceSwitch" />
          <label class="form-check-label" for="maintenanceSwitch">Put App in Maintenance Mode</label>
        </div>

        <div class="form-check form-switch mb-4">
          <input class="form-check-input" type="checkbox" v-model="userApprovalRequired" id="approvalSwitch" />
          <label class="form-check-label" for="approvalSwitch">Require Admin Approval for New Academic Users</label>
        </div>

        <!-- Save Button -->
        <div class="d-grid">
          <button class="btn btn-primary" @click="saveSettings">Save Settings</button>
        </div>

        <!-- Message -->
        <p class="mt-3 text-center" :class="{ 'text-success': message.includes('✅'), 'text-danger': message.includes('❌') }">
          {{ message }}
        </p>
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