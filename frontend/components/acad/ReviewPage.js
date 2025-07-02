
import {
  fetchAllQuestions,
  updateQuestionStatus,
} from "../../services/questionService.js";

export default {
  name: "ReviewPage",
  data() {
    return {
      questions: [],
      filteredQuestions: [],
      selectedQuestions: [],
      currentQuestion: null,
      currentIndex: 0,
      searchQuery: "",
      selectedModule: "",
      selectedType: "",
      selectedAge: "",
      selectedStatus: "Pending",

      questionTypes: ["MCQ", "MSQ", "True/False", "Matching"],
      moduleOptions: [
        "Time Management",
        "Stress Control",
        "Communication",
        "Leadership",
      ],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: [
        {
          value: "Pending",
          label: "Pending Review",
          icon: "bi-clock",
          color: "warning",
        },
        {
          value: "Approved",
          label: "Approved",
          icon: "bi-check-circle",
          color: "success",
        },
        {
          value: "Rejected",
          label: "Rejected",
          icon: "bi-x-circle",
          color: "danger",
        }
      ],

      showBulkActions: false,
      showRejectModal: false,
      showApproveModal: false,
      showImageModal: false,

      reviewComment: "",
      bulkAction: "",
      bulkComment: "",

      isLoading: true,
      isSaving: false,

      // Statistics
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },

      // View preferences
      viewMode: "review", // "review", "list", "grid"
      autoAdvance: true,
      showAnswers: true,

      activeDropdown: null,
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
    currentStatusFilter() {
      return (
        this.statusOptions.find((s) => s.value === this.selectedStatus) ||
        this.statusOptions[0]
      );
    },

    hasFilters() {
      return (
        this.searchQuery ||
        this.selectedModule ||
        this.selectedType ||
        this.selectedAge
      );
    },

    progressPercentage() {
      if (this.filteredQuestions.length === 0) return 0;
      return Math.round(
        (this.currentIndex / this.filteredQuestions.length) * 100
      );
    },

    canNavigateNext() {
      return this.currentIndex < this.filteredQuestions.length - 1;
    },

    canNavigatePrevious() {
      return this.currentIndex > 0;
    },

    selectedQuestionsCount() {
      return this.selectedQuestions.length;
    },
  },

  watch: {
    selectedStatus() {
      this.applyFilters();
    },

    searchQuery() {
      this.applyFilters();
    },

    selectedModule() {
      this.applyFilters();
    },

    selectedType() {
      this.applyFilters();
    },

    selectedAge() {
      this.applyFilters();
    },
  },

  async mounted() {
    await this.loadQuestions();
  },

  methods: {
    async loadQuestions() {
      try {
        this.isLoading = true;
        const allQuestions = await fetchAllQuestions();

        // Transform the data to include review-specific fields
        this.questions = allQuestions.map((q) => ({
          ...q,
          status: q.status || "Pending",
          review_date: q.review_date || null,
          reviewer: q.reviewer || null,
          review_comment: q.review_comment || "",
        }));

        this.calculateStats();
        this.applyFilters();
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        this.isLoading = false;
      }
    },

    calculateStats() {
      this.stats = this.questions.reduce(
        (acc, q) => {
          acc.total++;
          acc[q.status] = (acc[q.status] || 0) + 1;
          return acc;
        },
        {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      );
    },

    applyFilters() {
      this.filteredQuestions = this.questions.filter((q) => {
        const matchesStatus =
          this.selectedStatus === "all" || q.status === this.selectedStatus;
        const matchesSearch =
          !this.searchQuery ||
          q.qcode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          q.question_text
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
        const matchesModule =
          !this.selectedModule || q.module_name === this.selectedModule;
        const matchesType =
          !this.selectedType || q.question_type === this.selectedType;
        const matchesAge =
          !this.selectedAge ||
          (q.age_groups && q.age_groups.includes(this.selectedAge));

        return (
          matchesStatus &&
          matchesSearch &&
          matchesModule &&
          matchesType &&
          matchesAge
        );
      });

      // Reset current question if filters changed
      if (this.filteredQuestions.length > 0) {
        this.currentIndex = Math.min(
          this.currentIndex,
          this.filteredQuestions.length - 1
        );
        this.currentQuestion = this.filteredQuestions[this.currentIndex];
      } else {
        this.currentQuestion = null;
        this.currentIndex = 0;
      }
    },

    navigateToQuestion(index) {
      if (index >= 0 && index < this.filteredQuestions.length) {
        this.currentIndex = index;
        this.currentQuestion = this.filteredQuestions[index];
      }
    },

    navigateNext() {
      if (this.canNavigateNext) {
        this.navigateToQuestion(this.currentIndex + 1);
      }
    },

    navigatePrevious() {
      if (this.canNavigatePrevious) {
        this.navigateToQuestion(this.currentIndex - 1);
      }
    },

    async approveQuestion(question = null) {
      const questionToApprove = question || this.currentQuestion;
      if (!questionToApprove) return;

      try {
        this.isSaving = true;
        await updateQuestionStatus(questionToApprove.qcode, {
          status: "Approved",
          review_comment: this.reviewComment,
          reviewer: "Current User", // Replace with actual user
          review_date: new Date().toISOString(),
        });

        // Update local data
        questionToApprove.status = "Approved";
        questionToApprove.review_comment = this.reviewComment;
        questionToApprove.review_date = new Date().toISOString();

        this.reviewComment = "";
        this.calculateStats();

        if (this.autoAdvance && this.viewMode === "review") {
          setTimeout(() => this.navigateNext(), 700);
        }
      } catch (error) {
        console.error("Failed to approve question:", error);
        alert("Failed to approve question. Please try again.");
      } finally {
        this.isSaving = this.showApproveModal = false;
      }
    },

    async rejectQuestion(question = null) {
      const questionToReject = question || this.currentQuestion;
      if (!questionToReject || !this.reviewComment.trim()) {
        alert("Please provide a reason for rejection.");
        return;
      }

      try {
        this.isSaving = true;
        await updateQuestionStatus(questionToReject.qcode, {
          status: "Rejected",
          review_comment: this.reviewComment,
          reviewer: "Current User", // Replace with actual user
          review_date: new Date().toISOString(),
        });

        // Update local data
        questionToReject.status = "Rejected";
        questionToReject.review_comment = this.reviewComment;
        questionToReject.review_date = new Date().toISOString();

        this.reviewComment = "";
        this.calculateStats();

        if (this.autoAdvance && this.viewMode === "review") {
          setTimeout(() => this.navigateNext(), 700);
        }
      } catch (error) {
        console.error("Failed to reject question:", error);
        alert("Failed to reject question. Please try again.");
      } finally {
        this.isSaving = false;
        this.showRejectModal = false;
      }
    },

    async bulkApprove() {
      if (this.selectedQuestions.length === 0) return;

      try {
        this.isSaving = true;
        const promises = this.selectedQuestions.map((qcode) =>
          updateQuestionStatus(qcode, {
            status: "Approved",
            review_comment: this.bulkComment,
            reviewer: "Current User",
            review_date: new Date().toISOString(),
          })
        );

        await Promise.all(promises);

        // Update local data
        this.selectedQuestions.forEach((qcode) => {
          const question = this.questions.find((q) => q.qcode === qcode);
          if (question) {
            question.status = "Approved";
            question.review_comment = this.bulkComment;
            question.review_date = new Date().toISOString();
          }
        });

        this.selectedQuestions = [];
        this.bulkComment = "";
        this.calculateStats();
        this.applyFilters();
      } catch (error) {
        console.error("Failed to bulk approve:", error);
        alert("Some questions failed to approve. Please try again.");
      } finally {
        this.isSaving = false;
        this.showBulkActions = false;
      }
    },

    async bulkReject() {
      if (this.selectedQuestions.length === 0 || !this.bulkComment.trim()) {
        alert("Please provide a reason for rejection.");
        return;
      }

      try {
        this.isSaving = true;
        const promises = this.selectedQuestions.map((qcode) =>
          updateQuestionStatus(qcode, {
            status: "Rejected",
            review_comment: this.bulkComment,
            reviewer: "Current User",
            review_date: new Date().toISOString(),
          })
        );

        await Promise.all(promises);

        // Update local data
        this.selectedQuestions.forEach((qcode) => {
          const question = this.questions.find((q) => q.qcode === qcode);
          if (question) {
            question.status = "Rejected";
            question.review_comment = this.bulkComment;
            question.review_date = new Date().toISOString();
          }
        });

        this.selectedQuestions = [];
        this.bulkComment = "";
        this.calculateStats();
        this.applyFilters();
      } catch (error) {
        console.error("Failed to bulk reject:", error);
        alert("Some questions failed to reject. Please try again.");
      } finally {
        this.isSaving = false;
        this.showBulkActions = false;
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
      this.selectedQuestions = this.filteredQuestions.map((q) => q.qcode);
    },

    clearSelection() {
      this.selectedQuestions = [];
    },

    clearFilters() {
      this.searchQuery = "";
      this.selectedModule = "";
      this.selectedType = "";
      this.selectedAge = "";
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

    getStatusBadgeClass(status) {
      switch (status) {
        case "Approved":
          return "bg-success";
        case "Rejected":
          return "bg-danger";
        case "Pending":
          return "bg-warning text-dark";

        default:
          return "bg-light text-dark";
      }
    },

    toggleDropdown(dropdownName) {
      this.activeDropdown =
        this.activeDropdown === dropdownName ? null : dropdownName;
    },

    closeDropdown() {
      this.activeDropdown = null;
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
                        <i class="bi bi-clipboard-check text-primary fs-2"></i>
                      </div>
                      <div>
                        <h1 class="mb-1 fw-bold text-dark">Question Review</h1>
                        <p class="text-muted mb-0">
                          <i class="bi bi-list-task me-2"></i>
                          Review and approve questions for publication
                          <span v-if="filteredQuestions.length > 0" class="ms-3">
                            <i class="bi bi-arrow-right me-1"></i>
                            Question {{ currentIndex + 1 }} of {{ filteredQuestions.length }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="d-flex gap-2 justify-content-lg-end">
                      <div class="btn-group" role="group">
                        <button 
                          type="button" 
                          class="btn btn-outline-primary"
                          :class="{ 'active': viewMode === 'review' }"
                          @click="viewMode = 'review'"
                        >
                          <i class="bi bi-eye-fill me-1"></i>Review
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-outline-primary"
                          :class="{ 'active': viewMode === 'list' }"
                          @click="viewMode = 'list'"
                        >
                          <i class="bi bi-list-ul me-1"></i>List
                        </button>
                      </div>
                      <button 
                        v-if="selectedQuestionsCount > 0"
                        class="btn btn-primary"
                        @click="showBulkActions = true"
                      >
                        <i class="bi bi-check2-all me-2"></i>
                        Bulk Actions ({{ selectedQuestionsCount }})
                      </button>
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
                  <div class="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-clock text-warning fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-warning">{{ stats.pending }}</h6>
                    <small class="text-muted">Pending Review</small>
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
                    <i class="bi bi-check-circle text-success fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-success">{{ stats.approved }}</h6>
                    <small class="text-muted">Approved</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-x-circle text-danger fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-danger">{{ stats.rejected }}</h6>
                    <small class="text-muted">Rejected</small>
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
                    <i class="bi bi-collection text-info fs-5"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 text-info">{{ stats.total }}</h6>
                    <small class="text-muted">Total Questions</small>
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
              <div class="card-body p-4">
                <div class="row g-3">
                  <!-- Status Filter -->
                  <div class="col-lg-2">
                    <label class="form-label fw-semibold">Status</label>
                    <select 
                      v-model="selectedStatus" 
                      class="form-select"
                      style="border-radius: 12px;"
                    >
                      <option value="Pending">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="all">All Status</option>
                    </select>
                  </div>
                  
                  <!-- Search -->
                  <div class="col-lg-3">
                    <label class="form-label fw-semibold">Search</label>
                    <div class="position-relative">
                      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="form-control ps-5"
                        placeholder="Search questions..."
                        style="border-radius: 12px;"
                      />
                    </div>
                  </div>
                  
                  <!-- Module Filter -->
                  <div class="col-lg-2">
                    <label class="form-label fw-semibold">Module</label>
                    <select 
                      v-model="selectedModule" 
                      class="form-select"
                      style="border-radius: 12px;"
                    >
                      <option value="">All Modules</option>
                      <option v-for="module in moduleOptions" :key="module" :value="module">{{ module }}</option>
                    </select>
                  </div>
                  
                  <!-- Type Filter -->
                  <div class="col-lg-2">
                    <label class="form-label fw-semibold">Type</label>
                    <select 
                      v-model="selectedType" 
                      class="form-select"
                      style="border-radius: 12px;"
                    >
                      <option value="">All Types</option>
                      <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                  </div>
                  
                  <!-- Age Filter -->
                  <div class="col-lg-2">
                    <label class="form-label fw-semibold">Age</label>
                    <select 
                      v-model="selectedAge" 
                      class="form-select"
                      style="border-radius: 12px;"
                    >
                      <option value="">All Ages</option>
                      <option v-for="age in ageGroups" :key="age" :value="age">{{ age }}</option>
                    </select>
                  </div>
                  
                  <!-- Clear Filters -->
                  <div class="col-lg-1 d-flex align-items-end">
                    <button 
                      v-if="hasFilters"
                      class="btn btn-outline-danger w-100"
                      @click="clearFilters"
                      style="border-radius: 12px;"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
            <div class="card-body p-5">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
              <p class="mt-3 text-muted">Loading questions for review...</p>
            </div>
          </div>
        </div>

        <!-- No Questions State -->
        <div v-else-if="filteredQuestions.length === 0" class="text-center py-5">
          <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
            <div class="card-body p-5">
              <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                <i class="bi bi-search fs-1 text-muted"></i>
              </div>
              <h5 class="text-muted mb-2">No questions found</h5>
              <p class="text-muted mb-0">Try adjusting your filters or check back later</p>
            </div>
          </div>
        </div>

        <!-- Review Mode -->
        <div v-else-if="viewMode === 'review'" class="row">
          <div class="col-lg-8">
            <!-- Question Review Card -->
            <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-header bg-transparent border-0 p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-1 fw-bold">{{ currentQuestion.qcode }}</h5>
                    <div class="d-flex align-items-center gap-3">
                      <span class="badge" :class="getStatusBadgeClass(currentQuestion.status)">
                        {{ currentQuestion.status }}
                      </span>
                      <span class="badge bg-info bg-opacity-20 text-black">
                        <i :class="getTypeIcon(currentQuestion.question_type)" class="me-1"></i>
                        {{ currentQuestion.question_type }}
                      </span>
                      <span class="badge bg-secondary bg-opacity-20 text-white">
                        {{ currentQuestion.module_name }}
                      </span>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="progress mb-2" style="width: 200px; height: 8px;">
                      <div class="progress-bar bg-primary" :style="{ width: progressPercentage + '%' }"></div>
                    </div>
                    <small class="text-muted">{{ currentIndex + 1 }} / {{ filteredQuestions.length }}</small>
                  </div>
                </div>
              </div>
              
              <div class="card-body p-4">
                <!-- Question Content -->
                <div class="mb-4">
                  <h6 class="text-muted mb-3">Question</h6>
                  <div class="bg-light p-4 rounded-3">
                    <p class="mb-0 fs-6">{{ currentQuestion.question_text }}</p>
                  </div>
                </div>

                <!-- Media -->
                <div v-if="currentQuestion.image_url || currentQuestion.audio_url" class="mb-4">
                  <h6 class="text-muted mb-3">Media</h6>
                  <div class="row g-3">
                    <div v-if="currentQuestion.image_url" class="col-md-6">
                      <img 
                        :src="currentQuestion.image_url" 
                        class="img-fluid rounded-3 cursor-pointer"
                        @click="showImageModal = true"
                        style="max-height: 200px; object-fit: cover;"
                      />
                    </div>
                    <div v-if="currentQuestion.audio_url" class="col-md-6">
                      <audio :src="currentQuestion.audio_url" controls class="w-100"></audio>
                    </div>
                  </div>
                </div>

                <!-- Answer Options -->
                <div v-if="showAnswers" class="mb-4">
                  <h6 class="text-muted mb-3">Answer Options</h6>
                  
                  <!-- MCQ/MSQ Options -->
                  <div v-if="currentQuestion.question_type === 'MCQ' || currentQuestion.question_type === 'MSQ'">
                    <div class="row g-3">
                      <div v-for="(option, index) in currentQuestion.options" :key="index" class="col-md-6">
                        <div class="option-card p-3 rounded-3" :class="{ 'border-success bg-success bg-opacity-10': option.correct }">
                          <div class="d-flex align-items-center">
                            <input 
                              type="checkbox" 
                              :checked="option.correct"
                              disabled
                              class="form-check-input me-3"
                            />
                            <div class="flex-grow-1">
                              <strong>{{ String.fromCharCode(65 + index) }}.</strong> {{ option.text }}
                            </div>
                            <i v-if="option.correct" class="bi bi-check-circle text-success"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- True/False Options -->
                  <div v-else-if="currentQuestion.question_type === 'True/False'">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="option-card p-3 rounded-3" :class="{ 'border-success bg-success bg-opacity-10': currentQuestion.options[0]?.correct }">
                          <div class="d-flex align-items-center">
                            <input 
                              type="radio" 
                              :checked="currentQuestion.options[0]?.correct"
                              disabled
                              class="form-check-input me-3"
                            />
                            <span class="fw-bold">True</span>
                            <i v-if="currentQuestion.options[0]?.correct" class="bi bi-check-circle text-success ms-auto"></i>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="option-card p-3 rounded-3" :class="{ 'border-success bg-success bg-opacity-10': currentQuestion.options[1]?.correct }">
                          <div class="d-flex align-items-center">
                            <input 
                              type="radio" 
                              :checked="currentQuestion.options[1]?.correct"
                              disabled
                              class="form-check-input me-3"
                            />
                            <span class="fw-bold">False</span>
                            <i v-if="currentQuestion.options[1]?.correct" class="bi bi-check-circle text-success ms-auto"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Matching Pairs -->
                  <div v-else-if="currentQuestion.question_type === 'Matching'">
                    <div class="matching-pairs">
                      <div v-for="(pair, index) in currentQuestion.match_pairs" :key="index" class="matching-pair mb-3">
                        <div class="row g-3 align-items-center">
                          <div class="col-5">
                            <div class="p-3 bg-light rounded-3">{{ pair.left }}</div>
                          </div>
                          <div class="col-2 text-center">
                            <i class="bi bi-arrow-left-right text-primary fs-4"></i>
                          </div>
                          <div class="col-5">
                            <div class="p-3 bg-light rounded-3">{{ pair.right }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Previous Review Comment -->
                <div v-if="currentQuestion.review_comment" class="mb-4">
                  <h6 class="text-muted mb-3">Previous Review Comment</h6>
                  <div class="alert alert-info">
                    {{ currentQuestion.review_comment }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <!-- Navigation -->
            <div class="card border-0 shadow-lg mb-4" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-4">
                <h6 class="mb-3 fw-bold">Navigation</h6>
                <div class="d-flex gap-2 mb-3">
                  <button 
                    class="btn btn-outline-secondary btn-lg flex-fill"
                    @click="navigatePrevious"
                    :disabled="!canNavigatePrevious"
                  >
                    <i class="bi bi-chevron-left"></i> Previous
                  </button>
                  <button 
                    class="btn btn-outline-secondary btn-lg flex-fill"
                    @click="navigateNext"
                    :disabled="!canNavigateNext"
                  >
                    Next <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    v-model="autoAdvance"
                    id="autoAdvance"
                  />
                  <label class="form-check-label" for="autoAdvance">
                    Auto-advance after review
                  </label>
                </div>
              </div>
            </div>

            <!-- Review Actions -->
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-4">
                <h6 class="mb-3 fw-bold">Review Actions</h6>
                
                <!-- Comment -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Review Comment</label>
                  <textarea
                    v-model="reviewComment"
                    class="form-control"
                    rows="3"
                    placeholder="Add your review comment (optional for approval, required for rejection)"
                    style="border-radius: 10px;"
                  ></textarea>
                </div>

                <!-- Action Buttons -->
                <div class="d-grid gap-2">
                  <button 
                    class="btn btn-success btn-lg"
                    @click="approveQuestion()"
                    :disabled="isSaving"
                  >
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-check-circle me-2"></i>
                    Approve Question
                  </button>
                  <button 
                    class="btn btn-danger btn-lg"
                    @click="showRejectModal = true"
                    :disabled="isSaving"
                  >
                    <i class="bi bi-x-circle me-2"></i>
                    Reject Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List Mode -->
        <div v-else-if="viewMode === 'list'" class="row">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-header bg-transparent border-0 p-4">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0 fw-bold">Questions List</h5>
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
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
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
                        <th class="px-4 py-3 border-0">Question</th>
                        <th class="px-4 py-3 border-0 text-center">Type</th>
                        <th class="px-4 py-3 border-0 text-center">Module</th>
                        <th class="px-4 py-3 border-0 text-center">Status</th>
                        <th class="px-4 py-3 border-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(question, index) in filteredQuestions" :key="question.qcode">
                        <td class="px-4 py-3">
                          <input 
                            type="checkbox" 
                            class="form-check-input"
                            :checked="selectedQuestions.includes(question.qcode)"
                            @change="toggleQuestionSelection(question.qcode)"
                          />
                        </td>
                        <td class="px-4 py-3">
                          <div class="d-flex align-items-start gap-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">{{ question.qcode }}</span>
                            <div class="flex-grow-1">
                              <div class="fw-medium mb-1">{{ question.question_text.substring(0, 100) }}{{ question.question_text.length > 100 ? '...' : '' }}</div>
                              <div v-if="question.review_comment" class="text-mute

d small">
                                <i class="bi bi-chat-left-text me-1"></i>
                                {{ question.review_comment.substring(0, 80) }}{{ question.review_comment.length > 80 ? '...' : '' }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <span class="badge bg-info bg-opacity-20 text-black">
                            <i :class="getTypeIcon(question.question_type)" class="me-1"></i>
                            {{ question.question_type }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <span class="badge bg-secondary bg-opacity-20 text-white">
                            {{ question.module_name }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <span class="badge" :class="getStatusBadgeClass(question.status)">
                            {{ question.status }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <div class="btn-group">
                            <button 
                              class="btn btn-sm btn-outline-success"
                              @click="approveQuestion(question)"
                              :disabled="isSaving"
                              title="Approve"
                            >
                              <i class="bi bi-check"></i>
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-danger"
                              @click="currentQuestion = question; showRejectModal = true"
                              :disabled="isSaving"
                              title="Reject"
                            >
                              <i class="bi bi-x"></i>
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-primary"
                              @click="currentQuestion = question; currentIndex = index; viewMode = 'review'"
                              title="Review"
                            >
                              <i class="bi bi-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rejection Modal -->
        <div v-if="showRejectModal" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
              <div class="modal-header bg-danger text-white" style="border-radius: 20px 20px 0 0;">
                <h5 class="modal-title">
                  <i class="bi bi-x-circle me-2"></i>
                  Reject Question
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="showRejectModal = false"></button>
              </div>
              <div class="modal-body p-4">
                <div class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  You are about to reject this question. Please provide a reason.
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Rejection Reason <span class="text-danger">*</span></label>
                  <textarea
                    v-model="reviewComment"
                    class="form-control"
                    rows="4"
                    placeholder="Please explain why this question is being rejected..."
                    style="border-radius: 12px;"
                    required
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer p-4 border-0">
                <button class="btn btn-outline-secondary btn-lg" @click="showRejectModal = false">
                  Cancel
                </button>
                <button 
                  class="btn btn-danger btn-lg"
                  @click="rejectQuestion()"
                  :disabled="!reviewComment.trim() || isSaving"
                >
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-x-circle me-2"></i>
                  Reject Question
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions Modal -->
        <div v-if="showBulkActions" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
          <div class="modal-dialog modal-lg">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
              <div class="modal-header bg-primary text-white" style="border-radius: 20px 20px 0 0;">
                <h5 class="modal-title">
                  <i class="bi bi-check2-all me-2"></i>
                  Bulk Actions ({{ selectedQuestionsCount }} questions)
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="showBulkActions = false"></button>
              </div>
              <div class="modal-body p-4">
                <div class="mb-4">
                  <label class="form-label fw-semibold">Comment (Optional for approval, required for rejection)</label>
                  <textarea
                    v-model="bulkComment"
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
                        @click="bulkApprove()"
                        :disabled="isSaving"
                      >
                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-check-circle me-2"></i>
                        Approve All
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-grid">
                      <button 
                        class="btn btn-danger btn-lg"
                        @click="bulkReject()"
                        :disabled="!bulkComment.trim() || isSaving"
                      >
                        <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-x-circle me-2"></i>
                        Reject All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showImageModal" class="modal d-block" style="background: rgba(0,0,0,0.8); z-index: 1060;">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0">
              <div class="modal-header border-0">
                <h6 class="modal-title">Question Image</h6>
                <button type="button" class="btn-close" @click="showImageModal = false"></button>
              </div>
              <div class="modal-body p-0">
                <img 
                  v-if="currentQuestion && currentQuestion.image_url"
                  :src="currentQuestion.image_url" 
                  class="w-100" 
                  style="max-height: 70vh; object-fit: contain;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
