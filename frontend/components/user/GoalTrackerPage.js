export default {
  name: "GoalTrackerPage",
  data() {
    return {
      newGoal: '',
      goals: []
    };
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
    }
  },
  template: `
    <div class="container mt-4">
      <h2 class="mb-4 text-center">🎯 My Weekly Goals</h2>

      <div class="input-group mb-3">
        <input v-model="newGoal" type="text" class="form-control" placeholder="Add a new goal..." />
        <button class="btn btn-success" @click="addGoal">Add Goal</button>
      </div>

      <ul class="list-group">
        <li v-for="(goal, index) in goals" :key="index"
            class="list-group-item d-flex justify-content-between align-items-center">
          
          <span :class="{
            'text-success': goal.status === 'done',
            'text-danger': goal.status === 'failed',
            'text-secondary': goal.status === 'active'
          }">
            {{ goal.text }} <small v-if="goal.status !== 'active'">({{ goal.status }})</small>
          </span>

          <div>
            <button v-if="goal.status === 'active'" class="btn btn-outline-success btn-sm me-1"
              @click="markComplete(index)">Done</button>
            <button v-if="goal.status === 'active'" class="btn btn-outline-danger btn-sm"
              @click="markFailed(index)">Fail</button>
          </div>
        </li>
      </ul>

      <div v-if="goals.length === 0" class="text-muted mt-3 text-center">
        No goals yet. Add your first weekly goal!
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