export default {
  name: "ManageQuizzes",
  data() {
    return {
      quizzes: [
        {
          id: 1,
          title: "Healthy Habit Quiz",
          skill: "Healthy Habits",
          questions: 5,
          status: "Published"
        },
        {
          id: 2,
          title: "Money Management Quiz",
          skill: "Financial Literacy",
          questions: 4,
          status: "Unpublished"
        }
      ],
      searchQuery: "",
      selectedSkill: "All",
      previewQuiz: null
    };
  },
  computed: {
    filteredQuizzes() {
      return this.quizzes.filter(q =>
        (this.selectedSkill === "All" || q.skill === this.selectedSkill) &&
        q.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    skillList() {
      const skills = this.quizzes.map(q => q.skill);
      return ["All", ...new Set(skills)];
    }
  },
  methods: {
    viewQuiz(quiz) {
      this.previewQuiz = quiz;
      const modal = new bootstrap.Modal(document.getElementById('quizPreviewModal'));
      modal.show();
    },
    flagQuiz(index) {
      if (this.quizzes[index].status !== 'Flagged') {
        if (confirm("Do you want to flag this quiz?")) {
          this.quizzes[index].status = 'Flagged';
          alert("🚩 Quiz flagged successfully.");
        }
      }
    },
    togglePublish(index) {
      const quiz = this.quizzes[index];
      if (quiz.status === "Published") {
        quiz.status = "Unpublished";
      } else if (quiz.status === "Unpublished") {
        quiz.status = "Published";
      }
    },
    deleteQuiz(index) {
      if (confirm("Are you sure you want to delete this quiz?")) {
        this.quizzes.splice(index, 1);
      }
    }
  },
  template: `
    <div class="container mt-4 mb-5">
      <h2 class="text-center fw-bold mb-4">📝 Manage Quizzes</h2>

      <!-- Search and Filter -->
      <div class="row mb-3">
        <div class="col-md-6 mb-2">
          <input v-model="searchQuery" class="form-control" placeholder="🔍 Search by quiz title..." />
        </div>
        <div class="col-md-6 mb-2">
          <select v-model="selectedSkill" class="form-select">
            <option v-for="skill in skillList" :key="skill" :value="skill">{{ skill }}</option>
          </select>
        </div>
      </div>

      <!-- Quiz Table -->
      <div class="table-responsive">
        <table class="table table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Skill</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(quiz, index) in filteredQuizzes" :key="quiz.id">
              <td>{{ index + 1 }}</td>
              <td>{{ quiz.title }}</td>
              <td><span class="badge bg-info text-dark">{{ quiz.skill }}</span></td>
              <td>{{ quiz.questions }}</td>
              <td>
                <span :class="{
                  'badge bg-success': quiz.status === 'Published',
                  'badge bg-secondary': quiz.status === 'Unpublished',
                  'badge bg-danger': quiz.status === 'Flagged'
                }">{{ quiz.status }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-info me-1" @click="viewQuiz(quiz)">👁️ View</button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="togglePublish(index)">
                  {{ quiz.status === 'Published' ? 'Unpublish' : 'Publish' }}
                </button>
                <button v-if="quiz.status !== 'Flagged'" class="btn btn-sm btn-outline-dark me-1" @click="flagQuiz(index)">🚩 Flag</button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteQuiz(index)">🗑️ Delete</button>
              </td>
            </tr>
            <tr v-if="filteredQuizzes.length === 0">
              <td colspan="6" class="text-muted">No quizzes found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Preview -->
      <div class="modal fade" id="quizPreviewModal" tabindex="-1" aria-labelledby="quizPreviewLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="quizPreviewLabel">📖 Quiz Preview</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
            </div>
            <div class="modal-body" v-if="previewQuiz">
              <h5>{{ previewQuiz.title }}</h5>
              <p><strong>Skill:</strong> {{ previewQuiz.skill }}</p>
              <p><strong>Total Questions:</strong> {{ previewQuiz.questions }}</p>
              <p><strong>Status:</strong> {{ previewQuiz.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};


// This code defines a Vue.js component for managing quizzes in an admin dashboard.
// It allows admins to add, edit, delete, and view quizzes, as well as filter them by title and skill.
// The component includes a form for adding or editing quizzes, a table to display the quizzes,
// and a modal for previewing quiz details. It also supports flagging quizzes and displays appropriate badges for quiz status.
// The component uses Bootstrap for styling and layout, ensuring a responsive design.
// The data for quizzes is stored in the component's local state, and methods are provided to handle
// various actions like saving, editing, deleting, and resetting the form.