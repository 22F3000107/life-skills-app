import { getWeeklyGoals, addGoal, updateGoalStatus } from "/utils/api.js";

export default {
  name: "GoalTrackerPage",
  data() {
    return {
      newGoal: '',
      goals: [],
      isLoading: false,
      error: ''
    };
  },
  computed: {
    activeGoals() {
      return this.goals.filter(g => g.status === 'active');
    },
    completedGoals() {
      return this.goals.filter(g => g.status === 'done' || g.status === 'failed');
    }
  },
  methods: {
    async fetchGoals() {
      this.isLoading = true;
      try {
        const res = await getWeeklyGoals();
        this.goals = res.goals || [];
        this.error = '';
      } catch (err) {
        this.error = err.message || 'Failed to fetch goals.';
      } finally {
        this.isLoading = false;
      }
    },

    async addGoal() {
      if (!this.newGoal.trim()) return;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 1 week from today

      const goalPayload = {
        text: this.newGoal,
        due_date: dueDate.toISOString().split('T')[0]
      };

      try {
        const response = await addGoal(goalPayload);
        this.goals.push({ ...goalPayload, id: response.goal_id, status: 'active' });
        this.newGoal = '';
        this.error = '';
      } catch (err) {
        this.error = err.message || 'Failed to add goal.';
      }
    },

    async markComplete(goal) {
      try {
        await updateGoalStatus(goal.id, { status: 'done' });
        goal.status = 'done';
      } catch (err) {
        this.error = 'Error marking goal as done.';
      }
    },

    async markFailed(goal) {
      try {
        await updateGoalStatus(goal.id, { status: 'failed' });
        goal.status = 'failed';
      } catch (err) {
        this.error = 'Error marking goal as failed.';
      }
    },

    clearCompleted() {
      this.goals = this.goals.filter(g => g.status === 'active');
    }
  },
  mounted() {
    this.fetchGoals();
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="mb-4 text-center">
        <i class="bi bi-bullseye text-primary me-2"></i>My Weekly Goals
      </h2>

      <!-- Error -->
      <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

      <!-- Add Goal -->
      <div class="input-group mb-4">
        <input v-model="newGoal" type="text" class="form-control" placeholder="Add a new goal..." />
        <button class="btn btn-success" @click="addGoal">
          <i class="bi bi-plus-circle me-1"></i>Add Goal
        </button>
      </div>

      <!-- Active Goals -->
      <div>
        <h5 class="text-primary mb-3">
          <i class="bi bi-hourglass-split me-1"></i>Active Goals
        </h5>

        <div v-if="isLoading" class="text-center text-muted mb-3">
          <div class="spinner-border spinner-border-sm me-2"></div>Loading...
        </div>

        <ul class="list-group mb-4" v-if="activeGoals.length > 0 && !isLoading">
          <li v-for="goal in activeGoals" :key="goal.id"
              class="list-group-item d-flex justify-content-between align-items-center">
            <span class="text-secondary">
              {{ goal.text }}
              <span class="badge bg-secondary ms-2"><i class="bi bi-hourglass"></i></span>
            </span>

            <div>
              <button class="btn btn-outline-success btn-sm me-1" @click="markComplete(goal)">
                <i class="bi bi-check-circle"></i> Done
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="markFailed(goal)">
                <i class="bi bi-x-circle"></i> Fail
              </button>
            </div>
          </li>
        </ul>

        <div v-else-if="!isLoading" class="text-muted">
          <i class="bi bi-info-circle me-1"></i>No active goals available.
        </div>
      </div>

      <!-- Completed Goals -->
      <div class="mt-4">
        <h5 class="text-success mb-3">
          <i class="bi bi-bookmark-check me-1"></i>Completed Goals
        </h5>

        <ul class="list-group" v-if="completedGoals.length > 0">
          <li v-for="goal in completedGoals" :key="goal.id"
              class="list-group-item d-flex justify-content-between align-items-center">
            <span :class="{
              'text-success': goal.status === 'done',
              'text-danger': goal.status === 'failed'
            }">
              {{ goal.text }}
              <span class="badge ms-2"
                :class="{
                  'bg-success': goal.status === 'done',
                  'bg-danger': goal.status === 'failed'
                }">
                <i :class="goal.status === 'done' ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                {{ goal.status === 'done' ? 'Done' : 'Failed' }}
              </span>
            </span>
          </li>
        </ul>

        <div v-else class="text-muted">
          <i class="bi bi-info-circle me-1"></i>No completed goals yet.
        </div>

        <div class="text-end mt-2" v-if="completedGoals.length > 0">
          <button class="btn btn-outline-secondary btn-sm" @click="clearCompleted">
            <i class="bi bi-trash3"></i> Clear Completed
          </button>
        </div>
      </div>
    </div>
  `
};



// This code defines a Vue.js component for a goal tracker page.
// It allows users to add, mark as complete, or mark as failed their weekly goals.
// The component maintains a list of goals in its data and provides methods to manipulate this list.
// The template includes an input field for adding new goals and a list that displays the current goals with their statuses.
// Each goal can be marked as done or failed, and the status is visually indicated with different text colors.
// The component uses Bootstrap classes for styling and layout, ensuring a clean and responsive design.
// This goal tracker can be integrated into a larger life skills application to help users manage their personal goals effectively.
// It provides a simple and intuitive interface for users to stay organized and motivated in achieving their objectives.