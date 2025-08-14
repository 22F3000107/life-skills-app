import {
  fetchConcepts,
  createConcept,
  fetchConceptById,
  patchConceptById
} from "../../services/conceptService.js";
import { fetchQuestionsByModule } from "../../services/questionService.js";
import { fetchModules } from "../../services/moduleService.js";

export default {
  name: "ConceptsPage",
  data() {
    return {
      hasSearched: false,
      searchQuery: "",
      selectedModules: [],
      selectedAges: [],
      selectedTypes: [], // New filter for concept types
      currentPage: 1,
      conceptsPerPage: 9,
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      conceptTypes: ["quiz", "story","habits"], // New concept types
      moduleOptions: [],
      concepts: [],
      showCreatePopup: false,
      filterType: "",
      filterModule: "",
      filterAge: "",
      questionTypes: ["MCQ", "MSQ", "True/False"],
      allQuestions: [],
      fetchedQuestions: [],
      selectedQuestionIds: [],
      newConceptName: "",
      newConceptDescription: "", // Added missing field
      newConceptDate: "", // Added missing field
      newConceptMaxMarks: null, // Added missing field
      newConceptType: "quiz", // New field for concept type
      isConceptLive: false, // Added missing field
      isLoading: false,
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
    filteredConcepts() {
      return this.concepts.filter(
        (c) =>
          c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedModules.length === 0 ||
            this.selectedModules.some(
              (mod) => mod === this.getModuleName(c.module_id)
            )) &&
          (this.selectedAges.length === 0 ||
            this.selectedAges.some(
              (age) => c.age_groups && c.age_groups.includes(age)
            )) &&
          (this.selectedTypes.length === 0 ||
            this.selectedTypes.includes(c.type))
      );
    },
    paginatedConcepts() {
      const start = (this.currentPage - 1) * this.conceptsPerPage;
      return this.filteredConcepts.slice(start, start + this.conceptsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredConcepts.length / this.conceptsPerPage);
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
        this.selectedModules.length +
        this.selectedAges.length +
        this.selectedTypes.length +
        (this.searchQuery ? 1 : 0)
      );
    },
    selectedModulesText() {
      return this.selectedModules.length === 0
        ? "All Modules"
        : this.selectedModules.length === 1
        ? this.selectedModules[0]
        : `${this.selectedModules.length} selected`;
    },
    selectedAgesText() {
      return this.selectedAges.length === 0
        ? "All Ages"
        : this.selectedAges.length === 1
        ? this.selectedAges[0]
        : `${this.selectedAges.length} selected`;
    },
    selectedTypesText() {
      return this.selectedTypes.length === 0
        ? "All Types"
        : this.selectedTypes.length === 1
        ? this.capitalizeFirst(this.selectedTypes[0])
        : `${this.selectedTypes.length} selected`;
    },
  },
  methods: {
    async createConcept() {
      if (!this.newConceptName.trim()) {
        alert("Please enter a concept name.");
        return;
      }

      if (!this.filterModule) {
        alert("Please select a module.");
        return;
      }

      const payload = {
        module_id: this.filterModule,
        name: this.newConceptName.trim(),
        description: this.newConceptDescription || "",
        date: this.newConceptDate || null, // Format: DD-MM-YYYY
        live: this.isConceptLive || false,
        max_marks: this.newConceptMaxMarks || null,
        question_ids: this.selectedQuestionIds,
        type: this.newConceptType, // New field
      };

      try {
        this.isLoading = true;
        await createConcept(payload);
        alert(`Concept created successfully as ${this.newConceptType}.`);

        // Reset fields
        this.newConceptName = "";
        this.newConceptDescription = "";
        this.newConceptDate = "";
        this.isConceptLive = false;
        this.newConceptMaxMarks = null;
        this.newConceptType = "quiz";
        this.selectedQuestionIds = [];
        this.fetchedQuestions = [];
        this.hasSearched = false;
        this.showCreatePopup = false;

        // Refresh concepts list
        this.concepts = await fetchConcepts();
      } catch (error) {
        console.error("Create concept failed:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async toggleStatus(concept, event) {
      event.preventDefault();
      event.stopPropagation();
      const newStatus = !concept.live;
      concept.live = newStatus; // optimistic UI update

      await patchConceptById(concept.id, newStatus);
    },
    async fetchQuestions() {
      if (!this.filterModule) {
        alert("Please select a module to search.");
        return;
      }
      this.hasSearched = true;
      this.isLoading = true;
      try {
        const response = await fetchQuestionsByModule(this.filterModule);
        const questions = response.questions || [];

        this.fetchedQuestions = questions.filter(
          (q) =>
            q.concept_id == null &&
            q.is_archived == false &&
            (!this.filterType || q.type === this.filterType) &&
            (!this.filterAge ||
              (q.age_group &&
                q.age_group.length &&
                q.age_group[0].split(",").includes(this.filterAge)))
        );
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        alert("Error fetching questions.");
      } finally {
        this.isLoading = false;
      }
    },
    toggleSelection(qcode) {
      const idx = this.selectedQuestionIds.indexOf(qcode);
      if (idx > -1) {
        this.selectedQuestionIds.splice(idx, 1);
      } else {
        this.selectedQuestionIds.push(qcode);
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
      this.selectedModules = [];
      this.selectedAges = [];
      this.selectedTypes = [];
      this.currentPage = 1;
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getConceptIcon(type) {
      const icons = {
        quiz: "bi-question-circle",
        story: "bi-book",
        habits: "bi-lightbulb",
      };
      return icons[type] || "bi-lightbulb";
    },
    getTypeIcon(type) {
      return type === "quiz"
        ? "primary"
        : type === "habits"
        ? "info"
        : "secondary";
    },
    getTypeColor(type) {
      return type === "quiz" ? "primary" : "info";
    },
    getStatusColor(isLive) {
      return isLive ? "success" : "warning";
    },
    getModuleName(moduleId) {
      const module = this.moduleOptions.find((mod) => mod.id === moduleId);
      return module ? module.name : `Module ${moduleId}`;
    },
    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    formatDate(dateString) {
      if (!dateString) return "Not set";
      return new Date(dateString).toLocaleDateString();
    },
  },
  async mounted() {
    try {
      this.moduleOptions = await fetchModules();
      this.concepts = await fetchConcepts();
    } catch (err) {
      console.error("Failed to load data:", err.message);
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
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-body p-4">
                <div class="row align-items-center">
                  <div class="col-lg-8">
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <i class="bi bi-lightbulb-fill text-primary fs-2"></i>
                      </div>
                      <div>
                        <h1 class="mb-1 fw-bold text-dark">Concepts Library</h1>
                        <p class="text-muted mb-0">
                          <i class="bi bi-collection me-2"></i>
                          {{ filteredConcepts.length }} concepts available
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
                        class="btn btn-primary px-3 py-2"
                        @click="showCreatePopup = true"
                        style="background: linear-gradient(45deg, #667eea, #764ba2); border: none;"
                      >
                        <i class="bi bi-plus-circle me-2"></i>Create Concept
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
                  <div class="col-lg-5">
                    <div class="position-relative">
                      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="form-control ps-5"
                        placeholder="Search concepts..."
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      />
                    </div>
                  </div>

                  <!-- Module Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary w-100 dropdown-toggle"
                        type="button"
                        @click="toggleDropdown('module')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-book me-2"></i>
                        {{ selectedModulesText }}
                        <span v-if="selectedModules.length" class="badge bg-primary ms-2">{{ selectedModules.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'module'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="mod in moduleOptions" :key="mod.id" class="form-check mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :value="mod.name"
                            v-model="selectedModules"
                            :id="'mod_' + mod.id"
                          />
                          <label class="form-check-label fw-medium" :for="'mod_' + mod.id">{{ mod.name }}</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Age Filter -->
                  <div class="col-lg-2">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary w-100 dropdown-toggle"
                        type="button"
                        @click="toggleDropdown('age')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-people me-2"></i>
                        {{ selectedAgesText }}
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

                  <!-- Type Filter -->
                  <div class="col-lg-3">
                    <div class="dropdown" v-click-outside="closeDropdown">
                      <button
                        class="btn btn-outline-secondary w-100 dropdown-toggle"
                        type="button"
                        @click="toggleDropdown('type')"
                        style="border-radius: 15px; border: 2px solid #e9ecef;"
                      >
                        <i class="bi bi-tags me-2"></i>
                        {{ selectedTypesText }}
                        <span v-if="selectedTypes.length" class="badge bg-primary ms-2">{{ selectedTypes.length }}</span>
                      </button>
                      <div v-show="activeDropdown === 'type'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                        <div v-for="type in conceptTypes" :key="type" class="form-check mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :value="type"
                            v-model="selectedTypes"
                            :id="'type_' + type"
                          />
                          <label class="form-check-label fw-medium" :for="'type_' + type">
                            <i :class="getTypeIcon(type)" class="me-2"></i>
                            {{ capitalizeFirst(type) }}
                          </label>
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

        <!-- Concepts Grid -->
        <div class="row mb-4">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-body p-4">
                <div class="row g-4">
                  <div 
                    v-for="(concept, index) in paginatedConcepts" 
                    :key="concept.id" 
                    class="col-xl-4 col-md-6 col-sm-12"
                  >
                    <router-link
                      :to="{
                        path: '/acad/concept/' + concept.id,
                      }"
                      class="text-decoration-none"
                      style="display: block;"
                    >
                      <div 
                        class="card h-100 border-0 shadow-sm concept-card"
                        style="
                          border-radius: 15px; 
                          cursor: pointer; 
                          transition: all 0.3s ease;
                          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,250,0.9));
                        "
                        :style="{ 'animation-delay': (index * 0.1) + 's' }"
                      >
                        <div class="card-body p-4">
                          <div class="d-flex align-items-start justify-content-between mb-3">
                            <div class="d-flex align-items-center gap-2">
                              <div :class="'bg-' + getTypeColor(concept.type) + ' bg-opacity-10 p-3 rounded-circle'">
                                <i :class="'bi ' + getConceptIcon(concept.type) + ' text-' + getTypeColor(concept.type) + ' fs-4'"></i>
                              </div>
                              <div>
                                <span class="badge bg-secondary bg-opacity-10 text-dark px-3 py-2 rounded-pill small fw-medium">
                                  #{{ concept.id }}
                                </span>
                              </div>
                            </div>
                            <div class="text-end">
                              <div class="mb-1">
                                <span 
                                  :class="'badge bg-' + getTypeColor(concept.type) + ' px-2 py-1 rounded-pill small'"
                                >
                                  <i :class="getTypeIcon(concept.type) + ' me-1'"></i>
                                  {{ capitalizeFirst(concept.type) }}
                                </span>
                              </div>
                              <span 
                                class="badge px-3 py-2 fs-6"
                                :class="'bg-' + getStatusColor(concept.live)"
                                style="border-radius: 20px;"
                              >
                                <i :class="concept.live ? 'bi bi-broadcast' : 'bi bi-tools'" class="me-1"></i>
                                {{ concept.live ? 'LIVE' : 'Draft' }}
                              </span>
                            </div>
                          </div>
                          
                          <h5 class="card-title mb-3 fw-bold text-dark">{{ concept.name }}</h5>
                          
                          <div v-if="concept.description" class="mb-3">
                            <small class="text-muted">Description</small>
                            <div class="text-dark small">{{ concept.description }}</div>
                          </div>
                          
                          <div class="row g-3 mb-4">
                            <div class="col-6">
                              <div class="text-center p-2 bg-light rounded-3">
                                <div class="fs-4 fw-bold text-primary">{{ concept.question_count || 0 }}</div>
                                <small class="text-muted">Questions</small>
                              </div>
                            </div>
                            <div class="col-6">
                              <div class="text-center p-2 bg-light rounded-3">
                                <div class="fs-6 fw-bold text-secondary">{{ concept.max_marks || 'N/A' }}</div>
                                <small class="text-muted">Max Marks</small>
                              </div>
                            </div>
                          </div>
                          
                          <div class="mb-3">
                            <div class="row">
                              <div class="col-6">
                                <small class="text-muted">Module</small>
                                <div class="fw-medium text-dark small">{{ getModuleName(concept.module_id) }}</div>
                              </div>
                              <div class="col-6" v-if="concept.age_groups && concept.age_groups.length">
                                <small class="text-muted">Age Groups</small>
                                <div class="fw-medium text-dark small">{{ concept.age_groups.join(', ') }}</div>
                              </div>
                            </div>
                          </div>

                          <div class="mb-3" v-if="concept.date">
                            <small class="text-muted">Date</small>
                            <div class="fw-medium text-dark small">{{ formatDate(concept.date) }}</div>
                          </div>
                          
                          <button
                            class="btn btn-sm w-100 mb-2"
                            :class="concept.live ? 'btn-outline-danger' : 'btn-outline-success'"
                            @click="toggleStatus(concept, $event)"
                            style="border-radius: 10px;"
                          >
                            <i :class="concept.live ? 'bi bi-pause-circle' : 'bi bi-play-circle'" class="me-2"></i>
                            {{ concept.live ? 'Make Draft' : 'Make Live' }}
                          </button>
                          
                          <div class="d-flex justify-content-center">
                            <span class="btn btn-primary btn-sm px-4" style="border-radius: 10px;">
                              <i class="bi bi-eye me-2"></i>View Details
                            </span>
                          </div>
                        </div>
                      </div>
                    </router-link>
                  </div>

                  <!-- Empty State -->
                  <div v-if="paginatedConcepts.length === 0" class="col-12">
                    <div class="text-center py-5">
                      <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                        <i class="bi bi-search fs-1 text-muted"></i>
                      </div>
                      <h5 class="text-muted mb-2">No concepts found</h5>
                      <p class="text-muted mb-0">Try adjusting your search criteria or filters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="row">
          <div class="col">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
              <div class="card-body p-4">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <p class="text-muted mb-0 small">
                      <i class="bi bi-info-circle me-2"></i>
                      Showing {{ (currentPage - 1) * conceptsPerPage + 1 }}
                      to {{ Math.min(currentPage * conceptsPerPage, filteredConcepts.length) }}
                      of {{ filteredConcepts.length.toLocaleString() }} concepts
                    </p>
                  </div>
                  <div class="col-md-6">
                    <nav class="d-flex justify-content-md-end justify-content-center mt-3 mt-md-0">
                      <ul class="pagination pagination-sm mb-0">
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

      <!-- Create Concept Modal -->
      <div v-if="showCreatePopup" class="modal d-block" style="background: rgba(0,0,0,0.5); z-index: 1050;">
        <div class="modal-dialog modal-xl">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header bg-primary text-white" style="border-radius: 20px 20px 0 0;">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-plus-circle me-2"></i>
                Create New Concept
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="showCreatePopup = false"></button>
            </div>
            <div class="modal-body p-4">
              <!-- Basic Information -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label for="conceptName" class="form-label fw-semibold">Concept Name *</label>
                  <input
                    id="conceptName"
                    v-model="newConceptName"
                    type="text"
                    class="form-control form-control-lg"
                    placeholder="Enter concept name"
                    style="border-radius: 12px; border: 2px solid #e9ecef;"
                  />
                </div>
                <div class="col-md-6">
                  <label for="conceptType" class="form-label fw-semibold">Concept Type *</label>
                  <select
                    id="conceptType"
                    v-model="newConceptType"
                    class="form-select form-select-lg"
                    style="border-radius: 12px; border: 2px solid #e9ecef;"
                  >
                    <option value="quiz">
                      <i class="bi bi-question-circle-fill"></i> Quiz
                    </option>
                    <option value="story">
                      <i class="bi bi-book-fill"></i> Story
                    </option>
                      <option value="habits">
                      <i class="bi bi-lightbulb"></i> Habits
                    </option>
                  </select>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-md-12">
                  <label for="conceptDescription" class="form-label fw-semibold">Description</label>
                  <textarea
                    id="conceptDescription"
                    v-model="newConceptDescription"
                    class="form-control"
                    rows="3"
                    placeholder="Enter concept description"
                    style="border-radius: 12px; border: 2px solid #e9ecef;"
                  ></textarea>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-md-4">
                  <label for="conceptDate" class="form-label fw-semibold">Date</label>
                  <input
                    id="conceptDate"
                    v-model="newConceptDate"
                    type="date"
                    class="form-control"
                    style="border-radius: 12px; border: 2px solid #e9ecef;"
                  />
                  <small class="text-muted">Format will be converted to DD-MM-YYYY</small>
                </div>
                <div class="col-md-4">
                  <label for="conceptMaxMarks" class="form-label fw-semibold">Max Marks</label>
                  <input
                    id="conceptMaxMarks"
                    v-model="newConceptMaxMarks"
                    type="number"
                    class="form-control"
                    placeholder="Enter max marks"
                    style="border-radius: 12px; border: 2px solid #e9ecef;"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Status</label>
                  <div class="form-check form-switch mt-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="conceptLive"
                      v-model="isConceptLive"
                    />
                    <label class="form-check-label fw-medium" for="conceptLive">
                      <i :class="isConceptLive ? 'bi bi-broadcast text-success' : 'bi bi-tools text-warning'" class="me-2"></i>
                      {{ isConceptLive ? 'Live' : 'Draft' }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Question Selection Filters -->
              <div class="card bg-light border-0 mb-4">
                <div class="card-header bg-transparent">
                  <h6 class="mb-0 fw-semibold">
                    <i class="bi bi-funnel me-2"></i>
                    Question Selection Filters
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Question Type</label>
                      <select v-model="filterType" class="form-select" style="border-radius: 12px;">
                        <option value="">All Types</option>
                        <option v-for="type in questionTypes" :key="type" :value="type">{{ type }}</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Module *</label>
                      <select v-model="filterModule" class="form-select" style="border-radius: 12px;">
                        <option disabled value="">Select module</option>
                        <option v-for="mod in moduleOptions" :key="mod.id" :value="mod.id">
                          {{ mod.name }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Age Group</label>
                      <select v-model="filterAge" class="form-select" style="border-radius: 12px;">
                        <option value="">All Ages</option>
                        <option v-for="age in ageGroups" :key="age" :value="age">{{ age }}</option>
                      </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                      <button 
                        class="btn btn-primary w-100" 
                        @click="fetchQuestions"
                        style="border-radius: 12px;"
                        :disabled="isLoading"
                      >
                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-search me-2"></i>
                        {{ isLoading ? 'Searching...' : 'Search Questions' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Results Table -->
              <div v-if="fetchedQuestions.length > 0" class="card border-0 bg-light">
                <div class="card-header bg-transparent">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 fw-semibold">
                      <i class="bi bi-list-check me-2"></i>
                      Available Questions ({{ fetchedQuestions.length }})
                    </h6>
                    <span class="badge bg-primary px-3 py-2">
                      {{ selectedQuestionIds.length }} selected
                    </span>
                  </div>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive" style="max-height: 400px;">
                    <table class="table table-hover mb-0">
                      <thead class="table-primary sticky-top">
                        <tr>
                          <th class="px-4 py-3">
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :checked="selectedQuestionIds.length === fetchedQuestions.length && fetchedQuestions.length > 0"
                                @change="selectedQuestionIds = $event.target.checked ? fetchedQuestions.map(q => q.id) : []"
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
                        <tr v-for="q in fetchedQuestions" :key="q.id" class="align-middle">
                          <td class="px-4 py-3">
                            <div class="form-check">
                              <input 
                                class="form-check-input" 
                                type="checkbox" 
                                :value="q.id" 
                                v-model="selectedQuestionIds" 
                              />
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                              Q{{ q.id }}
                            </span>
                          </td>
                          <td class="px-4 py-3">
                            <div class="fw-medium">{{ q.question_statement || 'No statement available' }}</div>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <span class="badge bg-info bg-opacity-20 text-dark px-2 py-1 rounded-pill">
                              {{ q.type }}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <span class="badge bg-secondary bg-opacity-20 text-dark px-2 py-1 rounded-pill">
                              {{ q.age_group ? q.age_group.join(', ') : 'N/A' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div v-else-if="hasSearched && !isLoading && fetchedQuestions.length === 0" class="card border-0 bg-light">
                <div class="card-body text-center py-5">
                  <div class="text-muted">
                    <i class="bi bi-info-circle fs-1 mb-3 d-block"></i>
                    <h6 class="mb-2">No Questions Available</h6>
                    <p class="mb-0">No matching questions found or all questions are already assigned to other concepts.</p>
                  </div>
                </div>
              </div>

              <div v-else-if="!hasSearched" class="card border-0 bg-light">
                <div class="card-body text-center py-5">
                  <div class="text-muted">
                    <i class="bi bi-search fs-1 mb-3 d-block"></i>
                    <h6 class="mb-2">Search for Questions</h6>
                    <p class="mb-0">Select filters and click "Search Questions" to find available questions for this concept.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer p-4 border-top">
              <div class="d-flex justify-content-between align-items-center w-100">
                <div class="text-muted small">
                  <i class="bi bi-info-circle me-2"></i>
                  Creating as: <strong>{{ capitalizeFirst(newConceptType) }}</strong>
                  {{ selectedQuestionIds.length
      ? 'with ' + selectedQuestionIds.length + ' question' + (selectedQuestionIds.length > 1 ? 's' : '')
      : ''
  }}
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-secondary btn-lg px-4" @click="showCreatePopup = false">
                    <i class="bi bi-x-circle me-2"></i>Cancel
                  </button>
                  <button 
                    class="btn btn-success btn-lg px-4" 
                    :disabled="!newConceptName.trim() || !filterModule" 
                    @click="createConcept"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-check-circle me-2"></i>
                    {{ isLoading ? 'Creating...' : 'Create Concept' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  `,
};
