import { fetchModules,createModule } from "../../services/moduleService.js";

export default {
  name: "ModulesPage",
  data() {
    return {
      showCreatePopup: false,
      newModule: {
        name: "",
        description: "",
      },
      modules: [],
      searchQuery: "",
      selectedAges: [],
      currentPage: 1,
      modulesPerPage: 12,
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      isLoading: true,
      viewMode: "grid", // 'grid' or 'list'
      sortBy: "name", // 'name', 'code', 'questions'
      sortOrder: "asc",
    };
  },
  async mounted() {
    try {
      this.modules = await fetchModules();
    } catch (err) {
      console.error("Failed to load modules:", err.message);
    } finally {
      this.isLoading = false;
    }
  },
  computed: {
    filteredModules() {
      let filtered = this.modules.filter((mod) =>
        mod.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      // Sort modules
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (this.sortBy) {
          case "code":
            aValue = a.id;
            bValue = b.id;
            break;
          case "questions":
            aValue =
              (a.approved_count || 0) +
              (a.rejected_count || 0) +
              (a.review_count || 0);
            bValue =
              (b.approved_count || 0) +
              (b.rejected_count || 0) +
              (b.review_count || 0);
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (this.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return filtered;
    },
    paginatedModules() {
      const start = (this.currentPage - 1) * this.modulesPerPage;
      return this.filteredModules.slice(start, start + this.modulesPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredModules.length / this.modulesPerPage);
    },
    showingRangeText() {
      const start = (this.currentPage - 1) * this.modulesPerPage + 1;
      const end = Math.min(
        start + this.modulesPerPage - 1,
        this.filteredModules.length
      );
      return `Showing ${start} to ${end} of ${this.filteredModules.length} modules`;
    },
    totalStats() {
      return this.modules.reduce(
        (acc, mod) => ({
          approved: acc.approved + (mod.approved_count || 0),
          rejected: acc.rejected + (mod.rejected_count || 0),
          review: acc.review + (mod.review_count || 0),
          concepts: acc.concepts + (mod.concepts_count || 0),
        }),
        { approved: 0, rejected: 0, review: 0, concepts: 0 }
      );
    },
  },
  methods: {
    async createModule() {
      if (!this.newModule.name.trim()) {
        alert("Module name is required.");
        return;
      }

      try {
        this.isCreating = true;

        await createModule(this.newModule.name, this.newModule.description);

        // Refresh the entire module list from the server
        this.modules = await fetchModules();

        this.showCreatePopup = false;
        this.newModule.name = "";
        this.newModule.description = "";

        alert("Module created successfully!");
      } catch (error) {
        console.error("Failed to create module:", error);
        alert("Failed to create module. Please try again.");
      } finally {
        this.isCreating = false;
      }
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },
    getModuleIcon(moduleName) {
      const iconMap = {
        "time management": "fas fa-clock",
        "stress control": "fas fa-heart",
        communication: "fas fa-comments",
        leadership: "fas fa-crown",
        teamwork: "fas fa-users",
        "problem solving": "fas fa-puzzle-piece",
        creativity: "fas fa-lightbulb",
        "critical thinking": "fas fa-brain",
      };

      const key = moduleName.toLowerCase();
      return iconMap[key] || "fas fa-book";
    },
    getTotalQuestions(module) {
      return (
        (module.approved_count || 0) +
        (module.rejected_count || 0) +
        (module.review_count || 0)
      );
    },
  },
  template: `
    <div class="modules-container">
      <div class="container-fluid py-4">
        
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h4 class="mb-1 text-primary">
                      <i class="fas fa-layer-group me-2"></i>Learning Modules
                    </h4>
                    <p class="text-muted mb-0">Manage and organize your educational content</p>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <div class="d-flex align-items-center justify-content-md-end gap-2 mt-3 mt-md-0">
                                        <router-link
                      :to="'/acad/questions/review'"
                      @click.stop
                    >
                          <button class="btn btn-outline-primary btn-lg px-4">
                        Start Review
                      </button>
                      </router-link>
                      <button class="btn btn-primary btn-lg px-4" style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;" @click="showCreatePopup = true">
                        <i class="bi bi-plus-circle me-2"></i>Create Module
                      </button>
                                           
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Overview -->
        <div v-if="!isLoading" class="row mb-4">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card approved">
              <div class="stats-content">
                <div class="stats-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stats-info">
                  <h3>{{ totalStats.approved }}</h3>
                  <p>Approved Questions</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card review">
              <div class="stats-content">
                <div class="stats-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stats-info">
                  <h3>{{ totalStats.review }}</h3>
                  <p>Pending Review</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card rejected">
              <div class="stats-content">
                <div class="stats-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="stats-info">
                  <h3>{{ totalStats.rejected }}</h3>
                  <p>Rejected Questions</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="stats-card concepts">
              <div class="stats-content">
                <div class="stats-icon">
                  <i class="fas fa-lightbulb"></i>
                </div>
                <div class="stats-info">
                  <h3>{{ totalStats.concepts }}</h3>
                  <p>Total Concepts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

       <!-- Filters and Controls -->
<div class="row mb-4">
  <div class="col-12">
    <div class="card border-0 shadow-sm">
      <div class="card-body py-3 px-4">
        <div class="row g-3 align-items-end">

          <!-- Search -->
          <div class="col-lg-4 col-md-6">
            <label class="form-label fw-semibold text-muted">Search Modules</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input
                v-model="searchQuery"
                class="form-control"
                type="text"
                placeholder="Type module name..."
              />
            </div>
          </div>

          <!-- Age Filter -->
          <div class="col-lg-3 col-md-6">
            <label class="form-label fw-semibold text-muted">Age Groups</label>
            <div class="dropdown w-100">
              <button class="form-control d-flex align-items-center justify-content-between" type="button" data-bs-toggle="dropdown">
                <span><i class="fas fa-filter me-2 text-muted"></i>{{ selectedAges.length ? selectedAges.length + ' selected' : 'All Ages' }}</span>
                <i class="fas fa-chevron-down text-muted"></i>
              </button>
              <ul class="dropdown-menu w-100 p-3 shadow">
                <li v-for="age in ageGroups" :key="age" class="mb-2">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="age"
                      v-model="selectedAges"
                      :id="'age_' + age"
                    />
                    <label class="form-check-label" :for="'age_' + age">
                      {{ age }} years old
                    </label>
                  </div>
                </li>
                <li v-if="selectedAges.length > 0">
                  <hr class="dropdown-divider">
                  <button class="btn btn-sm btn-outline-secondary w-100" @click="selectedAges = []">
                    Clear All
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Sort Controls -->
          <div class="col-lg-3 col-md-6">
            <label class="form-label fw-semibold text-muted">Sort By</label>
            <div class="input-group">
              <select v-model="sortBy" class="form-select">
                <option value="name">Module Name</option>
                <option value="code">Module Code</option>
                <option value="questions">Total Questions</option>
              </select>
              <button class="btn btn-outline-secondary" @click="toggleSortOrder" title="Toggle sort order">
                <i :class="sortOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down'"></i>
              </button>
            </div>
          </div>

          <!-- View Mode -->
          <div class="col-lg-2 col-md-6">
            <label class="form-label fw-semibold text-muted">View</label>
            <div class="btn-group w-100" role="group">
              <button 
                class="btn"
                :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                @click="viewMode = 'grid'"
                title="Grid view"
              >
                <i class="fas fa-th"></i>
              </button>
              <button 
                class="btn"
                :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                @click="viewMode = 'list'"
                title="List view"
              >
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h5>Loading Modules...</h5>
          <p class="text-muted">Please wait while we fetch your modules.</p>
        </div>

        <!-- No Results -->
        <div v-else-if="filteredModules.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="fas fa-search text-muted mb-3" style="font-size: 3rem;"></i>
            <h5>No modules found</h5>
            <p class="text-muted mb-4">Try adjusting your search criteria or create a new module.</p>
            <button class="btn btn-primary" @click="showCreatePopup = true">
              <i class="fas fa-plus me-2"></i>Create Your First Module
            </button>
          </div>
        </div>

        <!-- Module Cards Grid View -->
        <div v-else-if="viewMode === 'grid'" class="row g-4">
          <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6" v-for="mod in paginatedModules" :key="mod.id">
            <div class="module-card">
              <router-link :to="'/acad/module/' + mod.id + '?filter=all'" class="text-decoration-none">
                <div class="module-card-inner">
                  
                  <!-- Header -->
                  <div class="module-header">
                    <div class="module-icon">
                      <i :class="getModuleIcon(mod.name)"></i>
                    </div>
                    <div class="module-code">M{{ mod.id }}</div>
                  </div>

                  <!-- Content -->
                  <div class="module-content">
                    <h6 class="module-title">{{ mod.name }}</h6>
                    <p v-if="mod.description" class="module-description">{{ mod.description }}</p>
                    <div class="module-stats">
                      <div class="total-questions">
                        <strong>{{ getTotalQuestions(mod) }}</strong>
                        <span>Total Questions</span>
                      </div>
                    </div>
                  </div>

                  <!-- Stats -->
                  <div class="module-stats-grid">
                    <router-link
                      :to="'/acad/module/' + mod.id + '?filter=approved'"
                      class="stat-item approved"
                      @click.stop
                    >
                      <i class="fas fa-check-circle"></i>
                      <span class="stat-number">{{ mod.approved_count || 0 }}</span>
                      <span class="stat-label">Approved</span>
                    </router-link>

                    <router-link
                      :to="'/acad/module/' + mod.id + '?filter=pending'"
                      class="stat-item review"
                      @click.stop
                    >
                      <i class="fas fa-clock"></i>
                      <span class="stat-number">{{ mod.review_count || 0 }}</span>
                      <span class="stat-label">Review</span>
                    </router-link>

                    <router-link
                      :to="'/acad/module/' + mod.id + '?filter=rejected'"
                      class="stat-item rejected"
                      @click.stop
                    >
                      <i class="fas fa-times-circle"></i>
                      <span class="stat-number">{{ mod.rejected_count || 0 }}</span>
                      <span class="stat-label">Rejected</span>
                    </router-link>

                    <router-link
                      :to="'/acad/concepts?module=' + mod.id"
                      class="stat-item concepts"
                      @click.stop
                    >
                      <i class="fas fa-lightbulb"></i>
                      <span class="stat-number">{{ mod.concepts_count || 0 }}</span>
                      <span class="stat-label">Concepts</span>
                    </router-link>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Module List View -->
        <div v-else class="card border-0 shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="border-0">Module</th>
                  <th class="border-0 text-center">Approved</th>
                  <th class="border-0 text-center">Review</th>
                  <th class="border-0 text-center">Rejected</th>
                  <th class="border-0 text-center">Concepts</th>
                  <th class="border-0 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mod in paginatedModules" :key="mod.id" class="module-row">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="module-list-icon me-3">
                        <i :class="getModuleIcon(mod.name)"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">{{ mod.name }}</h6>
                        <small class="text-muted">{{ mod.id }}</small>
                        <p v-if="mod.description" class="text-muted small mb-0 mt-1">{{ mod.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <router-link :to="'/acad/module/' + mod.id + '?filter=approved'" class="stat-badge approved">
                      {{ mod.approved_count || 0 }}
                    </router-link>
                  </td>
                  <td class="text-center">
                    <router-link :to="'/acad/module/' + mod.id + '?filter=pending'" class="stat-badge review">
                      {{ mod.review_count || 0 }}
                    </router-link>
                  </td>
                  <td class="text-center">
                    <router-link :to="'/acad/module/' + mod.id + '?filter=rejected'" class="stat-badge rejected">
                      {{ mod.rejected_count || 0 }}
                    </router-link>
                  </td>
                  <td class="text-center">
                    <router-link :to="'/acad/concepts?module=' + mod.id" class="stat-badge concepts">
                      {{ mod.concepts_count || 0 }}
                    </router-link>
                  </td>
                  <td class="text-center">
                    <router-link :to="'/acad/module/' + mod.id + '?filter=all'" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-eye me-1"></i>View
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

<!-- Pagination -->
<div v-if="totalPages > 1" class="row mt-3">
  <div class="col-12">
    <div class="card border-0 shadow-sm">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          
          <!-- Showing Range Text -->
          <div class="text-muted small d-flex align-items-center">
            <i class="bi bi-info-circle me-1 text-primary"></i>
            {{ showingRangeText }}
          </div>
          
          <!-- Pagination Controls -->
          <nav>
            <ul class="pagination pagination-sm mb-0">
              
              <!-- First -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link px-2 py-1" @click="currentPage = 1" :disabled="currentPage === 1" title="First">
                  <i class="bi bi-chevron-bar-left small"></i>
                </button>
              </li>
              
              <!-- Previous -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link px-2 py-1" @click="currentPage--" :disabled="currentPage === 1" title="Previous">
                  <i class="bi bi-chevron-left small"></i>
                </button>
              </li>

              <!-- Page Numbers -->
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage, disabled: page === '...' }"
              >
                <button
                  v-if="page !== '...'"
                  class="page-link px-2 py-1 small"
                  @click="currentPage = page"
                  :style="page === currentPage ? 'background: linear-gradient(45deg, #667eea, #764ba2); border-color: #667eea; color: white;' : ''"
                >
                  {{ page }}
                </button>
                <span v-else class="page-link px-2 py-1 small">…</span>
              </li>

              <!-- Next -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link px-2 py-1" @click="currentPage++" :disabled="currentPage === totalPages" title="Next">
                  <i class="bi bi-chevron-right small"></i>
                </button>
              </li>
              
              <!-- Last -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link px-2 py-1" @click="currentPage = totalPages" :disabled="currentPage === totalPages" title="Last">
                  <i class="bi bi-chevron-bar-right small"></i>
                </button>
              </li>

            </ul>
          </nav>

        </div>
      </div>
    </div>
  </div>
</div>


        <!-- Create Module Modal -->
        <div v-if="showCreatePopup" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
              <div class="modal-header border-0 bg-primary text-white">
                <h5 class="modal-title">
                  <i class="fas fa-plus-circle me-2"></i>Create New Module
                </h5>
                <button type="button" class="btn-close btn-close-white" @click="showCreatePopup = false"></button>
              </div>
              <div class="modal-body p-4">
                <div class="mb-4">
                  <label class="form-label fw-bold">Module Name <span class="text-danger">*</span></label>
                  <input 
                    v-model="newModule.name" 
                    class="form-control form-control-lg" 
                    placeholder="e.g., Time Management, Communication Skills"
                    maxlength="100"
                  />
                  <div class="form-text">
                    <span :class="{ 'text-danger': newModule.name.length > 80 }">
                      {{ newModule.name.length }}/100 characters
                    </span>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Description</label>
                  <textarea 
                    v-model="newModule.description" 
                    class="form-control" 
                    rows="4" 
                    placeholder="Describe what this module covers and its learning objectives..."
                    maxlength="500"
                  ></textarea>
                  <div class="form-text">
                    <span :class="{ 'text-danger': newModule.description.length > 450 }">
                      {{ newModule.description.length }}/500 characters
                    </span>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0">
                <button class="btn btn-outline-secondary" @click="showCreatePopup = false">
                  <i class="fas fa-times me-2"></i>Cancel
                </button>
                <button 
                  class="btn btn-success" 
                  @click="createModule" 
                  :disabled="!newModule.name.trim() || isCreating"
                >
                  <i v-if="!isCreating" class="fas fa-check me-2"></i>
                  <div v-else class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  {{ isCreating ? 'Creating...' : 'Create Module' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  `,
};
