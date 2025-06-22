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
      statusOptions: ["Approved", "Rejected", "Pending"],
      currentPage: 1,
      questionsPerPage: 10,
      questions: Array.from({ length: 200 }, (_, i) => ({
        qcode: `Q${1000 + i}`,
        question: `Sample question number ${i + 1}?`,
        type: ["MCQ", "MSQ", "True/False"][i % 3],
        age: ["6-8", "9-11", "12-14", "15-18"][i % 4],
        module: ["Time Management", "Stress Control", "Communication"][i % 3],
        status: ["Approved", "Rejected", "Pending"][i % 3],
      })),
    };
  },
  computed: {
    filteredQuestions() {
      return this.questions.filter(
        (q) =>
          q.qcode.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedTypes.length === 0 ||
            this.selectedTypes.includes(q.type)) &&
          (this.selectedModules.length === 0 ||
            this.selectedModules.includes(q.module)) &&
          (this.selectedAges.length === 0 ||
            this.selectedAges.includes(q.age)) &&
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
  methods: {
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
      // Optional: Navigate to edit mode or open modal
    },
    archiveQuestion(qcode) {
      console.log("Archive clicked for:", qcode);
      // Optional: Archive logic
    },
  },
  template: `
    <div class="container mt-4">

      <!-- Top Controls -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <!-- Filters -->
        <div class="d-flex align-items-end gap-2 flex-grow-1">

          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            placeholder="Search QCode..."
            style="max-width: 150px;"
          />

          <!-- Type Multi-select -->
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

          <!-- Module Multi-select -->
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

          <!-- Age Multi-select -->
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

          <!-- Status Multi-select -->
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


        <!-- Create Button -->
                 <router-link
          :to="'/acad/question/create'"
          class="text-decoration-none text-dark"
          style="display: block;"
        >
        <div>
          <button class="btn btn-sm btn-outline-success">+ Create Question</button>
        </div>
        </router-link>
      </div>

      <!-- Table -->
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
                <button class="btn btn-sm btn-outline-primary btn-sm me-2">Edit</button>
                <button class="btn btn-sm btn-outline-secondary btn-sm">Archive</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Range + Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <small class="text-muted">
          Showing {{ (currentPage - 1) * questionsPerPage + 1 }}
          to {{ Math.min(currentPage * questionsPerPage, filteredQuestions.length) }}
          of {{ filteredQuestions.length.toLocaleString() }} entries
        </small>

    <div class="btn-group">
  <!-- Left Arrow -->
  <button
    class="btn btn-sm btn-outline-primary"
    :disabled="currentPage === 1"
    @click="currentPage--"
  >
    «
  </button>

  <!-- Numbered Buttons -->
  <button
    v-for="page in pageWindow"
    :key="page"
    class="btn btn-sm"
    :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
    @click="currentPage = page"
  >
    {{ page }}
  </button>

  <!-- Right Arrow -->
  <button
    class="btn btn-sm btn-outline-primary"
    :disabled="currentPage === totalPages"
    @click="currentPage++"
  >
    »
  </button>
</div>

      </div>
    </div>
  `,
};
