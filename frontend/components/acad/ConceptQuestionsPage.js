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
      perPage: 12,
      questionTypes: ["MCQ", "MSQ", "True/False"],
      moduleList: ["Time Management", "Stress Control", "Communication"],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      questions: [],
      allQuestions: [],
      showAddPopup: false,
      filterQcode: "",
      filterType: "",
      filterModule: "",
      filterAge: "",
      fetchedQuestions: [],
      selectedQuestionIds: [],
      isLoading: false,
      isFetching: false,
      activeDropdown: null,
      showMobileFilters: false,
    };
  },
  directives: {
    "click-outside": {
      mounted(el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener("click", el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener("click", el.clickOutsideEvent);
      },
    },
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
    activeFiltersCount() {
      let count = 0;
      if (this.searchQuery) count++;
      if (this.selectedType) count++;
      if (this.selectedAge) count++;
      return count;
    },
    conceptCode() {
      return this.$route.params.ccode || "UNKNOWN";
    },
  },
  mounted() {
    this.loadConceptData();
  },
  methods: {
    async loadConceptData() {
      try {
        this.isLoading = true;
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
          question: `This is a sample concept question ${
            i + 1
          } that demonstrates how the question text appears in the interface`,
          type: this.questionTypes[i % 3],
          age: this.ageGroups[i % 4],
          module: this.selectedModule || this.moduleList[i % 3],
          status: "Approved",
        }));

        // Simulate all available questions
        this.allQuestions = Array.from({ length: 30 }, (_, i) => ({
          qcode: `Q${301 + i}`,
          question: `Available question ${i + 1} for addition to concept`,
          type: this.questionTypes[i % 3],
          age: this.ageGroups[i % 4],
          module: this.moduleList[i % 3],
          status: "Approved",
        }));
      } catch (error) {
        console.error("Failed to load concept data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchQuestions() {
      try {
        this.isFetching = true;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

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
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        this.isFetching = false;
      }
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
      this.fetchedQuestions = [];
      this.selectedQuestionIds = [];
    },
    removeQuestion(qcode) {
      this.questions = this.questions.filter((q) => q.qcode !== qcode);
    },
    toggleDropdown(dropdownName) {
      this.activeDropdown =
        this.activeDropdown === dropdownName ? null : dropdownName;
    },
    closeDropdown() {
      this.activeDropdown = null;
    },
    clearAllFilters() {
      this.searchQuery = "";
      this.selectedType = "";
      this.selectedAge = "";
      this.currentPage = 1;
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getTypeIcon(type) {
      switch (type) {
        case "MCQ":
          return "bi-list-check";
        case "MSQ":
          return "bi-check2-square";
        case "True/False":
          return "bi-toggle-on";
        default:
          return "bi-question-circle";
      }
    },
    getStatusColor(status) {
      switch (status) {
        case "Approved":
          return "success";
        case "Rejected":
          return "danger";
        case "Pending":
          return "warning";
        default:
          return "secondary";
      }
    },
  },
  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-body p-4">
                <div class="row align-items-center">
                  <div class="col-lg-8">
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <i class="bi bi-collection-fill text-primary fs-2"></i>
                      </div>
                      <div>
                        <h1 class="mb-1 fw-bold text-dark">Concept Questions</h1>
                        <p class="text-muted mb-0">
                          <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill me-2">
                            {{ conceptCode }}
                          </span>
                          <i class="bi bi-book me-2"></i>{{ selectedModule }}
                          <span class="ms-3">
                            <i class="bi bi-list-ol me-2"></i>
                            {{ filteredQuestions.length }} questions
                          </span>
                          <span v-if="activeFiltersCount > 0" class="ms-2">
                            <i class="bi bi-funnel-fill text-primary"></i>
                            {{ activeFiltersCount }} filter{{ activeFiltersCount > 1 ? 's' : '' }} applied
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="d-flex gap-2 justify-content-lg-end">
                 
                      <button 
                        class="btn btn-primary btn-lg px-4"
                        @click="showAddPopup = true"
                        style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;"
                      >
                        <i class="bi bi-plus-circle me-2"></i>Add Questions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="row mb-4">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-header bg-transparent border-0 p-4">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-funnel text-primary fs-5"></i>
                    <h5 class="mb-0 fw-bold text-dark">Filters</h5>
                  </div>
                  
                  <!-- Mobile Filter Toggle -->
                  <div class="d-lg-none">
                    <button class="btn btn-outline-primary" @click="showMobileFilters = !showMobileFilters">
                      <i class="bi bi-funnel me-2"></i>
                      {{ showMobileFilters ? 'Hide' : 'Show' }} Filters
                      <span v-if="activeFiltersCount > 0" class="badge bg-primary ms-2">{{ activeFiltersCount }}</span>
                    </button>
                  </div>

                  <!-- Clear Filters Button -->
                  <button 
                    v-if="activeFiltersCount > 0"
                    class="btn btn-outline-danger d-none d-lg-block"
                    @click="clearAllFilters"
                  >
                    <i class="bi bi-x-circle me-2"></i>Clear All
                  </button>
                </div>
              </div>
              
              <div class="card-body p-4 pt-0" :class="{ 'd-none d-lg-block': !showMobileFilters }">
                <div class="row g-3">
                  <!-- Search -->
                  <div class="col-lg-3">
                    <div class="position-relative">
                      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="form-control form-control-lg ps-5"
                        placeholder="Search by QCode..."
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      />
                    </div>
                  </div>

                  <!-- Type Filter -->
                  <div class="col-lg-3">
                    <select 
                      v-model="selectedType" 
                      class="form-select form-select-lg"
                      style="border-radius: 15px; border: 2px solid #e9ecef;"
                    >
                      <option value="">All Types</option>
                      <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                  </div>

                  <!-- Module (Fixed) -->
                  <div class="col-lg-3">
                    <input 
                      :value="selectedModule"
                      class="form-control form-control-lg"
                      style="border-radius: 15px; border: 2px solid #e9ecef; background-color: #f8f9fa;"
                      readonly
                    />
                  </div>

                  <!-- Age Filter -->
                  <div class="col-lg-3">
                    <select 
                      v-model="selectedAge" 
                      class="form-select form-select-lg"
                      style="border-radius: 15px; border: 2px solid #e9ecef;"
                    >
                      <option value="">All Ages</option>
                      <option v-for="age in ageGroups" :key="age" :value="age">{{ age }}</option>
                    </select>
                  </div>
                </div>
                
                <!-- Mobile Clear Button -->
                <div class="d-lg-none mt-3" v-if="activeFiltersCount > 0">
                  <button class="btn btn-outline-danger w-100" @click="clearAllFilters">
                    <i class="bi bi-x-circle me-2"></i>Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Grid -->
        <div class="row mb-4">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="isLoading" class="text-center p-5">
                  <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
                  <p class="mt-3 text-muted">Loading questions...
                </p>
                </div>

                <!-- Questions Table -->
                <div v-else class="table-responsive" style="border-radius: 20px;">
                  <table class="table table-hover align-middle mb-0">
                    <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                      <tr>
                        <th class="px-4 py-3 border-0">
                          <span class="fw-semibold">QCode</span>
                        </th>
                        <th class="px-4 py-3 border-0">
                          <span class="fw-semibold">Question</span>
                        </th>
                        <th class="px-4 py-3 border-0 text-center">
                          <span class="fw-semibold">Type</span>
                        </th>
                        <th class="px-4 py-3 border-0 text-center">
                          <span class="fw-semibold">Age Group</span>
                        </th>
                        <th class="px-4 py-3 border-0 text-center">
                          <span class="fw-semibold">Status</span>
                        </th>
                        <th class="px-4 py-3 border-0 text-center">
                          <span class="fw-semibold">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(q, index) in paginatedQuestions"
                        :key="q.qcode"
                        class="question-row"
                        style="transition: all 0.3s ease;"
                        :style="{ 'animation-delay': (index * 0.05) + 's' }"
                      >
                        <td class="px-4 py-4">
                          <div class="bg-primary bg-opacity-10 px-3 py-2 rounded-pill d-inline-block">
                            <span class="fw-bold text-primary">{{ q.qcode }}</span>
                          </div>
                        </td>
                        <td class="px-4 py-4">
                          <div class="question-text" style="max-width: 400px;">
                            <p class="mb-0 fw-medium text-dark" style="line-height: 1.4;">
                              {{ q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question }}
                            </p>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span class="badge bg-info bg-opacity-20 text-black px-3 py-2 fs-6" style="border-radius: 20px;">
                            <i :class="getTypeIcon(q.type) + ' me-1'"></i>
                            {{ q.type }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span class="badge bg-secondary bg-opacity-20 text-white px-3 py-2 fs-6" style="border-radius: 20px;">
                            {{ q.age }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span
                            class="badge px-3 py-2 fs-6"
                            :class="'bg-' + getStatusColor(q.status)"
                            style="border-radius: 20px;"
                          >
                            {{ q.status }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="removeQuestion(q.qcode)"
                            title="Remove from Concept"
                            style="border-radius: 10px;"
                          >
                            <i class="bi bi-x-circle"></i>
                          </button>
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
                            <p class="text-muted mb-0">Try adjusting your search criteria or add some questions</p>
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
                      <p class="text-muted mb-0 small">
                        <i class="bi bi-info-circle me-2"></i>
                        Showing {{ (currentPage - 1) * perPage + 1 }}
                        to {{ Math.min(currentPage * perPage, filteredQuestions.length) }}
                        of {{ filteredQuestions.length.toLocaleString() }} questions
                      </p>
                    </div>
                    <div class="col-md-6">
                      <nav class="d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
                        <ul class="pagination pagination-lg mb-0">
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
      </div>

      <!-- Add Questions Modal -->
      <div v-if="showAddPopup" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
        <div class="modal-dialog modal-xl">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header text-white" style="background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 20px 20px 0 0;">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-plus-circle me-2"></i>
                Add Questions to Concept
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="showAddPopup = false"></button>
            </div>
            <div class="modal-body p-4">
              <!-- Filters -->
              <div class="card bg-light border-0 mb-4">
                <div class="card-body">
                  <h6 class="card-title mb-3">
                    <i class="bi bi-funnel me-2"></i>
                    Filter Available Questions
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-2">
                      <label class="form-label fw-semibold">QCode</label>
                      <input 
                        v-model="filterQcode" 
                        class="form-control" 
                        placeholder="Search QCode"
                        style="border-radius: 10px;"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label fw-semibold">Type</label>
                      <select v-model="filterType" class="form-select" style="border-radius: 10px;">
                        <option value="">All Types</option>
                        <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Module</label>
                      <select v-model="filterModule" class="form-select" style="border-radius: 10px;">
                        <option value="">All Modules</option>
                        <option v-for="mod in moduleList" :key="mod" :value="mod">{{ mod }}</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <label class="form-label fw-semibold">Age</label>
                      <select v-model="filterAge" class="form-select" style="border-radius: 10px;">
                        <option value="">All Ages</option>
                        <option v-for="age in ageGroups" :key="age" :value="age">{{ age }}</option>
                      </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                      <button 
                        class="btn btn-primary w-100" 
                        @click="fetchQuestions"
                        :disabled="isFetching"
                        style="border-radius: 10px;"
                      >
                        <span v-if="isFetching" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-search me-2"></i>
                        {{ isFetching ? 'Searching...' : 'Search Questions' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Results -->
              <div v-if="fetchedQuestions.length > 0" class="card border-0 bg-light">
                <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-semibold">Available Questions</h6>
                  <span class="badge bg-primary">{{ fetchedQuestions.length }} questions found</span>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0">
                      <thead class="table-primary">
                        <tr>
                          <th class="px-4 py-3">
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :checked="selectedQuestionIds.length === fetchedQuestions.length"
                                @change="selectedQuestionIds = $event.target.checked ? fetchedQuestions.map(q => q.qcode) : []"
                              />
                            </div>
                          </th>
                          <th class="px-4 py-3 fw-semibold">QCode</th>
                          <th class="px-4 py-3 fw-semibold">Question</th>
                          <th class="px-4 py-3 fw-semibold text-center">Type</th>
                          <th class="px-4 py-3 fw-semibold text-center">Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="q in fetchedQuestions" :key="q.qcode">
                          <td class="px-4 py-3">
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :value="q.qcode" 
                                v-model="selectedQuestionIds" 
                              />
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                              {{ q.qcode }}
                            </span>
                          </td>
                          <td class="px-4 py-3">
                            <div style="max-width: 400px;">
                              {{ q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question }}
                            </div>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <span class="badge bg-info bg-opacity-20 text-black px-2 py-1 rounded-pill">
                              {{ q.type }}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <span class="badge bg-secondary bg-opacity-20 text-white px-2 py-1 rounded-pill">
                              {{ q.age }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div v-else-if="!isFetching && fetchedQuestions.length === 0 && (filterQcode || filterType || filterModule || filterAge)" class="text-center py-4">
                <div class="text-muted">
                  <i class="bi bi-info-circle fs-3 mb-3 d-block"></i>
                  <p class="mb-0">No questions available with the selected filters or all matching questions are already added to this concept.</p>
                </div>
              </div>
            </div>
            <div class="modal-footer p-4 border-top">
              <button class="btn btn-outline-secondary btn-lg px-4" @click="showAddPopup = false">
                <i class="bi bi-x-circle me-2"></i>Cancel
              </button>
              <button 
                class="btn btn-success btn-lg px-4" 
                :disabled="selectedQuestionIds.length === 0" 
                @click="addSelectedQuestions"
              >
                <i class="bi bi-check-circle me-2"></i>
                Add {{ selectedQuestionIds.length }} Question{{ selectedQuestionIds.length !== 1 ? 's' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
