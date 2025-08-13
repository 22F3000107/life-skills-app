import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../../utils/api.js";

export default {
  name: "SettingsPage",
  data() {
    return {
      profile: {
        name: "",
        email: ""
      },
      oldPassword: "",
      password: "",
      confirmPassword: "",
      profileSaved: false,
      passwordSaved: false,
      passwordError: "",
      showOldPassword: false,
      showPassword: false,
      showConfirmPassword: false
    };
  },
  async created() {
    try {
      const token = localStorage.getItem("auth-token");
      const data = await getUserProfile(token);
      this.profile.name = data.name;
      this.profile.email = data.email;
    } catch (error) {
      console.error("Failed to fetch user profile:", error.message);
    }
  },
  methods: {
    toggleVisibility(field) {
      this[field] = !this[field];
    },
    async saveProfile() {
      try {
        const token = localStorage.getItem("auth-token");
        await updateUserProfile(this.profile, token);
        this.profileSaved = true;
        setTimeout(() => (this.profileSaved = false), 2000);
      } catch (error) {
        console.error("Profile update failed:", error.message);
      }
    },
    async savePassword() {
      this.passwordError = "";
      this.passwordSaved = false;

      if (!this.oldPassword || !this.password || !this.confirmPassword) {
        this.passwordError = "Please fill in all password fields.";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.passwordError = "Passwords do not match.";
        return;
      }
      if (this.password.length < 6) {
        this.passwordError = "Password must be at least 6 characters.";
        return;
      }

      try {
        const token = localStorage.getItem("auth-token");
        const payload = {
          old_password: this.oldPassword,
          new_password: this.password
        };
        const response = await changePassword(payload, token);

        if (response.error) {
          this.passwordError = response.error;
          return;
        }

        this.passwordSaved = true;
        this.passwordError = "";
        this.oldPassword = "";
        this.password = "";
        this.confirmPassword = "";
        this.showOldPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;

        setTimeout(() => (this.passwordSaved = false), 2000);
      } catch (error) {
        console.error("Password change failed:", error.message);
        this.passwordError = "Failed to change password. Please check your old password.";
      }
    }
  },
  template: `
    <div class="container mt-4 mb-5" style="max-width: 600px;">
      <!-- Page Header -->
      <div class="text-center mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-gear-fill me-2 text-secondary"></i>Settings
        </h2>
        <p class="text-muted">Update your profile and account preferences</p>
      </div>

      <!-- Profile Info Section -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header fw-semibold">
          <i class="bi bi-person-fill me-2"></i>Profile Info
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input v-model="profile.name" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="profile.email" type="email" class="form-control" />
          </div>
          <button class="btn btn-success" @click="saveProfile">
            <i class="bi bi-save me-1"></i>Save Changes
          </button>
          <div v-if="profileSaved" class="alert alert-success mt-3">
            <i class="bi bi-check-circle me-1"></i>Profile updated successfully!
          </div>
        </div>
      </div>

      <!-- Password Change Section -->
      <div class="card shadow-sm">
        <div class="card-header fw-semibold">
          <i class="bi bi-lock-fill me-2"></i>Change Password
        </div>
        <div class="card-body">
          <div class="mb-3 position-relative">
            <label class="form-label">Old Password</label>
            <input
              :type="showOldPassword ? 'text' : 'password'"
              v-model="oldPassword"
              class="form-control"
              autocomplete="current-password"
            />
            <span
              class="password-toggle"
              @click="toggleVisibility('showOldPassword')"
              style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
              :title="showOldPassword ? 'Hide Password' : 'Show Password'"
            >
              <i :class="showOldPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </span>
          </div>

          <div class="mb-3 position-relative">
            <label class="form-label">New Password</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="form-control"
              autocomplete="new-password"
            />
            <span
              class="password-toggle"
              @click="toggleVisibility('showPassword')"
              style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
              :title="showPassword ? 'Hide Password' : 'Show Password'"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </span>
          </div>

          <div class="mb-3 position-relative">
            <label class="form-label">Confirm Password</label>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              class="form-control"
              autocomplete="new-password"
            />
            <span
              class="password-toggle"
              @click="toggleVisibility('showConfirmPassword')"
              style="position: absolute; top: 50%; right: 12px; transform: translateY(-50%); cursor: pointer;"
              :title="showConfirmPassword ? 'Hide Password' : 'Show Password'"
            >
              <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </span>
          </div>

          <button class="btn btn-primary" @click="savePassword">
            <i class="bi bi-key-fill me-1"></i>Update Password
          </button>

          <div v-if="passwordError" class="alert alert-danger mt-3">
            <i class="bi bi-exclamation-circle me-1"></i>{{ passwordError }}
          </div>
          <div v-if="passwordSaved" class="alert alert-success mt-3">
            <i class="bi bi-check-circle-fill me-1"></i>Password changed successfully!
          </div>
        </div>
      </div>
    </div>
  `
};


// This code defines a Vue.js component for the Settings page of a user profile.
// It allows users to update their profile information and change their password.
// The component includes data properties for the profile, password, and confirmation,
// as well as methods to save the profile and password changes.

