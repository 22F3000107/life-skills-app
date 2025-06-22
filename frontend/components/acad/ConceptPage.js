export default {
  name: "ConceptsPage",
  data() {
    return {
      searchQuery: "",
      selectedModules: [],
      selectedAges: [],
      currentPage: 1,
      conceptsPerPage: 12,
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      moduleOptions: ["Time Management", "Stress Control", "Communication"],
      concepts: Array.from({ length: 42 }, (_, i) => ({
        ccode: `C${1000 + i}`,
        name: `Concept ${i + 1}`,
        module: ["Time Management", "Stress Control", "Communication"][i % 3],
        age: ["6-8", "9-11", "12-14", "15-18"][i % 4],
        questions: Math.floor(Math.random() * 30),
        status: i % 2 === 0 ? "LIVE" : "Under Development",
      })),
      showCreatePopup: false,
      filterType: "",
      filterModule: "",
      filterAge: "",
      questionTypes: ["MCQ", "MSQ", "True/False"],
      allQuestions: [],
      fetchedQuestions: [],
      selectedQuestionIds: [],
      liveConceptQuestions: ["Q101", "Q102"], // replace with real QCodes in live concepts
      newConceptName: "",
    };
  },
  computed: {
    filteredConcepts() {
      return this.concepts.filter(
        (c) =>
          c.ccode.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedModules.length === 0 ||
            this.selectedModules.includes(c.module)) &&
          (this.selectedAges.length === 0 || this.selectedAges.includes(c.age))
      );
    },
    paginatedConcepts() {
      const start = (this.currentPage - 1) * this.conceptsPerPage;
      return this.filteredConcepts.slice(start, start + this.conceptsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredConcepts.length / this.conceptsPerPage);
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
    toggleStatus(concept) {
      concept.status = concept.status === "LIVE" ? "Under Development" : "LIVE";
    },
    fetchQuestions() {
      this.fetchedQuestions = this.allQuestions.filter((q) => {
        return (
          (!this.filterType || q.type === this.filterType) &&
          (!this.filterModule || q.module === this.filterModule) &&
          (!this.filterAge || q.age === this.filterAge) &&
          !this.liveConceptQuestions.includes(q.qcode)
        );
      });
      this.selectedQuestionIds = [];
    },
    toggleSelection(qcode) {
      const idx = this.selectedQuestionIds.indexOf(qcode);
      if (idx > -1) {
        this.selectedQuestionIds.splice(idx, 1);
      } else {
        this.selectedQuestionIds.push(qcode);
      }
    },
    confirmAddQuestions() {
      if (!this.newConceptName.trim()) {
        alert("Please enter a concept name.");
        return;
      }
      alert(
        `Concept "${this.newConceptName}" created with ${this.selectedQuestionIds.length} question(s).`
      );
      this.showCreatePopup = false;
      this.newConceptName = "";
      this.selectedQuestionIds = [];
    },
  },
  created() {
    this.allQuestions = Array.from({ length: 30 }, (_, i) => ({
      qcode: `Q10${i + 1}`,
      question: `Sample question ${i + 1}`,
      type: ["MCQ", "MSQ", "True/False"][i % 3],
      age: ["6-8", "9-11", "12-14", "15-18"][i % 4],
      module: ["Time Management", "Stress Control", "Communication"][i % 3],
    }));
  },
  template: `
    <div class="container mt-4">

      <!-- Top Bar -->
      <div class="d-flex justify-content-between align-items-end mb-4 gap-2">

        <!-- Filters -->
        <div class="d-flex flex-wrap gap-2 flex-grow-1">

          <!-- Search CCode -->
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm"
            placeholder="Search CCode..."
            style="max-width: 180px;"
          />

          <!-- Module Filter -->
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Filter by Module
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

          <!-- Age Filter -->
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Filter by Age
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
        </div>

        <!-- Create Concept Button -->
       <button class="btn btn-sm btn-outline-success" @click="showCreatePopup = true">+ Create Concept</button>


      </div>
      <div v-if="showCreatePopup" class="modal d-block" style="background: rgba(0,0,0,0.5);">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h6 class="modal-title">Create Concept - Select Questions</h6>
        <button type="button" class="btn-close" @click="showCreatePopup = false"></button>
      </div>

      <div class="modal-body">
        <!-- Filters -->
        <div class="row mb-3 g-2">
<div class="row mb-3">
  <label for="conceptName" class="col form-label">Concept Name</label>
  <input
    id="conceptName"
    v-model="newConceptName"
    type="text"
    class="col form-control form-control-sm"
    placeholder="Enter concept name"
  />
</div>
          <div class="col">
            <select v-model="filterType" class="form-select form-select-sm">
              <option value="">All Types</option>
              <option v-for="type in questionTypes" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="col">
            <select v-model="filterModule" class="form-select form-select-sm">
              <option value="">All Modules</option>
              <option v-for="mod in moduleOptions" :key="mod">{{ mod }}</option>
            </select>
          </div>
          <div class="col">
            <select v-model="filterAge" class="form-select form-select-sm">
              <option value="">All Ages</option>
              <option v-for="age in ageGroups" :key="age">{{ age }}</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-primary" @click="fetchQuestions">Fetch Questions</button>
          </div>
        </div>

        <!-- Results Table -->
        <div v-if="fetchedQuestions.length > 0" class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Select</th>
                <th>QCode</th>
                <th>Question</th>
                <th>Type</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in fetchedQuestions" :key="q.qcode">
                <td>
                  <input type="checkbox" :value="q.qcode" v-model="selectedQuestionIds" />
                </td>
                <td>{{ q.qcode }}</td>
                <td>{{ q.question }}</td>
                <td>{{ q.type }}</td>
                <td>{{ q.age }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted small">No matching questions available or already used in live concepts.</p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-sm btn-secondary" @click="showCreatePopup = false">Cancel</button>
        <button class="btn btn-sm btn-success" :disabled="selectedQuestionIds.length === 0" @click="confirmAddQuestions">
          Add {{ selectedQuestionIds.length }} Question(s)
        </button>
      </div>
    </div>
  </div>
</div>


      <!-- Concepts Grid -->
      <div class="row g-3">
        <div class="col-md-3" v-for="concept in paginatedConcepts" :key="concept.ccode">
       <router-link
  :to="{
    path: '/acad/concept/' + concept.ccode,
    query: { module: concept.module }
  }"
  class="text-decoration-none text-dark"
  style="display: block;"
>

          <div class="card h-100 shadow-sm border">
            <div class="card-body">
              <p class="text-muted mb-1">CCode: {{ concept.ccode }}</p>
              <h6 class="fw-bold">{{ concept.name }}</h6>
              <p class="mb-1">📘 Module: {{ concept.module }}</p>
              <p class="mb-1">📝 Questions: {{ concept.questions }}</p>
              <p class="mb-2">🔖 Status: 
                <span :class="{'text-success': concept.status === 'LIVE', 'text-warning': concept.status === 'Under Development'}">
                  {{ concept.status }}
                </span>
              </p>
              <button
                class="btn btn-sm"
                :class="concept.status === 'LIVE' ? 'btn-outline-danger' : 'btn-outline-primary'"
                @click="toggleStatus(concept)"
              >
                {{ concept.status === 'LIVE' ? 'Make it UNLIVE' : 'Make it LIVE' }}
              </button>
            </div>
          </div>
          </router-link>
        </div>
      </div>

      <!-- Range + Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-4">
        <small class="text-muted">
          Showing {{ (currentPage - 1) * conceptsPerPage + 1 }} 
          to {{ Math.min(currentPage * conceptsPerPage, filteredConcepts.length) }} 
          of {{ filteredConcepts.length.toLocaleString() }} entries
        </small>

        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-primary"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >«</button>

          <button
            v-for="page in pageWindow"
            :key="page"
            class="btn btn-sm"
            :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
            @click="currentPage = page"
          >{{ page }}</button>

          <button
            class="btn btn-sm btn-outline-primary"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >»</button>
        </div>
      </div>

    </div>
  `,
};
