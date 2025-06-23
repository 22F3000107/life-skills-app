import { fetchQuestionsByModule } from "../../services/questionService.js";

export default {
  name: "IndividualModulePage",
  props: ["mcode", "filter"],
  data() {
    return {
      searchQuery: "",
      selectedType: "",
      selectedAges: [],
      selectedModule: "Time Management", // pre-selected module
      questionTypes: ["MCQ", "MSQ", "True/False"],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      currentPage: 1,
      rowsPerPage: 10,
      questions: [],
    };
  },
  computed: {
    filteredQuestions() {
      return this.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedType === "" || q.type === this.selectedType) &&
          (this.selectedAges.length === 0 ||
            this.selectedAges.includes(q.age)) &&
          (this.filter === "all" ||
            this.filter === "" ||
            q.status.toLowerCase() === this.filter.toLowerCase())
      );
    },
    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      return this.filteredQuestions.slice(start, start + this.rowsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.rowsPerPage);
    },
    showingRangeText() {
      const start = (this.currentPage - 1) * this.rowsPerPage + 1;
      const end = Math.min(
        start + this.rowsPerPage - 1,
        this.filteredQuestions.length
      );
      return `Showing data ${start} to ${end} of ${this.filteredQuestions.length} entries`;
    },
  },
  methods: {
    goToQuestion(qcode) {
      this.$router.push(`/acad/question/${qcode}`);
    },
    editQuestion(qcode) {
      console.log("Edit clicked for:", qcode);
      // Optional: Navigate to edit mode or open modal
    },
    archiveQuestion(qcode) {
      console.log("Archive clicked for:", qcode);
      // Optional: Archive logic
    },
  },
  async mounted() {
    try {
      this.questions = await fetchQuestionsByModule(this.mcode);
    } catch (err) {
      console.error("Failed to load questions:", err.message);
    }
  },
  template: `
    <div class="container mt-4">

      <!-- Filters and Buttons -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

        <!-- Left filters -->
        <div class="d-flex align-items-end gap-2 flex-grow-1">
          <input v-model="searchQuery" type="text" class="form-control form-control-sm" placeholder="Search question..." />

          <select v-model="selectedType" class="form-select form-select-sm">
            <option value="">All Types</option>
            <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
          </select>

          <select v-model="selectedModule" class="form-select form-select-sm" disabled>
            <option>{{ selectedModule }}</option>
          </select>

          <!-- Age Dropdown (Multi-select Checkboxes) -->
          <div class="dropdown">
            <button class="form-select form-select-sm" type="button" data-bs-toggle="dropdown">
              Age
            </button>
            <ul class="dropdown-menu p-2" style="min-width: 200px;">
              <li v-for="age in ageGroups" :key="age">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="age" v-model="selectedAges" :id="'age_' + age">
                  <label class="form-check-label" :for="'age_' + age">{{ age }}</label>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right buttons -->
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary">+ Start Review</button>
          <button class="btn btn-sm btn-outline-success">+ Create Module</button>
        </div>
      </div>

      <!-- Questions Table -->
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr>
              <th>Qcode</th>
              <th>Question</th>
              <th>Type</th>
              <th>Age</th>
              <th>Module</th>
              <th>Status</th>
              <th>Action</th>
            </tr> 
          </thead>
          <tbody>
                       <tr v-for="q in paginatedQuestions" 
  :key="q.qcode" 
  @click="goToQuestion(q.qcode)" 
  style="cursor: pointer;">
              <td>{{ q.qcode }}</td>
              <td>{{ q.question }}</td>
              <td>{{ q.type }}</td>
              <td>{{ q.age }}</td>
              <td>{{ q.module }}</td>
              <td>{{ q.status }}</td>
              <td>
                <button class="btn btn-sm btn-outline-secondary me-2">Edit</button>
                <button class="btn btn-sm btn-outline-danger">Archive</button>
              </td>
            </tr>
            <tr v-if="paginatedQuestions.length === 0">
              <td colspan="7" class="text-center text-muted">No questions found.</td>
            </tr>
          </tbody>
        </table>
      </div>
<!-- Footer -->

      <!-- Pagination -->
      <div class="d-flex justify-content-between mt-3">
      <div class="text-muted small">{{ showingRangeText }}</div>
        <div class="btn-group">
          <button
            v-for="page in totalPages"
            :key="page"
            class="btn btn-sm"
            :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
      </div>

    </div>
  `,
};
