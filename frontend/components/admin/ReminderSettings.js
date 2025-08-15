import { saveWeeklyReminderSettings, saveInactiveReminderSettings } from "../../utils/api.js";

export default {
  name: "ReminderSettings",
  data() {
    return {
      messageWeekly: "",
      messageInactive: "",
      token: localStorage.getItem("auth-token"),
      weekly: {
        minute: "0",
        hour: "9",
        day_of_week: "monday",
        task_name: "weekly_reminder"
      },
      inactive: {
        minute: "0",
        hour: "10",
        task_name: "inactive_reminder"
      }
    };
  },

  // No mounted GET call because API is PUT-only

  methods: {
    async saveWeekly() {
      try {
        await saveWeeklyReminderSettings(this.weekly, this.token); // send weekly data
        this.messageWeekly = "✅ Weekly reminder updated!";
      } catch (err) {
        console.error("Error saving weekly reminder:", err);
        this.messageWeekly = "Failed to update weekly reminder.";
      }
    },

    async saveInactive() {
      try {
        await saveInactiveReminderSettings(this.inactive, this.token); // send inactive data
        this.messageInactive = "✅ Inactive reminder updated!";
      } catch (err) {
        console.error("Error saving inactive reminder:", err);
        this.messageInactive = "Failed to update inactive reminder.";
      }
    }
  },

  template: `
    <div class="reminder-settings">
      <h2 class="settings-title">Reminder Settings</h2>

      <!-- Weekly Reminder -->
      <form @submit.prevent="saveWeekly" class="reminder-card">
        <h3 class="section-title">Weekly Reminder</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="weekly-hour">Hour:</label>
            <input id="weekly-hour" v-model="weekly.hour" type="number" min="0" max="23" />
          </div>
          <div class="form-group">
            <label for="weekly-minute">Minute:</label>
            <input id="weekly-minute" v-model="weekly.minute" type="number" min="0" max="59" />
          </div>
        </div>
        <div class="form-group">
          <label for="weekly-day">Day of Week:</label>
          <select id="weekly-day" v-model="weekly.day_of_week">
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Save Weekly Reminder</button>
        <p :class="['status-message', messageWeekly.includes('✅') ? 'text-success' : 'text-error']">
          {{ messageWeekly }}
        </p>
      </form>

      <!-- Inactive Reminder -->
      <form @submit.prevent="saveInactive" class="reminder-card">
        <h3 class="section-title">Inactive Reminder</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="inactive-hour">Hour:</label>
            <input id="inactive-hour" v-model="inactive.hour" type="number" min="0" max="23" />
          </div>
          <div class="form-group">
            <label for="inactive-minute">Minute:</label>
            <input id="inactive-minute" v-model="inactive.minute" type="number" min="0" max="59" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">💾 Save Inactive Reminder</button>
        <p :class="['status-message', messageInactive.includes('✅') ? 'text-success' : 'text-error']">
          {{ messageInactive }}
        </p>
      </form>
    </div>
  `
};


// ReminderSettings.js
// This component allows users to configure reminder settings for their activities.
// It includes options for enabling reminders, setting frequency, choosing reminder types, and previewing messages.
// The settings can be saved, and the component is designed to be user-friendly with clear labels and toggles.
// The reminder types include email, SMS, and in-app notifications, with a sample message preview.
// The component is reactive, meaning changes to the settings will update the UI in real-time.