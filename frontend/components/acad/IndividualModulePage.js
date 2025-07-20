import { fetchQuestionsByModule } from "../../services/questionService.js";

export default {
  name: "IndividualModulePage",
  props: ["mcode", "filter"],
  data() {
    return {
      searchQuery: "",
      selectedType: "",
      selectedAges: [],
      selectedModule: "",
      questionTypes: ["MCQ", "MSQ", "True/False"],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      currentPage: 1,
      rowsPerPage: 10,
      questions: [],
      sortKey: "qcode",
      sortOrder: "asc",
      isLoading: false,
      showFilters: false,
    };
  },
  computed: {
    filteredQuestions() {
      const filtered = this.questions.filter(
        (q) =>
          String(q.id).includes(this.searchQuery) &&
          (this.selectedType === "" || q.type === this.selectedType) &&
          (this.selectedAges.length === 0 ||
            q.age_group?.some((ag) =>
              ag
                .split(",")
                .some((sub) => this.selectedAges.includes(sub.trim()))
            )) &&
          (this.filter === "all" ||
            this.filter === "" ||
            q.status.toLowerCase() === this.filter.toLowerCase())
      );
      return filtered.sort((a, b) => {
        let fieldA = a[this.sortKey];
        let fieldB = b[this.sortKey];
        if (typeof fieldA === "string") fieldA = fieldA.toLowerCase();
        if (typeof fieldB === "string") fieldB = fieldB.toLowerCase();
        if (fieldA < fieldB) return this.sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return this.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
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
      return `Showing ${start} to ${end} of ${this.filteredQuestions.length} entries`;
    },
    selectedAgesText() {
      return this.selectedAges.length === 0
        ? "All Ages"
        : this.selectedAges.length === 1
        ? this.selectedAges[0]
        : `${this.selectedAges.length} selected`;
    },
    activeFiltersCount() {
      let count = 0;
      if (this.searchQuery) count++;
      if (this.selectedType) count++;
      if (this.selectedAges.length > 0) count++;
      return count;
    },
    visiblePages() {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, this.currentPage - delta);
        i <= Math.min(this.totalPages - 1, this.currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (this.currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (this.currentPage + delta < this.totalPages - 1) {
        rangeWithDots.push("...", this.totalPages);
      } else {
        if (this.totalPages > 1) rangeWithDots.push(this.totalPages);
      }

      return rangeWithDots;
    },
  },
  methods: {
    goToQuestion(qcode) {
      this.$router.push(`/acad/question/${qcode}`);
    },
    editQuestion(qcode) {
      this.$router.push(`/acad/question/edit/${this.question.qcode}`);
    },
    archiveQuestion(qcode) {
      console.log("Archive clicked for:", qcode);
    },
    bulkAction(action) {
      console.log("Bulk action:", action);
    },

    setSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
    },
    clearFilters() {
      this.searchQuery = "";
      this.selectedType = "";
      this.selectedAges = [];
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  async mounted() {
    try {
      this.isLoading = true;
      const response = await fetchQuestionsByModule(this.mcode);
      this.questions = response.questions;
      this.selectedModule = response.module.name;
    } catch (err) {
      console.error("Failed to load questions:", err.message);
    } finally {
      this.isLoading = false;
    }
  },
  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Header Card -->
        <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
          <div class="card-body p-4">
            <div class="row align-items-center">
              <div class="col">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i class="bi bi-journal-bookmark text-primary fs-4"></i>
                  </div>
                  <div>
                    <h1 class="mb-1 fw-bold text-dark">{{ selectedModule }}</h1>
                    <p class="text-muted mb-0">
                      <i class="bi bi-collection me-2"></i>
                      {{ filteredQuestions.length }} questions available
                      <span v-if="activeFiltersCount > 0" class="ms-2">
                        <i class="bi bi-funnel-fill text-primary"></i>
                        {{ activeFiltersCount }} filter{{ activeFiltersCount > 1 ? 's' : '' }} applied
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-auto">
                <div class="d-flex gap-2">
                   <router-link to="/acad/question/create" class="btn btn-primary btn-lg px-4" style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;">
                        <i class="bi bi-plus-circle me-2"></i>Add Question
                      </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Card -->
        <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
          <div class="card-body p-4">
            <!-- Mobile Filter Toggle -->
            <div class="d-lg-none mb-3">
              <button class="btn btn-outline-primary w-100" @click="showFilters = !showFilters">
                <i class="bi bi-funnel me-2"></i>
                {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
                <span v-if="activeFiltersCount > 0" class="badge bg-primary ms-2">{{ activeFiltersCount }}</span>
              </button>
            </div>

            <!-- Filters Row -->
            <div class="row g-3" :class="{ 'd-none d-lg-flex': !showFilters }">
              <!-- Search -->
              <div class="col-lg-4">
                <div class="position-relative">
                  <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control form-control-lg ps-5"
                    placeholder="Search QCode"
                    style="border-radius: 15px; border: 2px solid #e9ecef;"
                  />
                </div>
              </div>

              <!-- Question Type -->
              <div class="col-lg-2">
                <select v-model="selectedType" class="form-select form-select-lg" style="border-radius: 15px; border: 2px solid #e9ecef;">
                  <option value="">All Types</option>
                  <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>

              <!-- Module (Read-only) -->
              <div class="col-lg-2">
                <input 
                  :value="selectedModule"
                  class="form-control form-control-lg"
                  style="border-radius: 15px; border: 2px solid #e9ecef; background-color: #f8f9fa;"
                  readonly
                />
              </div>

              <!-- Age Groups -->
              <div class="col-lg-2">
                <div class="dropdown">
                  <button
                    class="btn btn-outline-secondary btn-lg w-100 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    style="border-radius: 15px; border: 2px solid #e9ecef;"
                  >
                    {{ selectedAgesText }}
                  </button>
                  <div class="dropdown-menu p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                    <div v-for="age in ageGroups" :key="age" class="form-check mb-2">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :value="age"
                        v-model="selectedAges"
                        :id="'age_' + age"
                      />
                      <label class="form-check-label fw-medium" :for="'age_' + age">{{ age }} years</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Clear Filters -->
              <div class="col-lg-2">
                <button 
                  class="btn btn-outline-danger btn-lg w-100"
                  style="border-radius: 15px;"
                  @click="clearFilters"
                  :disabled="activeFiltersCount === 0"
                >
                  <i class="bi bi-x-circle me-2"></i>Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Table Card -->
        <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
          <div class="card-body p-0">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center p-5">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
              <p class="mt-3 text-muted">Loading questions...</p>
            </div>

            <!-- Questions Table -->
            <div v-else class="table-responsive" style="border-radius: 20px;">
              <table class="table table-hover align-middle mb-0">
                <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                  <tr>
                    <th class="px-4 py-3 border-0" @click="setSort('qcode')" style="cursor: pointer;">
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-semibold">QCode</span>
                        <i :class="sortKey === 'qcode' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0">
                      <span class="fw-semibold">Question Text</span>
                    </th>
                    <th class="px-4 py-3 border-0 text-center" @click="setSort('type')" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <span class="fw-semibold">Type</span>
                        <i :class="sortKey === 'type' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0 text-center" @click="setSort('age')" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <span class="fw-semibold">Age Group</span>
                        <i :class="sortKey === 'age' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0 text-center" @click="setSort('status')" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <span class="fw-semibold">Status</span>
                        <i :class="sortKey === 'status' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0 text-center">
                      <span class="fw-semibold">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(q, index) in paginatedQuestions"
                    :key="q.id"
                    @click="goToQuestion(q.id)"
                    class="question-row"
                    style="cursor: pointer; transition: all 0.3s ease;"
                    :style="{ 'animation-delay': (index * 0.05) + 's' }"
                  >
                    <td class="px-4 py-4">
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-primary bg-opacity-10 px-3 py-2 rounded-pill">
                          <span class="fw-bold text-primary">Q{{ q.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="question-text" style="max-width: 400px;">
                        <p class="mb-0 fw-medium text-dark" style="line-height: 1.4;">
                          {{ q.question_statement.length > 80 ? q.question_statement.substring(0, 80) + '...' : q.question_statement }}
                        </p>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span 
                        class="badge px-3 py-2 fs-6"
                        :class="{
                          'bg-info text-dark': q.type === 'MCQ',
                          'bg-warning text-dark': q.type === 'MSQ',
                          'bg-success': q.type === 'True/False',
                          'bg-info': q.type === 'Matching'
                        }"
                        style="border-radius: 20px;"
                      >
                        {{ q.type }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span
                        v-for="(age, i) in q.age_group[0].split(',')"
                        :key="age"
                        class="badge bg-secondary me-1"
                        style="border-radius: 20px;"
                      >
                        {{ age }} 
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span
                        class="badge px-3 py-2 fs-6 position-relative"
                        :class="{
                          'bg-success': q.status === 'Approved',
                          'bg-danger': q.status === 'Rejected',
                          'bg-warning text-dark': q.status === 'Pending',
                        }"
                        style="border-radius: 20px;"
                      >
                        <i 
                          class="me-2"
                          :class="{
                            'bi bi-check-circle': q.status === 'Approved',
                            'bi bi-x-circle': q.status === 'Rejected',
                            'bi bi-clock': q.status === 'Pending'
                          }"
                        ></i>
                        {{ q.status }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-sm btn-outline-primary"
                          @click.stop="editQuestion(q.id)"
                          title="Edit Question"
                          style="border-radius: 10px 0 0 10px;"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click.stop="archiveQuestion(q.id)"
                          title="Archive Question"
                          style="border-radius: 0 10px 10px 0;"
                        >
                          <i class="bi bi-archive"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Empty State -->
                  <tr v-if="paginatedQuestions.length === 0">
                    <td colspan="6" class="text-center py-5">
                      <div class="empty-state">
                        <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                          <i class="bi bi-search fs-1 text-muted"></i>
                        </div>
                        <h5 class="text-muted mb-2">No questions found</h5>
                        <p class="text-muted mb-0">Try adjusting your search criteria or filters</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="!isLoading && totalPages > 1" class="px-4 py-4 border-top">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <p class="text-muted mb-0 small">{{ showingRangeText }}</p>
                </div>
                <div class="col-md-6">
                  <nav class="d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
                    <ul class="pagination pagination-lg mb-0" style="--bs-pagination-border-radius: 15px;">
                      <!-- Previous Button -->
                      <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                          <i class="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      <!-- Page Numbers -->
                      <li 
                        v-for="page in visiblePages" 
                        :key="page"
                        class="page-item"
                        :class="{ active: page === currentPage, disabled: page === '...' }"
                      >
                        <button 
                          v-if="page !== '...'"
                          class="page-link"
                          @click="changePage(page)"
                          :class="{ 'bg-gradient': page === currentPage }"
                          :style="page === currentPage ? 'background: linear-gradient(45deg, #667eea, #764ba2); border-color: #667eea;' : ''"
                        >
                          {{ page }}
                        </button>
                        <span v-else class="page-link">...</span>
                      </li>
                      
                      <!-- Next Button -->
                      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                          <i class="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
