export default {
  name: "GoalTrackerPage",
  data() {
    return {
      newGoal: '',
      goals: []
    };
  },
  computed: {
    activeGoals() {
      return this.goals.filter(g => g.status === 'active');
    },
    completedGoals() {
      return this.goals.filter(g => g.status !== 'active');
    }
  },
  methods: {
    addGoal() {
      if (this.newGoal.trim() !== '') {
        this.goals.push({ text: this.newGoal, status: 'active' });
        this.newGoal = '';
      }
    },
    markComplete(index) {
      this.goals[index].status = 'done';
    },
    markFailed(index) {
      this.goals[index].status = 'failed';
    },
    clearCompleted() {
      this.goals = this.goals.filter(g => g.status === 'active');
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="mb-4 text-center">
        <i class="bi bi-bullseye text-primary me-2"></i>My Weekly Goals
      </h2>

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
        <ul class="list-group mb-4" v-if="activeGoals.length > 0">
          <li v-for="(goal, index) in goals" :key="index" v-if="goal.status === 'active'"
              class="list-group-item d-flex justify-content-between align-items-center">
            <span class="text-secondary">
              {{ goal.text }}
              <span class="badge bg-secondary ms-2"><i class="bi bi-hourglass"></i></span>
            </span>

            <div>
              <button class="btn btn-outline-success btn-sm me-1" @click="markComplete(index)">
                <i class="bi bi-check-circle"></i> Done
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="markFailed(index)">
                <i class="bi bi-x-circle"></i> Fail
              </button>
            </div>
          </li>
        </ul>
        <div v-else class="text-muted">
          <i class="bi bi-info-circle me-1"></i>No active goals available.
        </div>
      </div>

      <!-- Completed Goals -->
      <div class="mt-4">
        <h5 class="text-success mb-3">
          <i class="bi bi-bookmark-check me-1"></i>Completed Goals
        </h5>
        <ul class="list-group" v-if="completedGoals.length > 0">
          <li v-for="(goal, index) in completedGoals" :key="index"
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