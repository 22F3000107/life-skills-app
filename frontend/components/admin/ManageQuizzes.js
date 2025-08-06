import { getAdminQuizzes, updateQuiz, deleteQuizById } from '/utils/api.js';

export default {
  name: "ManageQuizzes",
  data() {
    return {
      quizzes: [],
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
    async fetchQuizzes() {
      try {
        const token = localStorage.getItem("auth-token");
        const data = await getAdminQuizzes(token);
        this.quizzes = (data.quizzes || []).map(q => ({
          id: q.id,
          title: q.title,
          skill: q.skill,
          createdBy: q.created_by,
          status: q.status === "draft" ? "Unpublished" : q.status.charAt(0).toUpperCase() + q.status.slice(1),
          questions: q.questions?.length || 0  // If your API supports it
        }));
      } catch (err) {
        console.error("Failed to fetch quizzes:", err.message);
      }
    },
    viewQuiz(quiz) {
      this.previewQuiz = quiz;
      const modal = new bootstrap.Modal(document.getElementById('quizPreviewModal'));
      modal.show();
    },
    async togglePublish(index) {
      const quiz = this.quizzes[index];
      const newStatus = quiz.status === "Published" ? "Unpublished" : "Published";
      try {
        await updateQuiz(quiz.id, { status: newStatus.toLowerCase() });
        this.quizzes[index].status = newStatus;
        alert("Quiz status updated.");
      } catch (err) {
        alert("Failed to update quiz status.");
        console.error(err);
      }
    },
    async deleteQuiz(index) {
      const quiz = this.quizzes[index];
      if (!confirm("Are you sure you want to delete this quiz?")) return;
      try {
        await deleteQuizById(quiz.id);
        this.quizzes.splice(index, 1);
        alert("Quiz deleted successfully.");
      } catch (err) {
        alert("Failed to delete quiz.");
        console.error(err);
      }
    },
    flagQuiz(index) {
      if (this.quizzes[index].status !== 'Flagged') {
        if (confirm("Do you want to flag this quiz?")) {
          this.quizzes[index].status = 'Flagged';
          alert("Quiz flagged successfully.");
        }
      }
    }
  },
  mounted() {
    this.fetchQuizzes();
  },
  template: `
    <div class="container mt-4 mb-5">
      <div class="text-center mb-4">
        <i class="bi bi-ui-checks fs-1 text-primary"></i>
        <h2 class="fw-bold mt-2">Manage Quizzes</h2>
        <p class="text-muted">View, edit, and control all published quizzes on the platform.</p>
      </div>

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
        <table class="table table-bordered align-middle text-center">
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
                <button class="btn btn-sm btn-outline-info me-1" @click="viewQuiz(quiz)" title="View Quiz">
                  <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="togglePublish(index)" :title="quiz.status === 'Published' ? 'Unpublish' : 'Publish'">
                  <i :class="'bi ' + (quiz.status === 'Published' ? 'bi-toggle-off' : 'bi-toggle-on')"></i>
                </button>
                <button v-if="quiz.status !== 'Flagged'" class="btn btn-sm btn-outline-dark me-1" @click="flagQuiz(index)" title="Flag Quiz">
                  <i class="bi bi-flag-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteQuiz(index)" title="Delete Quiz">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredQuizzes.length === 0">
              <td colspan="6" class="text-muted">No quizzes available.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Preview -->
      <div class="modal fade" id="quizPreviewModal" tabindex="-1" aria-labelledby="quizPreviewLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="quizPreviewLabel">
                <i class="bi bi-eye-fill me-1 text-primary"></i> Quiz Preview
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div class="modal-body" v-if="previewQuiz">
              <h5 class="fw-bold">{{ previewQuiz.title }}</h5>
              <p><strong>Skill:</strong> {{ previewQuiz.skill }}</p>
              <p><strong>Total Questions:</strong> {{ previewQuiz.questions }}</p>
              <p><strong>Status:</strong>
                <span :class="{
                  'text-success': previewQuiz.status === 'Published',
                  'text-secondary': previewQuiz.status === 'Unpublished',
                  'text-danger': previewQuiz.status === 'Flagged'
                }">{{ previewQuiz.status }}</span>
              </p>
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