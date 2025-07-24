import { getTodayHabits, submitHabits } from '../utils/api.js';

export default {
  name: "HealthyHabitsPage",
  data() {
    return {
      habits: [],
      rewardEarned: false,
      coinsAwarded: 0,
      loading: true,
      error: '',
    };
  },
  computed: {
    progressPercent() {
      const completed = this.habits.filter(h => h.completed).length;
      return Math.round((completed / this.habits.length) * 100);
    }
  },
  methods: {
    async fetchHabits() {
      this.loading = true;
      try {
        const res = await getTodayHabits();
        this.habits = res.habits.map(h => ({
          name: h.name,
          completed: h.completed,
          icon: this.mapIcon(h.name)
        }));
      } catch (err) {
        console.error("Error fetching habits:", err);
        this.error = "Failed to load habits.";
      } finally {
        this.loading = false;
      }
    },

    async submitHabits() {
      try {
        const payload = {
          habits: this.habits.map(h => ({
            name: h.name,
            completed: h.completed
          }))
        };

        const res = await submitHabits(payload);
        this.rewardEarned = res.reward_earned;
        this.coinsAwarded = res.coins_awarded || 0;
      } catch (err) {
        console.error("Error submitting habits:", err);
        this.error = "Failed to submit habits.";
      }
    },

    toggleHabit(index) {
      this.habits[index].completed = !this.habits[index].completed;
    },

    markAllComplete() {
      this.habits.forEach(h => (h.completed = true));
    },

    mapIcon(name) {
      const map = {
        "Brush Teeth": "bi-tooth",
        "Eat Breakfast": "bi-egg-fried",
        "Do 5-min Exercise": "bi-person-running",
        "Sleep Early": "bi-moon-stars"
      };
      return map[name] || "bi-check-circle";
    }
  },

  async mounted() {
    await this.fetchHabits();
  },

  template: `
    <div class="container mt-4">
      <div class="text-center mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-clipboard-check text-primary me-2"></i>Today's Healthy Habits
        </h2>
        <p class="text-muted">Track your daily habits and stay consistent!</p>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Loading habits...</p>
      </div>
      <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

      <!-- Habit List -->
      <ul class="list-group mb-4 shadow-sm" v-if="!loading && habits.length">
        <li
          v-for="(habit, index) in habits"
          :key="habit.name"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div class="d-flex align-items-center">
            <input
              type="checkbox"
              v-model="habit.completed"
              @change="toggleHabit(index)"
              class="form-check-input me-3"
            />
            <span :class="{ 'text-decoration-line-through text-muted': habit.completed }" class="fw-medium">
              {{ habit.name }}
            </span>
          </div>
          <i :class="['fs-5', 'bi', habit.icon]"></i>
        </li>
      </ul>

      <!-- Progress Bar -->
      <div v-if="habits.length" class="mb-4">
        <label class="form-label">
          <i class="bi bi-graph-up-arrow me-1 text-success"></i>Progress: {{ progressPercent }}%
        </label>
        <div class="progress">
          <div
            class="progress-bar bg-success progress-bar-striped progress-bar-animated"
            role="progressbar"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="d-flex justify-content-between mb-4" v-if="habits.length">
        <button class="btn btn-outline-secondary" @click="markAllComplete">
          <i class="bi bi-check2-all me-1"></i>Mark All Complete
        </button>
        <button class="btn btn-success fw-bold" @click="submitHabits">
          <i class="bi bi-send-check me-1"></i>Submit Habits
        </button>
      </div>

      <!-- Reward Message -->
      <div v-if="rewardEarned" class="alert alert-success text-center fw-semibold shadow-sm">
        <i class="bi bi-stars me-2"></i>Great job! You earned {{ coinsAwarded }} coins today!
      </div>
    </div>
  `
};



// This code defines a Vue.js component for a healthy habits page.
// It allows users to track daily habits, mark them as done, edit habit names, and reset their habits.
// The component includes a progress bar to show completion percentage and a reward alert when all habits are completed.
// It uses Bootstrap classes for styling and layout, ensuring a responsive design.
// The component also provides methods for toggling habit completion, marking all habits as complete, resetting habits, and handling habit edits.
// The template includes a checklist of habits with checkboxes, an input field for editing habit names, and buttons for saving or canceling edits.
// The component is designed to encourage users to maintain healthy daily habits and provides a user-friendly interface for managing them.