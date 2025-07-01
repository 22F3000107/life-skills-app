import { fetchAcadHomeModules } from "../../services/acadService.js";

export default {
  name: "AcadHomePage",
  data() {
    return {
      searchQuery: "",
      currentPage: 1,
      rowsPerPage: 9,
      modules: [],
      sortKey: "name",
      sortOrder: "asc",
      isLoading: false,
      viewMode: "grid", // grid or list
      selectedFilter: "all",
      statsData: {
        totalQuestions: 1240,
        approvedPercentage: 82,
        rejectedPercentage: 18,
        totalModules: 0,
      },
    };
  },
  computed: {
    filteredModules() {
      let filtered = this.modules.filter((mod) =>
        mod.mcode.toLowerCase().includes(this.searchQuery.toLowerCase())
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
    goToModule(mcode) {
      this.$router.push(`/acad/module/${mcode}`);
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
      return icons[Math.abs(module.mcode.charCodeAt(0) % icons.length)];
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
      this.modules = await fetchAcadHomeModules();
      this.statsData.totalModules = this.modules.length;
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
        <div class="row g-3 mb-4">
          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-journal-text text-primary fs-5"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0 small">Total Questions</p>
                    <h5 class="fw-bold mb-0 text-primary">{{ statsData.totalQuestions.toLocaleString() }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-check2-circle text-success fs-5"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0 small">Approved</p>
                    <h5 class="fw-bold mb-0 text-success">{{ statsData.approvedPercentage }}%</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-clock text-warning fs-5"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0 small">Pending Review</p>
                    <h5 class="fw-bold mb-0 text-warning">{{ statsData.rejectedPercentage }}%</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6">
            <div class="card border-0 shadow-sm" style="border-radius: 15px; background: rgba(255, 255, 255, 0.95);">
              <div class="card-body p-3">
                <div class="d-flex align-items-center">
                  <div class="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                    <i class="bi bi-collection text-info fs-5"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0 small">Total Modules</p>
                    <h5 class="fw-bold mb-0 text-info">{{ statsData.totalModules }}</h5>
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
        <div style="max-width: 240px;">
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

        <!-- Filter Dropdown -->
        <select 
          v-model="selectedFilter" 
          class="form-select form-select-sm" 
          style="border-radius: 10px; border: 1px solid #dee2e6; min-width: 150px;"
        >
          <option value="all">All Modules</option>
          <option value="active">With Questions</option>
          <option value="empty">Empty Modules</option>
        </select>

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
                <div v-for="(mod, index) in paginatedModules" :key="mod.mcode" class="col-xl-4 col-lg-6">
                  <div 
                    class="card border-0 shadow-sm module-card"
                    style="border-radius: 12px; cursor: pointer; transition: all 0.3s ease;"
                    :style="{  'animation-delay': (index * 0.1) + 's' }"
                    @click="goToModule(mod.mcode)"
                  >
                    <div class="card-body p-3">
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="d-flex align-items-center gap-2">
                          <div class="bg-primary bg-opacity-10 p-2 rounded-circle">
                            <i :class="'bi ' + getModuleIcon(mod) + ' text-primary'"></i>
                          </div>
                          <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill small fw-medium">
                            {{ mod.mcode }}
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
                            <div class="fs-5 fw-bold" :class="'text-' + getProgressColor(mod.questions)">
                              {{ mod.questions }}
                            </div>
                            <small class="text-muted">Questions</small>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="p-2">
                            <div class="fs-5 fw-bold text-info">{{ mod.concepts }}</div>
                            <small class="text-muted">Concepts</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                  <tr>
                    <th class="px-4 py-3 border-0" @click="sortBy('mcode')" style="cursor: pointer;">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-code-slash"></i>
                        <span class="fw-semibold">Module Code</span>
                        <i :class="sortKey === 'mcode' ? (sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill') : 'bi bi-arrows-expand'"></i>
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
                    :key="mod.mcode"
                    @click="goToModule(mod.mcode)"
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
                          {{ mod.mcode }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="fw-bold text-dark">{{ mod.name }}</div>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span 
                        class="badge px-3 py-2 fs-6"
                        :class="'bg-' + getProgressColor(mod.questions)"
                        style="border-radius: 20px;"
                      >
                        {{ mod.questions }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <span class="badge bg-info px-3 py-2 fs-6" style="border-radius: 20px;">
                        {{ mod.concepts }}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <button
                        class="btn btn-primary btn-sm"
                        @click.stop="goToModule(mod.mcode)"
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
