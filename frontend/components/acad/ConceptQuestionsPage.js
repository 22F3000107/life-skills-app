export default {
  name: "ConceptQuestionsPage",
  data() {
    return {
      searchQuery: "",
      selectedType: "",
      selectedModule: "",
      isModuleFixed: false,
      selectedAge: "",
      currentPage: 1,
      perPage: 10,
      questionTypes: ["MCQ", "MSQ", "True/False"],
      moduleList: ["Time Management", "Stress Control", "Communication"],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      questions: [], // questions already in concept
      allQuestions: [],
      showAddPopup: false,
      filterQcode: "",
      filterType: "",
      filterModule: "",
      filterAge: "",
      fetchedQuestions: [],
      selectedQuestionIds: [],
    };
  },
  computed: {
    filteredQuestions() {
      return this.questions.filter(
        (q) =>
          q.qcode.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (!this.selectedType || q.type === this.selectedType) &&
          (!this.selectedModule || q.module === this.selectedModule) &&
          (!this.selectedAge || q.age === this.selectedAge)
      );
    },
    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredQuestions.slice(start, start + this.perPage);
    },
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.perPage);
    },
    pageWindow() {
      const maxButtons = 5;
      let start = Math.max(this.currentPage - 2, 1);
      let end = Math.min(start + maxButtons - 1, this.totalPages);
      if (end - start < maxButtons - 1) {
        start = Math.max(end - maxButtons + 1, 1);
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
  },
  mounted() {
    const moduleFromRoute = this.$route.query.module;
    if (moduleFromRoute) {
      this.selectedModule = moduleFromRoute;
      this.isModuleFixed = true;
      if (!this.moduleList.includes(moduleFromRoute)) {
        this.moduleList.push(moduleFromRoute);
      }
    }
    // Simulate concept questions
    this.questions = Array.from({ length: 7 }, (_, i) => ({
      qcode: `Q${201 + i}`,
      question: `Concept Question ${i + 1}`,
      type: this.questionTypes[i % 3],
      age: this.ageGroups[i % 4],
      module: this.selectedModule || this.moduleList[i % 3],
      status: "Approved",
    }));

    // Simulate all available questions
    this.allQuestions = Array.from({ length: 30 }, (_, i) => ({
      qcode: `Q${301 + i}`,
      question: `New Available Question ${i + 1}`,
      type: this.questionTypes[i % 3],
      age: this.ageGroups[i % 4],
      module: this.moduleList[i % 3],
      status: "Approved",
    }));
  },
  methods: {
    fetchQuestions() {
      const existingQCodes = this.questions.map((q) => q.qcode);
      this.fetchedQuestions = this.allQuestions.filter(
        (q) =>
          (!this.filterQcode ||
            q.qcode.toLowerCase().includes(this.filterQcode.toLowerCase())) &&
          (!this.filterType || q.type === this.filterType) &&
          (!this.filterModule || q.module === this.filterModule) &&
          (!this.filterAge || q.age === this.filterAge) &&
          !existingQCodes.includes(q.qcode)
      );
      this.selectedQuestionIds = [];
    },
    toggleSelection(qcode) {
      const index = this.selectedQuestionIds.indexOf(qcode);
      if (index > -1) {
        this.selectedQuestionIds.splice(index, 1);
      } else {
        this.selectedQuestionIds.push(qcode);
      }
    },
    addSelectedQuestions() {
      const toAdd = this.fetchedQuestions.filter((q) =>
        this.selectedQuestionIds.includes(q.qcode)
      );
      this.questions.push(...toAdd);
      alert(`${toAdd.length} question(s) added to the concept.`);
      this.showAddPopup = false;
    },
  },
  template: `

  <div class="container mt-4">
    <!-- Filters and Add Button -->
    <div class="d-flex align-items-center justify-content-between flex-wrap mb-4 gap-2">
      <div class="d-flex align-items-center gap-2 flex-grow-1 flex-wrap">
        <input v-model="searchQuery" class="form-control form-control-sm" placeholder="Search QCode..." style="max-width: 160px;" />
        <select v-model="selectedType" class="form-select form-select-sm" style="max-width: 140px;">
          <option value="">All Types</option>
          <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="selectedModule" class="form-select form-select-sm" style="max-width: 160px;" disabled>
          <option :value="selectedModule">{{ selectedModule }}</option>
        </select>
        <select v-model="selectedAge" class="form-select form-select-sm" style="max-width: 140px;">
          <option value="">All Ages</option>
          <option v-for="age in ageGroups" :key="age" :value="age">{{ age }}</option>
        </select>
      </div>
      <div class="d-flex">
        <button class="btn btn-sm btn-outline-success" @click="showAddPopup = true">+ Add Question</button>
      </div>
    </div>

    <!-- Questions Table -->
    <div class="table-responsive">
      <table class="table table-sm table-bordered border-top-0 border-end-0 border-start-0 align-middle">
        <thead class="table-light">
          <tr>
            <th>QCode</th>
            <th>Question</th>
            <th>Type</th>
            <th>Age</th>
            <th>Module</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in paginatedQuestions" :key="q.qcode">
            <td>{{ q.qcode }}</td>
            <td>{{ q.question }}</td>
            <td>{{ q.type }}</td>
            <td>{{ q.age }}</td>
            <td>{{ q.module }}</td>
            <td>{{ q.status }}</td>
          </tr>
          <tr v-if="filteredQuestions.length === 0">
            <td colspan="6" class="text-center text-muted">No questions found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filteredQuestions.length) }} of {{ filteredQuestions.length }} entries
      </small>
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-primary" :disabled="currentPage === 1" @click="currentPage--">«</button>
        <button v-for="page in pageWindow" :key="page" class="btn btn-sm" :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'" @click="currentPage = page">{{ page }}</button>
        <button class="btn btn-sm btn-outline-primary" :disabled="currentPage === totalPages" @click="currentPage++">»</button>
      </div>
    </div>

    <!-- Add Questions Popup -->
    <div v-if="showAddPopup" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">Add Questions</h6>
            <button type="button" class="btn-close" @click="showAddPopup = false"></button>
          </div>
          <div class="modal-body">
  <div class="row g-2 mb-3">
    <div class="col">
      <input v-model="filterQcode" class="form-control form-control-sm" placeholder="Search by QCode" />
    </div>
    <div class="col">
      <select v-model="filterType" class="form-select form-select-sm">
        <option value="">All Types</option>
        <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
      </select>
    </div>
    <div class="col">
      <select v-model="filterModule" class="form-select form-select-sm">
        <option value="">All Modules</option>
        <option v-for="mod in moduleList" :key="mod" :value="mod">{{ mod }}</option>
      </select>
    </div>
    <div class="col">
      <select v-model="filterAge" class="form-select form-select-sm">
        <option value="">All Ages</option>
        <option v-for="age in ageGroups" :key="age" :value="age">{{ age }}</option>
      </select>
    </div>
    <div class="col">
      <button class="btn btn-sm btn-outline-primary w-100" @click="fetchQuestions">Fetch Questions</button>
    </div>
  </div>

  <div v-if="fetchedQuestions.length">
    <table class="table table-sm">
      <thead>
        <tr>
          <th style="width: 40px;"></th>
          <th>QCode</th>
          <th>Question</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="q in fetchedQuestions" :key="q.qcode">
          <td><input type="checkbox" :value="q.qcode" v-model="selectedQuestionIds" /></td>
          <td>{{ q.qcode }}</td>
          <td>{{ q.question }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="text-muted">No questions to display.</div>
</div>

          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" @click="showAddPopup = false">Cancel</button>
            <button class="btn btn-sm btn-success" :disabled="selectedQuestionIds.length === 0" @click="addSelectedQuestions">Add {{ selectedQuestionIds.length }} Questions</button>
          </div>
        </div>
      </div>
    </div>
  </div>


  `,
};
