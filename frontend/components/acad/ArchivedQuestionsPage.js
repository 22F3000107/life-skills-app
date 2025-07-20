import {
  fetchAllQuestions,
  restoreQuestion,
  deleteQuestion,
  updateQuestion,
} from "../../services/questionService.js";

export default {
  name: "ArchivedQuestionsPage",
  data() {
    return {
      searchQuery: "",
      selectedTypes: [],
      selectedModules: [],
      selectedAges: [],
      selectedArchiveReasons: [],
      questionTypes: ["MCQ", "MSQ", "True/False", "Matching"],
      moduleList: [],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      archiveReasons: [
        "Outdated Content",
        "Duplicate",
        "Low Quality",
        "Policy Change",
        "Other",
      ],

      currentPage: 1,
      questionsPerPage: 15,
      questions: [],
      selectedQuestions: [],

      sortField: "archived_date",
      sortDirection: "desc",
      activeDropdown: null,

      isLoading: false,
      isProcessing: false,
      showMobileFilters: false,

      // Modals
      showRestoreModal: false,
      showDeleteModal: false,
      showBulkActionsModal: false,
      showDetailsModal: false,

      // Modal data
      currentQuestion: null,
      bulkAction: "",
      restoreComment: "",

      // Statistics
      stats: {
        total: 0,
        thisMonth: 0,
        thisYear: 0,
        byReason: {},
      },
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
    archivedQuestions() {
      return this.questions.filter((q) => q.is_archived === true);
    },

    filteredQuestions() {
      let filtered = this.archivedQuestions.filter((q) => {
        const matchesSearch =
          !this.searchQuery ||
          q.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          q.question_statement
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        const matchesType =
          this.selectedTypes.length === 0 ||
          this.selectedTypes.includes(q.question_type);

        const matchesModule =
          this.selectedModules.length === 0 ||
          this.selectedModules.includes(q.module_name);

        const matchesAge =
          this.selectedAges.length === 0 ||
          (q.age_group &&
            q.age_group.some((age) => this.selectedAges.includes(age)));

        const matchesReason =
          this.selectedArchiveReasons.length === 0 ||
          this.selectedArchiveReasons.includes(q.archive_reason);

        return (
          matchesSearch &&
          matchesType &&
          matchesModule &&
          matchesAge &&
          matchesReason
        );
      });

      return this.sortQuestions(filtered);
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
        this.selectedArchiveReasons.length +
        (this.searchQuery ? 1 : 0)
      );
    },

    selectedQuestionsCount() {
      return this.selectedQuestions.length;
    },
  },

  mounted() {
    this.loadQuestions();
  },

  methods: {
    async loadQuestions() {
      try {
        this.isLoading = true;
        const allQuestions = await fetchAllQuestions();

        // Add archive-specific data to questions
        this.questions = allQuestions.map((q) => ({
          ...q,
          archived_date:
            q.archived_date ||
            (q.is_archived === true ? new Date().toISOString() : null),
          archive_reason: q.archive_reason || "Other",
          archived_by: q.archived_by || "System",
        }));

        this.calculateStats();
      } catch (err) {
        console.error("Failed to load questions:", err.message);
      } finally {
        this.isLoading = false;
      }
    },

    calculateStats() {
      const archived = this.archivedQuestions;
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      this.stats = {
        total: archived.length,
        thisMonth: archived.filter((q) => {
          const archivedDate = new Date(q.archived_date);
          return (
            archivedDate.getFullYear() === thisYear &&
            archivedDate.getMonth() === thisMonth
          );
        }).length,
        thisYear: archived.filter((q) => {
          const archivedDate = new Date(q.archived_date);
          return archivedDate.getFullYear() === thisYear;
        }).length,
        byReason: archived.reduce((acc, q) => {
          acc[q.archive_reason] = (acc[q.archive_reason] || 0) + 1;
          return acc;
        }, {}),
      };
    },

    sortQuestions(questions) {
      return questions.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];

        if (this.sortField === "age_groups") {
          aValue = a.age_groups ? a.age_groups.join(", ") : "";
          bValue = b.age_groups ? b.age_groups.join(", ") : "";
        } else if (this.sortField === "archived_date") {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        if (this.sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    },

    async restoreQuestion(question = null) {
      const questionToRestore = question || this.currentQuestion;
      if (!questionToRestore) return;

      try {
        this.isProcessing = true;

        // Call restore API
        await restoreQuestion(questionToRestore.qcode, {
          restore_comment: this.restoreComment,
          restored_by: "Current User", // Replace with actual user
          restored_date: new Date().toISOString(),
        });

        // Update local data
        const index = this.questions.findIndex(
          (q) => q.id === questionToRestore.qcode
        );
        if (index > -1) {
          this.questions[index] = {
            ...this.questions[index],
            status: "Draft", // Or whatever the default restored status should be
            archived_date: null,
            archive_reason: null,
            archived_by: null,
          };
        }

        this.calculateStats();
        this.showRestoreModal = false;
        this.restoreComment = "";
        this.currentQuestion = null;
      } catch (error) {
        console.error("Failed to restore question:", error);
        alert("Failed to restore question. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },

    async deleteQuestion(question = null) {
      const questionToDelete = question || this.currentQuestion;
      if (!questionToDelete) return;

      if (
        !confirm(
          `Are you sure you want to permanently delete question ${questionToDelete.qcode}? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        this.isProcessing = true;

        await deleteQuestion(questionToDelete.qcode);

        // Remove from local data
        this.questions = this.questions.filter(
          (q) => q.id !== questionToDelete.qcode
        );
        this.selectedQuestions = this.selectedQuestions.filter(
          (qcode) => qcode !== questionToDelete.qcode
        );

        this.calculateStats();
        this.showDeleteModal = false;
        this.currentQuestion = null;
      } catch (error) {
        console.error("Failed to delete question:", error);
        alert("Failed to delete question. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },

    async bulkRestore() {
      if (this.selectedQuestions.length === 0) return;

      try {
        this.isProcessing = true;
        const promises = this.selectedQuestions.map((qcode) =>
          restoreQuestion(qcode, {
            restore_comment: this.restoreComment,
            restored_by: "Current User",
            restored_date: new Date().toISOString(),
          })
        );

        await Promise.all(promises);

        // Update local data
        this.selectedQuestions.forEach((qcode) => {
          const index = this.questions.findIndex((q) => q.id === qcode);
          if (index > -1) {
            this.questions[index] = {
              ...this.questions[index],
              status: "Draft",
              archived_date: null,
              archive_reason: null,
              archived_by: null,
            };
          }
        });

        this.selectedQuestions = [];
        this.calculateStats();
        this.showBulkActionsModal = false;
        this.restoreComment = "";
      } catch (error) {
        console.error("Failed to bulk restore:", error);
        alert("Some questions failed to restore. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },

    async bulkDelete() {
      if (this.selectedQuestions.length === 0) return;

      if (
        !confirm(
          `Are you sure you want to permanently delete ${this.selectedQuestions.length} questions? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        this.isProcessing = true;
        const promises = this.selectedQuestions.map((qcode) =>
          deleteQuestion(qcode)
        );

        await Promise.all(promises);

        // Remove from local data
        this.questions = this.questions.filter(
          (q) => !this.selectedQuestions.includes(q.id)
        );
        this.selectedQuestions = [];

        this.calculateStats();
        this.showBulkActionsModal = false;
      } catch (error) {
        console.error("Failed to bulk delete:", error);
        alert("Some questions failed to delete. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },

    toggleQuestionSelection(qcode) {
      const index = this.selectedQuestions.indexOf(qcode);
      if (index > -1) {
        this.selectedQuestions.splice(index, 1);
      } else {
        this.selectedQuestions.push(qcode);
      }
    },

    selectAllFiltered() {
      this.selectedQuestions = this.filteredQuestions.map((q) => q.id);
    },

    clearSelection() {
      this.selectedQuestions = [];
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

    getTypeIcon(type) {
      switch (type) {
        case "MCQ":
          return "bi-list-check";
        case "MSQ":
          return "bi-check2-square";
        case "True/False":
          return "bi-toggle-on";
        case "Matching":
          return "bi-diagram-2";
        default:
          return "bi-question-circle";
      }
    },

    getArchiveReasonColor(reason) {
      const colors = {
        "Outdated Content": "warning",
        Duplicate: "info",
        "Low Quality": "danger",
        "Policy Change": "secondary",
        Other: "dark",
      };
      return colors[reason] || "secondary";
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
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
      this.selectedArchiveReasons = [];
      this.currentPage = 1;
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    viewQuestion(qcode) {
      this.$router.push(`/acad/question/${qcode}`);
    },

    showQuestionDetails(question) {
      this.currentQuestion = question;
      this.showDetailsModal = true;
    },
  },

  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="car

-body p-4">
                <div class="row align-items-center">
                  <div class="col-lg-8">
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-danger bg-opacity-10 p-3 rounded-circle">
                        <i class="bi bi-archive text-danger fs-2"></i>
                      </div>
                      <div>
                        <h1 class="mb-1 fw-bold text-dark">Archived Questions</h1>
                        <p class="text-muted mb-0">
                          <i class="bi bi-trash me-2"></i>
                          {{ filteredQuestions.length }} archived questions
                          <span v-if="selectedQuestionsCount > 0" class="ms-3">
                            <i class="bi bi-check2-square me-1"></i>
                            {{ selectedQuestionsCount }} selected
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
                        v-if="selectedQuestionsCount > 0"
                        class="btn btn-warning btn-lg px-4"
                        @click="showBulkActionsModal = true"
                      >
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Bulk Actions ({{ selectedQuestionsCount }})
                      </button>
                      <router-link to="/acad/question-bank" class="btn btn-primary btn-lg px-4" style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;">
                        <i class="bi bi-collection me-2"></i>Question Bank
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-md-6">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-archive text-danger fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-danger">{{ stats.total }}</h6>
                    <small class="text-muted">Total Archived</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-calendar-month text-warning fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-warning">{{ stats.thisMonth }}</h6>
                    <small class="text-muted">This Month</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-calendar-year text-info fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-info">{{ stats.thisYear }}</h6>
                    <small class="text-muted">This Year</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-arrow-clockwise text-success fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-success">{{ selectedQuestionsCount }}</h6>
                    <small class="text-muted">Selected</small>
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
                  <div class="col-lg-3">
                    <div class="position-relative">
                      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="form-control form-control-lg ps-5"
                        placeholder="Search questions..."
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      />
                    </div>
                  </div>

                  <!-- Type Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary btn-lg w-100 dropdown-toggle"
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
                        class="btn btn-outline-secondary btn-lg w-100 dropdown-toggle"
                        type="button"
                        @click="toggleDropdown('module')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-book me-2"></i>
                        Module
                        <span v-if="selectedModules.length" class="badge bg-primary ms-2">{{ selectedModules.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'module'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="mod in moduleList" :key="mod" class="form-check mb-2">
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
                        class="btn btn-outline-secondary btn-lg w-100 dropdown-toggle"
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

                  <!-- Archive Reason Filter -->
                  <div class="col-lg-3">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary btn-lg w-100 dropdown-toggle"
                        type="button"
                        @click="toggleDropdown('reason')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Archive Reason
                        <span v-if="selectedArchiveReasons.length" class="badge bg-primary ms-2">{{ selectedArchiveReasons.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'reason'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="reason in archiveReasons" :key="reason" class="form-check mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :value="reason"
                            v-model="selectedArchiveReasons"
                            :id="'reason_' + reason"
                          />
                          <label class="form-check-label fw-medium" :for="'reason_' + reason">{{ reason }}</label>
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
              <div class="card-header bg-transparent border-0 p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0 fw-bold text-dark">Archived Questions</h5>
                  <div class="d-flex gap-2">
                    <button 
                      v-if="filteredQuestions.length > 0"
                      class="btn btn-outline-primary"
                      @click="selectedQuestions.length === filteredQuestions.length ? clearSelection() : selectAllFiltered()"
                    >
                      <i class="bi bi-check2-all me-2"></i>
                      {{ selectedQuestions.length === filteredQuestions.length ? 'Clear All' : 'Select All' }}
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="isLoading" class="text-center p-5">
                  <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
                  <p class="mt-3 text-muted">Loading archived questions...</p>
                </div>

                <!-- Questions Table -->
                <div v-else class="table-responsive" style="border-radius: 20px;">
                  <table class="table table-hover align-middle mb-0">
                    <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                      <tr>
                        <th class="px-4 py-3 border-0">
                          <input 
                            type="checkbox" 
                            class="form-check-input"
                            :checked="selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0"
                            @change="selectedQuestions.length === filteredQuestions.length ? clearSelection() : selectAllFiltered()"
                          />
                        </th>
                        <th class="px-4 py-3 border-0" @click="sortBy('qcode')" style="cursor: pointer;">
                          <div class="d-flex align-items-center gap-2">
                            <span class="fw-semibold">QCode</span>
                            <i :class="getSortIcon('qcode')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0" @click="sortBy('question_statement')" style="cursor: pointer;">
                          <div class="d-flex align-items-center gap-2">
                            <span class="fw-semibold">Question</span>
                            <i :class="getSortIcon('question_statement')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('archive_reason')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Archive Reason</span>
                            <i :class="getSortIcon('archive_reason')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('archived_date')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Archived Date</span>
                            <i :class="getSortIcon('archived_date')"></i>
                          </div>
                        </th>
                        <th class="px-4 py-3 border-0 text-center" @click="sortBy('archived_by')" style="cursor: pointer;">
                          <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fw-semibold">Archived By</span>
                            <i :class="getSortIcon('archived_by')"></i>
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
                        class="question-row"
                        style="transition: all 0.3s ease;"
                        :style="{ 'animation-delay': (index * 0.05) + 's' }"
                      >
                        <td class="px-4 py-3">
                          <input 
                            type="checkbox" 
                            class="form-check-input"
                            :checked="selectedQuestions.includes(q.id)"
                            @change="toggleQuestionSelection(q.id)"
                          />
                        </td>
                        <td class="px-4 py-4">
                          <div class="bg-danger bg-opacity-10 px-3 py-2 rounded-pill d-inline-block">
                            <span class="fw-bold text-danger">Q{{ q.id }}</span>
                          </div>
                        </td>
                        <td class="px-4 py-4">
                          <div class="question-text" style="max-width: 400px;">
                            <p class="mb-1 fw-medium text-dark" style="line-height: 1.4;">
                              {{ q.question_statement.length > 80 ? q.question_statement.substring(0, 80) + '...' : q.question_statement }}
                            </p>
                            <div class="d-flex align-items-center gap-2 mt-2">
                              <span class="badge bg-info bg-opacity-20 text-black px-2 py-1 small">
                                <i :class="getTypeIcon(q.type)" class="me-1"></i>
                                {{ q.type }}
                              </span>
                              <span class="badge bg-secondary bg-opacity-20 text-white px-2 py-1 small">
                                {{ q.module_name }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <span 
                            class="badge px-3 py-2 fs-6"
                            :class="'bg-' + getArchiveReasonColor(q.archive_reason)"
                            style="border-radius: 20px;"
                          >
                            {{ q.archive_reason }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="text-muted small">{{ formatDate(q.archived_date) }}</div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="text-muted small">{{ q.archived_by }}</div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="btn-group" role="group">
                            <button
                              class="btn btn-sm btn-outline-primary"
                              @click="viewQuestion(q.id)"
                              title="View Details"
                            >
                              <i class="bi bi-eye"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-outline-success"
                              @click="currentQuestion = q; showRestoreModal = true"
                              title="Restore Question"
                              :disabled="isProcessing"
                            >
                              <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="currentQuestion = q; showDeleteModal = true"
                              title="Delete Permanently"
                              :disabled="isProcessing"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      <!-- Empty State -->
                      <tr v-if="paginatedQuestions.length === 0">
                        <td colspan="7" class="text-center py-5">
                          <div class="empty-state">
                            <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                              <i class="bi bi-archive fs-1 text-muted"></i>
                            </div>
                            <h5 class="text-muted mb-2">No archived questions found</h5>
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
                      <p class="text-muted mb-0 small">
                        <i class="bi bi-info-circle me-2"></i>
                        Showing {{ (currentPage - 1) * questionsPerPage + 1 }}
                        to {{ Math.min(currentPage * questionsPerPage, filteredQuestions.length) }}
                        of {{ filteredQuestions.length.toLocaleString() }} archived questions
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

        <!-- Restore Question Modal -->
        <div v-if="showRestoreModal" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
              <div class="modal-header bg-success text-white" style="border-radius: 20px 20px 0 0;">
                <h5 class="modal-title">
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Restore Question
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="showRestoreModal = false"></button>
              </div>
              <div class="modal-body p-4">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  This will restore the question back to draft status and make it available for editing.
                </div>
                <div v-if="currentQuestion" class="mb-3">
                  <strong>Question:</strong> {{ currentQuestion.qcode }} - {{ currentQuestion.question_statement.substring(0, 100) }}...
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Restore Comment (Optional)</label>
                  <textarea
                    v-model="restoreComment"
                    class="form-control"
                    rows="3"
                    placeholder="Add a comment about why this question is being restored..."
                    style="border-radius: 12px;"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer p-4 border-0">
                <button class="btn btn-outline-secondary btn-lg" @click="showRestoreModal = false">
                  Cancel
                </button>
                <button 
                  class="btn btn-success btn-lg"
                  @click="restoreQuestion()"
                  :disabled="isProcessing"
                >
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-arrow-clockwise me-2"></i>
                  Restore Question
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
              <div class="modal-header bg-danger text-white" style="border-radius: 20px 20px 0 0;">
                <h5 class="modal-title">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  Confirm Permanent Deletion
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
              </div>
              <div class="modal-body p-4">
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This action cannot be undone. The question will be permanently deleted from the system.
                </div>
                <div v-if="currentQuestion">
                  <strong>Question to delete:</strong> {{ currentQuestion.qcode }} - {{ currentQuestion.question_statement.substring(0, 100) }}...
                </div>
              </div>
              <div class="modal-footer p-4 border-0">
                <button class="btn btn-outline-secondary btn-lg" @click="showDeleteModal = false">
                  Cancel
                </button>
                <button 
                  class="btn btn-danger btn-lg"
                  @click="deleteQuestion()"
                  :disabled="isProcessing"
                >
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-trash me-2"></i>
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions Modal -->
        <div v-if="showBulkActionsModal" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
          <div class="modal-dialog modal-lg">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
              <div class="modal-header bg-primary text-white" style="border-radius: 20px 20px 0 0;">
                <h5 class="modal-title">
                  <i class="bi bi-check2-all me-2"></i>
                  Bulk Actions ({{ selectedQuestionsCount }} questions)
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="showBulkActionsModal = false"></button>
              </div>
              <div class="modal-body p-4">
                <div class="mb-4">
                  <label class="form-label fw-semibold">Comment (Optional)</label>
                  <textarea
                    v-model="restoreComment"
                    class="form-control"
                    rows="3"
                    placeholder="Add a comment for all selected questions..."
                    style="border-radius: 12px;"
                  ></textarea>
                </div>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="d-grid">
                      <button 
                        class="btn btn-success btn-lg"
                        @click="bulkRestore()"
                        :disabled="isProcessing"
                      >
                        <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-arrow-clockwise me-2"></i>
                        Restore All
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-grid">
                      <button 
                        class="btn btn-danger btn-lg"
                        @click="bulkDelete()"
                        :disabled="isProcessing"
                      >
                        <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-trash me-2"></i>
                        Delete All
                      </button>
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
