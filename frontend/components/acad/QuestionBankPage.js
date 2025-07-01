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
      questionsPerPage: 15,
      questions: [],
      sortField: "qcode",
      sortDirection: "asc",
      activeDropdown: null,
      isLoading: false,
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
      let filtered = this.questions.filter(
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
      return filtered.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];
        if (this.sortField === "age_groups") {
          aValue = a.age_groups.join(", ");
          bValue = b.age_groups.join(", ");
        }
        if (this.sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    },
    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.questionsPerPage;
      return this.filteredQuestions.slice(start, start + this.questionsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.questionsPerPage);
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
      return (
        this.selectedTypes.length +
        this.selectedModules.length +
        this.selectedAges.length +
        this.selectedStatuses.length +
        (this.searchQuery ? 1 : 0)
      );
    },
  },
  mounted() {
    this.loadQuestions();
  },
  methods: {
    async loadQuestions() {
      try {
        this.isLoading = true;
        this.questions = await fetchAllQuestions();
      } catch (err) {
        console.error("Failed to load questions:", err.message);
      } finally {
        this.isLoading = false;
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
      this.$router.push(`/acad/question/edit/${qcode}`);
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
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortDirection = "asc";
      }
    },
    getSortIcon(field) {
      if (this.sortField !== field) return "bi-arrows-expand";
      return this.sortDirection === "asc"
        ? "bi-caret-up-fill"
        : "bi-caret-down-fill";
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case "Approved":
          return "bg-success";
        case "Rejected":
          return "bg-danger";
        case "Pending":
          return "bg-warning text-dark";
        case "Archived":
          return "bg-secondary";
        default:
          return "bg-light text-dark";
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
    toggleDropdown(dropdownName) {
      this.activeDropdown =
        this.activeDropdown === dropdownName ? null : dropdownName;
    },
    closeDropdown() {
      this.activeDropdown = null;
    },
    clearAllFilters() {
      this.searchQuery = "";
      this.selectedTypes = [];
      this.selectedModules = [];
      this.selectedAges = [];
      this.selectedStatuses = [];
      this.currentPage = 1;
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
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
                        <i class="bi bi-collection text-primary fs-2"></i>
                      </div>
                      <div>
                        <h1 class="mb-1 fw-bold text-dark">Question Bank</h1>
                        <p class="text-muted mb-0">
                          <i class="bi bi-database me-2"></i>
                          {{ filteredQuestions.length }} questions available
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
                      <button class="btn btn-outline-primary btn-sm px-2 py-1">
                        <i class="bi bi-download me-2"></i>Export
                      </button>
                      <router-link to="/acad/question/create" class="btn btn-primary btn-lg px-4" style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;">
                        <i class="bi bi-plus-circle me-2"></i>Create Question
                      </router-link>
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
                    <h5 class="mb-0 fw-bold text-dark">Advanced Filters</h5>
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
                  <div class="col-lg-4">
                    <div class="position-relative">
                      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="form-control form-control-sm ps-4"
                        placeholder="Search by QCode..."
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      />
                    </div>
                  </div>

                  <!-- Type Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                        type="button"
                        @click="toggleDropdown('type')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-tag me-2"></i>
                        Type
                        <span v-if="selectedTypes.length" class="badge bg-primary ms-2">{{ selectedTypes.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'type'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="type in questionTypes" :key="type" class="form-check mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :value="type"
                            v-model="selectedTypes"
                            :id="'type_' + type"
                          />
                          <label class="form-check-label fw-medium d-flex align-items-center" :for="'type_' + type">
                            <i :class="getTypeIcon(type) + ' me-2 text-primary'"></i>
                            {{ type }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Module Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                        type="button"
                        @click="toggleDropdown('module')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-book me-2"></i>
                        Module
                        <span v-if="selectedModules.length" class="badge bg-primary ms-2">{{ selectedModules.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'module'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="mod in moduleOptions" :key="mod" class="form-check mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :value="mod"
                            v-model="selectedModules"
                            :id="'mod_' + mod"
                          />
                          <label class="form-check-label fw-medium" :for="'mod_' + mod">{{ mod }}</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Age Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                        type="button"
                        @click="toggleDropdown('age')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-people me-2"></i>
                        Age
                        <span v-if="selectedAges.length" class="badge bg-primary ms-2">{{ selectedAges.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'age'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
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

                  <!-- Status Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                        type="button"
                        @click="toggleDropdown('status')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-flag me-2"></i>
                        Status
                        <span v-if="selectedStatuses.length" class="badge bg-primary ms-2">{{ selectedStatuses.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'status'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="status in statusOptions" :key="status" class="form-check mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :value="status"
                            v-model="selectedStatuses"
                            :id="'status_' + status"
                          />
                          <label class="form-check-label fw-medium" :for="'status_' + status">{{ status }}</label>
                        </div>
                      </div>
                    </div>
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

        <!-- Questions Table -->
        <div class="row">
          <div class="col">
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
                        <th class="px-4 py-3 border-0" @click="sortBy('qcode')" style="cursor: pointer;">
                          <div class="d-flex align-items-center gap-2">
                            <span class="fw-semibold">QCode</span>
                            <i :class="getSortIcon('qcode')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0" @click="sortBy('question_text')" style="cursor: pointer;">
                          <div class="d-flex align-items-center gap-2">
                            <span class="fw-semibold">Question</span>
                            <i :class="getSortIcon('question_text')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('question_type')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Type</span>
                            <i :class="getSortIcon('question_type')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('age_groups')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Age Group</span>
                            <i :class="getSortIcon('age_groups')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('module_name')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Module</span>
                            <i :class="getSortIcon('module_name')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('status')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Status</span>
                            <i :class="getSortIcon('status')"></i>
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
                        :key="q.qcode"
                        @click="goToQuestion(q.qcode)"
                        class="question-row"
                        style="cursor: pointer; transition: all 0.3s ease;"
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
                              {{ q.question_text.length > 80 ? q.question_text.substring(0, 80) + '...' : q.question_text }}
                            </p>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span class="badge bg-info bg-opacity-20 text-dark px-3 py-2 fs-6" style="border-radius: 20px;">
                            <i :class="getTypeIcon(q.question_type) + ' me-1'"></i>
                            {{ q.question_type }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span class="badge bg-secondary bg-opacity-20 text-white px-3 py-2 fs-6" style="border-radius: 20px;">
                            {{ q.age_groups.join(", ") }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span class="badge bg-primary bg-opacity-20 text-white px-3 py-2 fs-6" style="border-radius: 20px;">
                            {{ q.module_name }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span
                            class="badge px-3 py-2 fs-6"
                            :class="getStatusBadgeClass(q.status)"
                            style="border-radius: 20px;"
                          >
                            {{ q.status }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center" @click.stop>
                          <div class="btn-group" role="group">
                            <button
                              class="btn btn-sm btn-outline-primary"
                              @click="editQuestion(q.qcode)"
                              title="Edit Question"
                              style="border-radius: 10px 0 0 10px;"
                            >
                              <i class="bi bi-pencil-square"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="archiveQuestion(q.qcode)"
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
                        <td colspan="7" class="text-center py-5">
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

                <!-- Compact Pagination -->
<div v-if="!isLoading && totalPages > 1" class="pt-3 border-top">
  <div class="row align-items-center gy-2">
    
    <!-- Range text -->
    <div class="col-md-6 text-center text-md-start">
      <p class="text-muted mb-0 small" style="font-size: 0.85rem;">
        <i class="bi bi-info-circle me-1 text-primary"></i>
        Showing 
        {{ (currentPage - 1) * questionsPerPage + 1 }} 
        to 
        {{ Math.min(currentPage * questionsPerPage, filteredQuestions.length) }} 
        of 
        {{ filteredQuestions.length.toLocaleString() }} questions
      </p>
    </div>

    <!-- Pagination controls -->
    <div class="col-md-6">
      <nav class="d-flex justify-content-center justify-content-md-end">
        <ul class="pagination pagination-sm mb-0">

          <!-- Previous -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link px-2 py-1" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="bi bi-chevron-left small"></i>
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
              class="page-link px-2 py-1"
              @click="changePage(page)"
              :style="page === currentPage ? 'background: #667eea; border-color: #667eea; color: white;' : ''"
              style="font-size: 0.85rem;"
            >
              {{ page }}
            </button>
            <span v-else class="page-link px-2 py-1" style="font-size: 0.85rem;">…</span>
          </li>

          <!-- Next -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link px-2 py-1" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="bi bi-chevron-right small"></i>
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
    </div>
  `,
};
