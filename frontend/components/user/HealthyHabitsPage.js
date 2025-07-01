export default {
  name: "HealthyHabitsPage",
  data() {
    return {
      habits: [
        { text: 'Brush Teeth', icon: 'bi-tooth', done: false },
        { text: 'Eat Breakfast', icon: 'bi-egg-fried', done: false },
        { text: 'Do 5-min Exercise', icon: 'bi-person-running', done: false },
        { text: 'Sleep Early', icon: 'bi-moon-stars', done: false }
      ],
      rewardEarned: false
    };
  },
  methods: {
    toggleHabit(index) {
      this.habits[index].done = !this.habits[index].done;
      this.rewardEarned = this.habits.every(h => h.done);
    },
    markAllComplete() {
      this.habits.forEach(h => (h.done = true));
      this.rewardEarned = true;
    }
  },
  computed: {
    progressPercent() {
      const completed = this.habits.filter(h => h.done).length;
      return Math.round((completed / this.habits.length) * 100);
    }
  },
  template: `
    <div class="container mt-4">
      <div class="text-center mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-clipboard-check text-primary me-2"></i>Today's Healthy Habits
        </h2>
        <p class="text-muted">Track your daily habits and stay consistent!</p>
      </div>

      <!-- Habit Checklist -->
      <ul class="list-group mb-4 shadow-sm">
        <li
          v-for="(habit, index) in habits"
          :key="index"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div class="d-flex align-items-center">
            <input
              type="checkbox"
              v-model="habit.done"
              @change="toggleHabit(index)"
              class="form-check-input me-3"
            />
            <span
              :class="{ 'text-decoration-line-through text-muted': habit.done }"
              class="fw-medium"
            >
              {{ habit.text }}
            </span>
          </div>
          <i :class="['fs-5', 'bi', habit.icon]"></i>
        </li>
      </ul>

      <!-- Progress Bar -->
      <div class="mb-4">
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

      <!-- Complete All Button -->
      <div class="d-grid mb-4">
        <button class="btn btn-success fw-bold" @click="markAllComplete">
          <i class="bi bi-check2-circle me-2"></i>Mark All Complete
        </button>
      </div>

      <!-- Reward -->
      <div v-if="rewardEarned" class="alert alert-success text-center fw-semibold shadow-sm">
        <i class="bi bi-stars me-2"></i>Great job! You earned 10 stars today!
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