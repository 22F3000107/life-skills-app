import { fetchModules}  from "../../services/moduleService.js";
import {fetchAllQuestions} from "../../services/questionService.js";
import { fetchConcepts } from "../../services/conceptService.js";

export default {
  name: "AcadHomePage",
  data() {
    return {
      searchQuery: "",
      currentPage: 1,
      rowsPerPage: 9,
      modules: [],
      questions: [],
      concepts: [],
      sortKey: "name",
      sortOrder: "asc",
      isLoading: false,
      viewMode: "grid", // grid or list
      selectedFilter: "all",
    };
  },
  computed: {
    // Module Statistics - simplified
    moduleStats() {
      const totalModules = this.modules.length;
      const totalConcepts = this.concepts.length;

      return {
        totalModules,
        totalConcepts,
      };
    },

    // Question Statistics (assuming you have question status data)
    questionStats() {
      // You'll need to modify this based on your actual question data structure
      const totalQuestions = this.questions.length;
      const approvedQuestions = this.questions.filter(
        (q) => q.is_approved === true
      ).length;

      const rejectedQuestions = this.questions.filter(
        (q) => q.is_approved === false
      ).length;

      const pendingQuestions = this.questions.filter(
        (q) => q.is_approved === null
      ).length;

      return {
        totalQuestions,
        approvedQuestions,
        rejectedQuestions,
        pendingQuestions,
        approvedPercentage:
          totalQuestions > 0
            ? ((approvedQuestions / totalQuestions) * 100).toFixed(1)
            : 0,
        rejectedPercentage:
          totalQuestions > 0
            ? ((rejectedQuestions / totalQuestions) * 100).toFixed(1)
            : 0,
        pendingPercentage:
          totalQuestions > 0
            ? ((pendingQuestions / totalQuestions) * 100).toFixed(1)
            : 0,
      };
    },

    // Concept Statistics - updated as requested
    conceptStats() {
      const totalConcepts = this.concepts.length;
      const totalQuestions = this.concepts.reduce(
        (acc, c) => acc + (c.question_count || 0),
        0
      );

      // Sample data for live/developing concepts - replace with actual API data
      const liveConcepts = this.concepts.filter((c) => c.live === true).length;
      const developingConcepts = totalConcepts - liveConcepts; // remaining developing

      return {
        totalConcepts,
        totalQuestions, // total questions in concepts
        liveConcepts,
        developingConcepts,
        livePercentage:
          totalConcepts > 0
            ? ((liveConcepts / totalConcepts) * 100).toFixed(1)
            : 0,
        developingPercentage:
          totalConcepts > 0
            ? ((developingConcepts / totalConcepts) * 100).toFixed(1)
            : 0,
      };
    },

    filteredModules() {
      let filtered = this.modules.filter((mod) =>
        mod.id.toString().includes(this.searchQuery.toLowerCase())
      );
      if (this.selectedFilter === "active") {
        filtered = filtered.filter((mod) => mod.questions > 0);
      } else if (this.selectedFilter === "empty") {
        filtered = filtered.filter((mod) => mod.questions === 0);
      }

      return this.sortedModules(filtered);
    },
    paginatedModules() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      return this.filteredModules.slice(start, start + this.rowsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredModules.length / this.rowsPerPage);
    },
    showingRangeText() {
      const start = (this.currentPage - 1) * this.rowsPerPage + 1;
      const end = Math.min(
        start + this.rowsPerPage - 1,
        this.filteredModules.length
      );
      return `Showing ${start} to ${end} of ${this.filteredModules.length} modules`;
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
    goToModule(id) {
      this.$router.push(`/acad/module/${id}`);
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
      this.currentPage = 1;
    },
    sortedModules(modules) {
      const sorted = [...modules];
      sorted.sort((a, b) => {
        const aVal = a[this.sortKey];
        const bVal = b[this.sortKey];
        if (typeof aVal === "string") {
          return this.sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return this.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
      });
      return sorted;
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getModuleIcon(module) {
      const icons = [
        "bi-mortarboard",
        "bi-book",
        "bi-journal-code",
        "bi-calculator",
        "bi-graph-up",
        "bi-lightbulb",
        "bi-puzzle",
        "bi-compass",
      ];
      return icons[Math.abs(module.id.toString().charCodeAt(0) % icons.length)];
    },
    getProgressColor(questions) {
      if (questions >= 100) return "success";
      if (questions >= 50) return "warning";
      return "danger";
    },
  },
  async mounted() {
    try {
      this.isLoading = true;
      this.modules = await fetchModules();
      this.questions = await fetchAllQuestions();
      this.concepts = await fetchConcepts();
    } catch (err) {
      console.error("Failed to load academic modules:", err.message);
    } finally {
      this.isLoading = false;
    }
  },
  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-white bg-opacity-10 p-3 rounded-circle">
                  <i class="bi bi-mortarboard text-white fs-2"></i>
                </div>
                <div>
                  <h1 class="text-white mb-1 fw-bold">Academic Dashboard</h1>
                  <p class="text-white-50 mb-0">Manage your educational content and track progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row g-4 mb-4">
          <!-- Module Statistics Card -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-lg h-100" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-header bg-transparent border-0 pb-0">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i class="bi bi-collection text-primary fs-4"></i>
                  </div>
                  <div>
                    <h5 class="mb-0 fw-bold text-dark">Modules Overview</h5>
                    <small class="text-muted">Total modules and concepts</small>
                  </div>
                </div>
              </div>
              <div class="card-body pt-3">
                <!-- Total Modules -->
                <div class="row text-center">
                  <div class="col-6">
                    <div class="bg-light rounded p-3 mb-3">
                      <div class="fs-2 fw-bold text-primary mb-1">{{ moduleStats.totalModules }}</div>
                      <div class="text-muted small">Total Modules</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-light rounded p-3 mb-3">
                      <div class="fs-2 fw-bold text-info mb-1">{{ moduleStats.totalConcepts }}</div>
                      <div class="text-muted small">Total Concepts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Questions Statistics Card -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-lg h-100" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-header bg-transparent border-0 pb-0">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-success bg-opacity-10 p-3 rounded-circle">
                    <i class="bi bi-patch-question text-success fs-4"></i>
                  </div>
                  <div>
                    <h5 class="mb-0 fw-bold text-dark">Questions Status</h5>
                    <small class="text-muted">Question approval status</small>
                  </div>
                </div>
              </div>
              <div class="card-body pt-2">
                <!-- Total Questions -->
         <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted">Total Questions</span>
              <span class="fs-4 fw-bold text-primary">{{ questionStats.totalQuestions }}</span>
            </div>
            <div class="progress" style="height: 6px;">
              <div
                class="progress-bar"
                :class="{ 'bg-primary': questionStats.totalQuestions > 0 }"
                :style="{ width: questionStats.totalQuestions > 0 ? '100%' : '0%' }"
              ></div>
            </div>
          </div>

                <!-- Approved Questions -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Approved</span>
                    <span class="fs-5 fw-semibold text-success">{{ questionStats.approvedQuestions }} ({{ questionStats.approvedPercentage }}%)</span>
                  </div>
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar bg-success" :style="{width: questionStats.approvedPercentage + '%'}"></div>
                  </div>
                </div>

                <!-- Rejected Questions -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Rejected</span>
                    <span class="fs-5 fw-semibold text-danger">{{ questionStats.rejectedQuestions }} ({{ questionStats.rejectedPercentage }}%)</span>
                  </div>
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar bg-danger" :style="{width: questionStats.rejectedPercentage + '%'}"></div>
                  </div>
                </div>

                <!-- Pending Questions -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Pending Review</span>
                    <span class="fs-5 fw-semibold text-warning">{{ questionStats.pendingQuestions }} ({{ questionStats.pendingPercentage }}%)</span>
                  </div>
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar bg-warning" :style="{width: questionStats.pendingPercentage + '%'}"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Concepts Statistics Card -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-lg h-100" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-header bg-transparent border-0 pb-0">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-info bg-opacity-10 p-3 rounded-circle">
                    <i class="bi bi-diagram-3 text-info fs-4"></i>
                  </div>
                  <div>
                    <h5 class="mb-0 fw-bold text-dark">Concepts Overview</h5>
                    <small class="text-muted">Concept status and questions</small>
                  </div>
                </div>
              </div>
              <div class="card-body pt-2">
                <!-- Total Concepts and Questions -->
                <div class="row text-center mb-3">
                  <div class="col-6">
                    <div class="bg-light rounded p-2">
                      <div class="fs-4 fw-bold text-primary">{{ conceptStats.totalConcepts }}</div>
                      <small class="text-muted">Total Concepts</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-light rounded p-2">
                      <div class="fs-4 fw-bold text-secondary">{{ conceptStats.totalQuestions }}</div>
                      <small class="text-muted">Total Questions</small>
                    </div>
                  </div>
                </div>

                <!-- Live Concepts -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Live Concepts</span>
                    <span class="fs-5 fw-semibold text-success">{{ conceptStats.liveConcepts }} ({{ conceptStats.livePercentage }}%)</span>
                  </div>
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar bg-success" :style="{width: conceptStats.livePercentage + '%'}"></div>
                  </div>
                </div>

                <!-- Developing Concepts -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Developing</span>
                    <span class="fs-5 fw-semibold text-warning">{{ conceptStats.developingConcepts }} ({{ conceptStats.developingPercentage }}%)</span>
                  </div>
                  <div class="progress" style="height: 4px;">
                    <div class="progress-bar bg-warning" :style="{width: conceptStats.developingPercentage + '%'}"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modules Section -->
        <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
          <!-- Card Header -->
          <div class="card-header bg-transparent border-0 p-2">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <h6 class="mb-1 fw-bold text-dark">
                  <i class="bi bi-kanban me-2 text-primary"></i>
                  Module Overview
                </h6>
                <p class="text-muted mb-0 small">Manage and monitor your educational modules</p>
              </div>
              <div class="col-lg-6">
                <div class="d-flex gap-2 justify-content-lg-end mt-2 mt-lg-0 align-items-center">
                  
                  <!-- Search Input -->
                  <div style="max-width: 360px;">
                    <div class="position-relative">
                      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="form-control form-control-sm ps-4"
                        placeholder="Search modules..."
                        style="border-radius: 10px; border: 1px solid #dee2e6;"
                      />
                    </div>
                  </div>
                                    <!-- View Toggle -->
                  <div class="btn-group btn-group-sm" role="group">
                    <button 
                      type="button" 
                      class="btn btn-outline-primary"
                      :class="{ 'active btn-primary': viewMode === 'grid' }"
                      @click="viewMode = 'grid'"
                      style="border-radius: 8px 0 0 8px;"
                    >
                      <i class="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-outline-primary"
                      :class="{ 'active btn-primary': viewMode === 'list' }"
                      @click="viewMode = 'list'"
                      style="border-radius: 0 8px 8px 0;"
                    >
                      <i class="bi bi-list-ul"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body p-0">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center p-5">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
              <p class="mt-3 text-muted">Loading modules...</p>
            </div>
            <!-- Grid View -->
            <div v-else-if="viewMode === 'grid'" class="p-4">
  <div class="row g-3">
    <div v-for="(mod, index) in paginatedModules" :key="mod.id" class="col-xl-4 col-lg-6">
      <div 
        class="card border-0 shadow-sm module-card"
        style="border-radius: 12px; cursor: pointer; transition: all 0.3s ease;"
        :style="{  'animation-delay': (index * 0.1) + 's' }"
        @click="goToModule(mod.id)"
      >
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary bg-opacity-10 p-2 rounded-circle">
                <i :class="'bi ' + getModuleIcon(mod) + 'text-primary'"></i>
              </div>
              <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill small fw-medium">
                {{ mod.id }}
              </span>
            </div>
            <button class="btn btn-sm btn-primary" style="border-radius: 8px;">
              <i class="bi bi-eye"></i>
            </button>
          </div>
          
          <h6 class="card-title mb-3 fw-bold text-dark">{{ mod.name }}</h6>
          
          <div class="row g-0 text-center">
            <div class="col-6 border-end">
              <div class="p-2">
                <div class="fs-5 fw-bold" :class="'text-' + getProgressColor(mod.approved_count + mod.review_count + mod.rejected_count)">
                  {{ mod.approved_count + mod.review_count + mod.rejected_count }}
                </div>
                <small class="text-muted">Questions</small>
              </div>
            </div>
            <div class="col-6">
              <div class="p-2">
                <div class="fs-5 fw-bold text-info">{{ mod.concepts_count }}</div>
                <small class="text-muted">Concepts</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State for Grid -->
    <div v-if="paginatedModules.length === 0" class="col-12">
      <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 300px;">
        <div class="bg-light rounded-circle mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
          <i class="bi bi-search fs-1 text-muted"></i>
        </div>
        <h5 class="text-muted mb-2">No modules found</h5>
        <p class="text-muted mb-0">Try adjusting your search criteria</p>
      </div>
    </div>
  </div>
</div>


            <!-- List View -->
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                  <tr>
                    <th class="px-4 py-3 border-0" @click="sortBy('id')" style="cursor: pointer;">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-code-slash"></i>
                        <span class="fw-semibold">Module Code</span>
                        <i :class="sortKey === 'id' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0" @click="sortBy('name')" style="cursor: pointer;">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-book"></i>
                        <span class="fw-semibold">Module Name</span>
                        <i :class="sortKey === 'name' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0 text-center" @click="sortBy('questions')" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <i class="bi bi-patch-question"></i>
                        <span class="fw-semibold">Questions</span>
                        <i :class="sortKey === 'questions' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0 text-center" @click="sortBy('concepts')" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <i class="bi bi-diagram-3"></i>
                        <span class="fw-semibold">Concepts</span>
                        <i :class="sortKey === 'concepts' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
                      </div>
                    </th>
                    <th class="px-4 py-3 border-0 text-center">
                      <span class="fw-semibold">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(mod, index) in paginatedModules"
                    :key="mod.id"
                    @click="goToModule(mod.id)"
                    class="module-row"
                    style="cursor: pointer; transition: all 0.3s ease;"
                    :style="{ 'animation-delay': (index * 0.05) + 's' }"
                  >
                    <td class="px-4 py-4">
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-primary bg-opacity-10 p-2 rounded-circle">
                          <i :class="'bi ' + getModuleIcon(mod) + ' text-primary'"></i>
                        </div>
                        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium">
                          {{ mod.id }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="fw-bold text-dark">{{ mod.name }}</div>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span 
                        class="badge px-3 py-2 fs-6"
                        :class="'bg-' + getProgressColor(mod.approved_count + mod.review_count + mod.rejected_count)"
                        style="border-radius: 20px;"
                      >
                        {{ mod.approved_count + mod.review_count + mod.rejected_count }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span class="badge bg-info px-3 py-2 fs-6" style="border-radius: 20px;">
                        {{ mod.concepts_count }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <button
                        class="btn btn-primary btn-sm"
                        @click.stop="goToModule(mod.id)"
                        style="border-radius: 10px;"
                      >
                        <i class="bi bi-eye me-2"></i>View
                      </button>
                    </td>
                  </tr>
                  
                  <!-- Empty State -->
                  <tr v-if="paginatedModules.length === 0">
                    <td colspan="5" class="text-center py-5">
                      <div class="empty-state">
                        <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                          <i class="bi bi-search fs-1 text-muted"></i>
                        </div>
                        <h5 class="text-muted mb-2">No modules found</h5>
                        <p class="text-muted mb-0">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div v-if="!isLoading && totalPages > 1" class="px-3 py-3 border-top">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <p class="text-muted mb-0 small">{{ showingRangeText }}</p>
                </div>
                <div class="col-md-6">
                  <nav class="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
                    <ul class="pagination pagination-sm mb-0">
                      <!-- Previous Button -->
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
                          class="page-link px-2 py-1 small"
                          @click="changePage(page)"
                          :style="page === currentPage ? 'background: linear-gradient(45deg, #667eea, #764ba2); border-color: #667eea; color: white;' : ''"
                        >
                          {{ page }}
                        </button>
                        <span v-else class="page-link px-2 py-1 small">...</span>
                      </li>
                      <!-- Next Button -->
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
  `,
};
