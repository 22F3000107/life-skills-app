import {
  fetchAllQuestions,
  archiveQuestion,
} from "../../services/questionService.js";

export default {
  name: "QuestionBankPage",
  data() {
    return {
      searchQuery: "",
      selectedTypes: [],
      selectedModules: [],
      selectedAges: [],
      selectedStatuses: [],
      questionTypes: ["MCQ", "MSQ", "True/False"],
      moduleOptions: ["Time Management", "Stress Control", "Communication"],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: ["Approved", "Rejected", "Pending", "Archived"],
      currentPage: 1,
      questionsPerPage: 10,
      questions: [],
    };
  },
  computed: {
    filteredQuestions() {
      return this.questions.filter(
        (q) =>
          q.qcode.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedTypes.length === 0 ||
            this.selectedTypes.includes(q.question_type)) &&
          (this.selectedModules.length === 0 ||
            this.selectedModules.includes(q.module_name)) &&
          (this.selectedAges.length === 0 ||
            q.age_groups.some((age) => this.selectedAges.includes(age))) &&
          (this.selectedStatuses.length === 0 ||
            this.selectedStatuses.includes(q.status))
      );
    },
    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.questionsPerPage;
      return this.filteredQuestions.slice(start, start + this.questionsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.questionsPerPage);
    },
    pageWindow() {
      const maxButtons = 5;
      const total = this.totalPages;
      const current = this.currentPage;
      let start = Math.max(current - Math.floor(maxButtons / 2), 1);
      let end = start + maxButtons - 1;

      if (end > total) {
        end = total;
        start = Math.max(end - maxButtons + 1, 1);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  mounted() {
    this.loadQuestions();
  },
  methods: {
    async loadQuestions() {
      try {
        this.questions = await fetchAllQuestions();
      } catch (err) {
        console.error("Failed to load questions:", err.message);
      }
    },
    toggleSelection(array, value) {
      const index = array.indexOf(value);
      if (index > -1) array.splice(index, 1);
      else array.push(value);
    },
    goToQuestion(qcode) {
      this.$router.push(`/acad/question/${qcode}`);
    },
    editQuestion(qcode) {
      console.log("Edit clicked for:", qcode);
    },
    async archiveQuestion(qcode) {
      try {
        await archiveQuestion(qcode);
        this.questions = this.questions.map((q) =>
          q.qcode === qcode ? { ...q, status: "Archived" } : q
        );
      } catch (err) {
        console.error(`Failed to archive ${qcode}:`, err.message);
      }
    },
  },
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div class="d-flex align-items-end gap-2 flex-grow-1">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            placeholder="Search QCode..."
            style="max-width: 150px;"
          />
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Type
            </button>
            <ul class="dropdown-menu p-2" style="min-width: 180px;">
              <li v-for="type in questionTypes" :key="type">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="type" v-model="selectedTypes" :id="'type_' + type">
                  <label class="form-check-label" :for="'type_' + type">{{ type }}</label>
                </div>
              </li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Module
            </button>
            <ul class="dropdown-menu p-2" style="min-width: 180px;">
              <li v-for="mod in moduleOptions" :key="mod">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="mod" v-model="selectedModules" :id="'mod_' + mod">
                  <label class="form-check-label" :for="'mod_' + mod">{{ mod }}</label>
                </div>
              </li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Age
            </button>
            <ul class="dropdown-menu p-2" style="min-width: 180px;">
              <li v-for="age in ageGroups" :key="age">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="age" v-model="selectedAges" :id="'age_' + age">
                  <label class="form-check-label" :for="'age_' + age">{{ age }}</label>
                </div>
              </li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Status
            </button>
            <ul class="dropdown-menu p-2" style="min-width: 180px;">
              <li v-for="status in statusOptions" :key="status">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="status" v-model="selectedStatuses" :id="'status_' + status">
                  <label class="form-check-label" :for="'status_' + status">{{ status }}</label>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <router-link :to="'/acad/question/create'" class="text-decoration-none text-dark" style="display: block;">
          <button class="btn btn-sm btn-outline-success">+ Create Question</button>
        </router-link>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover table-sm">
          <thead class="table-light">
            <tr>
              <th>QCode</th>
              <th>Question</th>
              <th>Type</th>
              <th>Age</th>
              <th>Module</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in paginatedQuestions" :key="q.qcode" style="cursor: pointer;">
              <td @click="goToQuestion(q.qcode)">{{ q.qcode }}</td>
              <td @click="goToQuestion(q.qcode)">{{ q.question_text }}</td>
              <td @click="goToQuestion(q.qcode)">{{ q.question_type }}</td>
              <td @click="goToQuestion(q.qcode)">{{ q.age_groups.join(", ") }}</td>
              <td @click="goToQuestion(q.qcode)">{{ q.module_name }}</td>
              <td @click="goToQuestion(q.qcode)">{{ q.status }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" @click.stop="editQuestion(q.qcode)">Edit</button>
                <button class="btn btn-sm btn-outline-secondary" @click.stop="archiveQuestion(q.qcode)">Archive</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <small class="text-muted">
          Showing {{ (currentPage - 1) * questionsPerPage + 1 }}
          to {{ Math.min(currentPage * questionsPerPage, filteredQuestions.length) }}
          of {{ filteredQuestions.length.toLocaleString() }} entries
        </small>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary" :disabled="currentPage === 1" @click="currentPage--">«</button>
          <button
            v-for="page in pageWindow"
            :key="page"
            class="btn btn-sm"
            :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="btn btn-sm btn-outline-primary" :disabled="currentPage === totalPages" @click="currentPage++">»</button>
        </div>
      </div>
    </div>
  `,
};
