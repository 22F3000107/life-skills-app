export default {
  name: "QuestionFilters",
  props: {
    // Search
    searchQuery: String,

    // Multi-select filters
    selectedTypes: {
      type: Array,
      default: () => [],
    },
    selectedModules: {
      type: Array,
      default: () => [],
    },
    selectedAges: {
      type: Array,
      default: () => [],
    },
    selectedStatuses: {
      type: Array,
      default: () => [],
    },

    // Options
    questionTypes: {
      type: Array,
      default: () => [],
    },
    moduleOptions: {
      type: Array,
      default: () => [],
    },
    ageGroups: {
      type: Array,
      default: () => [],
    },
    statusOptions: {
      type: Array,
      default: () => [],
    },

    // UI State
    showFilters: Boolean,
    activeFiltersCount: Number,
    activeDropdown: String,

    // Configuration
    title: {
      type: String,
      default: "Advanced Filters",
    },
    searchPlaceholder: {
      type: String,
      default: "Search...",
    },
    showModuleFilter: {
      type: Boolean,
      default: true,
    },
    showStatusFilter: {
      type: Boolean,
      default: true,
    },
  },
  emits: [
    "update:searchQuery",
    "update:selectedTypes",
    "update:selectedModules",
    "update:selectedAges",
    "update:selectedStatuses",
    "update:showFilters",
    "toggleDropdown",
    "closeDropdown",
    "clearFilters",
  ],
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
  methods: {
    toggleFilters() {
      this.$emit("update:showFilters", !this.showFilters);
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
  },
  template: `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
      <div class="card-header bg-transparent border-0 p-4">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-funnel text-primary fs-5"></i>
            <h5 class="mb-0 fw-bold text-dark">{{ title }}</h5>
          </div>
          
          <!-- Mobile Filter Toggle -->
          <div class="d-lg-none">
            <button class="btn btn-outline-primary" @click="toggleFilters">
              <i class="bi bi-funnel me-2"></i>
              {{ showFilters ? 'Hide' : 'Show' }} Filters
              <span v-if="activeFiltersCount > 0" class="badge bg-primary ms-2">{{ activeFiltersCount }}</span>
            </button>
          </div>
          <!-- Clear Filters Button -->
          <button 
            v-if="activeFiltersCount > 0"
            class="btn btn-outline-danger d-none d-lg-block"
            @click="$emit('clearFilters')"
          >
            <i class="bi bi-x-circle me-2"></i>Clear All
          </button>
        </div>
      </div>
      
      <div class="card-body p-4 pt-0" :class="{ 'd-none d-lg-block': !showFilters }">
        <div class="row g-3">
          <!-- Search -->
          <div class="col-lg-4">
            <div class="position-relative">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                type="text"
                class="form-control form-control-sm ps-4"
                :placeholder="searchPlaceholder"
                style="border-radius: 15px; border: 2px solid #e9ecef;"
              />
            </div>
          </div>
          
          <!-- Type Filter -->
          <div class="col-lg-2">
            <div class="dropdown" v-click-outside="() => $emit('closeDropdown')">
              <button
                class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                type="button"
                @click="$emit('toggleDropdown', 'type')"
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
                    :checked="selectedTypes.includes(type)"
                    @change="$emit('update:selectedTypes', $event.target.checked ? [...selectedTypes, type] : selectedTypes.filter(t => t !== type))"
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
          <div v-if="showModuleFilter" class="col-lg-2">
            <div class="dropdown" v-click-outside="() => $emit('closeDropdown')">
              <button
                class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                type="button"
                @click="$emit('toggleDropdown', 'module')"
                style="border-radius: 15px; border: 2px solid #e9ecef;"
              >
                <i class="bi bi-book me-2"></i>
                Module
                <span v-if="selectedModules.length" class="badge bg-primary ms-2">{{ selectedModules.length }}</span>
              </button>
              <div v-show="activeDropdown === 'module'" class="dropdown-menu show p-3 shadow-lg" style="border-radius: 15px; min-width: 200px;">
                <div v-for="mod in moduleOptions" :key="mod.id" class="form-check mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="mod.id"
                    :checked="selectedModules.includes(mod.id)"
                    @change="$emit('update:selectedModules', $event.target.checked ? [...selectedModules, mod.id] : selectedModules.filter(m => m !== mod.id))"
                    :id="'mod_' + mod.id"
                  />
                  <label class="form-check-label fw-medium" :for="'mod_' + mod.id">
                    {{ mod.name }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Age Filter -->
          <div class="col-lg-2">
            <div class="dropdown" v-click-outside="() => $emit('closeDropdown')">
              <button
                class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                type="button"
                @click="$emit('toggleDropdown', 'age')"
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
                    :checked="selectedAges.includes(age)"
                    @change="$emit('update:selectedAges', $event.target.checked ? [...selectedAges, age] : selectedAges.filter(a => a !== age))"
                    :id="'age_' + age"
                  />
                  <label class="form-check-label fw-medium" :for="'age_' + age">{{ age }} years</label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Status Filter -->
          <div v-if="showStatusFilter" class="col-lg-2">
            <div class="dropdown" v-click-outside="() => $emit('closeDropdown')">
              <button
                class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle px-2 py-1"
                type="button"
                @click="$emit('toggleDropdown', 'status')"
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
                    :checked="selectedStatuses.includes(status)"
                    @change="$emit('update:selectedStatuses', $event.target.checked ? [...selectedStatuses, status] : selectedStatuses.filter(s => s !== status))"
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
          <button class="btn btn-outline-danger w-100" @click="$emit('clearFilters')">
            <i class="bi bi-x-circle me-2"></i>Clear All Filters
          </button>
        </div>
      </div>
    </div>
  `,
};
