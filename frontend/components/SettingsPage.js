export default {
  name: "SettingsPage",
  data() {
    return {
      profile: {
        name: "Riya Sharma",
        email: "riya@example.com"
      },
      password: '',
      confirmPassword: '',
      profileSaved: false,
      passwordSaved: false,
      passwordError: ''
    };
  },
  methods: {
    saveProfile() {
      this.profileSaved = true;
      setTimeout(() => (this.profileSaved = false), 2000);
    },
    savePassword() {
      if (this.password !== this.confirmPassword) {
        this.passwordError = "Passwords do not match.";
        this.passwordSaved = false;
        return;
      }
      if (this.password.length < 6) {
        this.passwordError = "Password must be at least 6 characters.";
        this.passwordSaved = false;
        return;
      }
      this.passwordSaved = true;
      this.passwordError = '';
      this.password = '';
      this.confirmPassword = '';
      setTimeout(() => (this.passwordSaved = false), 2000);
    }
  },
  template: `
    <div class="container mt-4 mb-5" style="max-width: 600px;">
      <div class="text-center mb-4">
        <h2 class="fw-bold">⚙️ Settings</h2>
        <p class="text-muted">Update your profile and account preferences</p>
      </div>

      <!-- Profile Section -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header fw-semibold">👤 Profile Info</div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input v-model="profile.name" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="profile.email" type="email" class="form-control" />
          </div>
          <button class="btn btn-success" @click="saveProfile">Save Changes</button>
          <div v-if="profileSaved" class="alert alert-success mt-3">Profile updated successfully!</div>
        </div>
      </div>

      <!-- Password Section -->
      <div class="card shadow-sm">
        <div class="card-header fw-semibold">🔒 Change Password</div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">New Password</label>
            <input v-model="password" type="password" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Confirm Password</label>
            <input v-model="confirmPassword" type="password" class="form-control" />
          </div>
          <button class="btn btn-primary" @click="savePassword">Update Password</button>

          <div v-if="passwordError" class="alert alert-danger mt-3">{{ passwordError }}</div>
          <div v-if="passwordSaved" class="alert alert-success mt-3">Password changed successfully!</div>
        </div>
      </div>
    </div>
  `
};
