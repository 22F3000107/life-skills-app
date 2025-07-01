export default {
  name: "ReminderSettings",
  data() {
    return {
      enabled: true,
      frequency: "Weekly",
      reminderType: {
        email: true,
        sms: false,
        inApp: true
      },
      inactivityDays: 7,
      previewMessage: "Hi there! We noticed you haven’t completed any activities this week. Let’s get back on track! 🚀",
      inactiveUsers: [
        { id: 1, name: "Riya Sharma", email: "riya@gmail.com", lastLogin: "2024-05-30" },
        { id: 2, name: "Aman Kumar", email: "amank@example.com", lastLogin: "2024-06-01" },
        { id: 3, name: "Priya Verma", email: "priya.verma@example.com", lastLogin: "2024-06-03" }
      ]
    };
  },
  methods: {
    saveSettings() {
      alert("✅ Reminder settings saved successfully!");
      // Future: Send to backend API
    },
    daysSince(dateStr) {
      const now = new Date();
      const last = new Date(dateStr);
      return Math.floor((now - last) / (1000 * 60 * 60 * 24));
    },
    sendReminder(user) {
      alert(`📩 Reminder sent to ${user.name} (${user.email})`);
    }
  },
  computed: {
    filteredInactiveUsers() {
      return this.inactiveUsers.filter(u => this.daysSince(u.lastLogin) >= this.inactivityDays);
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center fw-bold mb-4">
        <i class="bi bi-alarm-fill text-primary me-2"></i>Reminder Settings
      </h2>

      <div class="card shadow-sm p-4 mb-5">
        <!-- Enable Switch -->
        <div class="form-check form-switch mb-4">
          <input class="form-check-input" type="checkbox" v-model="enabled" id="reminderToggle" />
          <label class="form-check-label fw-semibold" for="reminderToggle">
            Enable Automatic Reminders
          </label>
        </div>

        <!-- Frequency -->
        <div class="mb-3">
          <label class="form-label fw-bold">Reminder Frequency</label>
          <select v-model="frequency" class="form-select" :disabled="!enabled">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        <!-- Channels -->
        <div class="mb-3">
          <label class="form-label fw-bold">Send Via</label>
          <div class="form-check">
            <input type="checkbox" class="form-check-input" v-model="reminderType.email" id="email" :disabled="!enabled" />
            <label class="form-check-label" for="email">Email</label>
          </div>
          <div class="form-check">
            <input type="checkbox" class="form-check-input" v-model="reminderType.sms" id="sms" :disabled="!enabled" />
            <label class="form-check-label" for="sms">SMS</label>
          </div>
          <div class="form-check">
            <input type="checkbox" class="form-check-input" v-model="reminderType.inApp" id="inApp" :disabled="!enabled" />
            <label class="form-check-label" for="inApp">In-App Notification</label>
          </div>
        </div>

        <!-- Inactivity Days -->
        <div class="mb-3">
          <label class="form-label fw-bold">Inactivity Threshold (Days)</label>
          <input type="number" v-model.number="inactivityDays" class="form-control" min="1" max="30" :disabled="!enabled" />
        </div>

        <!-- Message Preview -->
        <div class="mb-3">
          <label class="form-label fw-bold">Sample Reminder Message</label>
          <textarea class="form-control" rows="3" v-model="previewMessage" :disabled="!enabled"></textarea>
        </div>

        <!-- Save Button -->
        <button class="btn btn-success w-100" @click="saveSettings" :disabled="!enabled">
          <i class="bi bi-save me-2"></i>Save Settings
        </button>
      </div>

      <!-- Inactive Users List -->
      <div class="card shadow-sm p-4">
        <h4 class="mb-3">
          <i class="bi bi-person-x-fill text-warning me-2"></i>
          Users Inactive More Than {{ inactivityDays }} Days
        </h4>

        <div v-if="filteredInactiveUsers.length > 0" class="table-responsive">
          <table class="table table-bordered text-center align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Days Inactive</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in filteredInactiveUsers" :key="user.id">
                <td>{{ index + 1 }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.lastLogin }}</td>
                <td>{{ daysSince(user.lastLogin) }} days</td>
                <td>
                  <button class="btn btn-sm btn-outline-warning" @click="sendReminder(user)">
                    <i class="bi bi-envelope-paper-fill me-1"></i>Send Reminder
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-muted text-center">
          🎉 No users inactive for more than {{ inactivityDays }} days!
        </div>
      </div>
    </div>
  `
};


// ReminderSettings.js
// This component allows users to configure reminder settings for their activities.
// It includes options for enabling reminders, setting frequency, choosing reminder types, and previewing messages.
// The settings can be saved, and the component is designed to be user-friendly with clear labels and toggles.
// The reminder types include email, SMS, and in-app notifications, with a sample message preview.
// The component is reactive, meaning changes to the settings will update the UI in real-time.