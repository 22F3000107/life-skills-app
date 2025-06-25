import { fetchModules } from "../../services/moduleService.js";

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
    };
  },
  async mounted() {
    try {
      this.modules = await fetchModules();
    } catch (err) {
      console.error("Failed to load modules:", err.message);
    }
  },
  computed: {
    filteredModules() {
      // You can extend this filter later with age logic
      return this.modules.filter((mod) =>
        mod.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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
      return `Showing data ${start} to ${end} of ${this.filteredModules.length} entries`;
    },
    createModule() {
      if (!this.newModule.name.trim()) {
        alert("Module name is required.");
        return;
      }

      const newMod = {
        mcode: "M" + (this.modules.length + 101),
        name: this.newModule.name,
        description: this.newModule.description,
        approved: 0,
        rejected: 0,
        review: 0,
        concepts: 0,
      };

      this.modules.push(newMod);
      this.showCreatePopup = false;
      this.newModule.name = "";
      this.newModule.description = "";
    },
  },
  template: `
    <div class="container mt-4">

      <!-- Top Filters and Buttons -->
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">

        <!-- Left: Search and Age Dropdown -->
        <div class="d-flex align-items-end gap-2 flex-grow-1">
          <!-- Search Bar -->
          <input v-model="searchQuery" class="form-control form-control-sm" type="text" placeholder="Search Module..." style="min-width: 250px;"/>

          <!-- Age Dropdown (Multi-select Checkboxes) -->
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Filter by Age
            </button>
            <ul class="dropdown-menu p-2" style="min-width: 200px;">
              <li v-for="age in ageGroups" :key="age">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :value="age" v-model="selectedAges" :id="'age_' + age">
                  <label class="form-check-label" :for="'age_' + age">{{ age }}</label>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Buttons -->
        <div class="d-flex gap-2">
        
          <button class="btn btn-sm btn-outline-primary">+ Start Review</button>
          <button class="btn btn-sm btn-outline-success" @click="showCreatePopup = true">+ Create Module</button>

        </div>
      </div>
        
<!-- Cards-->
     <div class="row g-3">
      <div class="col-md-3" v-for="mod in paginatedModules" :key="mod.mcode">
        <!-- Wrap entire card in router-link -->
        <router-link
          :to="'/acad/module/' + mod.mcode + '?filter=all'"
          class="text-decoration-none text-dark"
          style="display: block;"
        >
          <div class="card h-100 shadow-sm border">
            <div class="card-body position-relative">
              <p class="text-muted mb-1">Mcode: {{ mod.mcode }}</p>
              <h6 class="fw-bold mb-3">{{ mod.name }}</h6>
              <p class="mb-1">
                ✔️ Approved Questions: {{ mod.approved_count }}
                <router-link
                  :to="'/acad/module/' + mod.mcode + '?filter=approved'"
                  class="float-end text-decoration-none"
                  @click.stop
                >➡️</router-link>
              </p>
              <p class="mb-1">
                ❌ Rejected Questions: {{ mod.rejected_count }}
                <router-link
                  :to="'/acad/module/' + mod.mcode + '?filter=rejected'"
                  class="float-end text-decoration-none"
                  @click.stop
                >➡️</router-link>
              </p>
              <p class="mb-1">
                🔍 To Review: {{ mod.review_count }}
                <router-link
                  :to="'/acad/module/' + mod.mcode + '?filter=pending'"
                  class="float-end text-decoration-none"
                  @click.stop
                >➡️</router-link>
              </p>
              <p class="mb-1">
  📚 Total Concepts: {{ mod.concepts_count }}
  <router-link
    :to="'/acad/concepts?module=' + mod.mcode"
    class="float-end text-decoration-none"
    @click.stop
  >➡️</router-link>
</p>

            </div>
          </div>
        </router-link>
      </div>
    </div>
    <!-- Pagination -->
      <div class="d-flex justify-content-between mt-3">
      <div class="text-muted small">{{ showingRangeText }}</div>
        <div class="btn-group">
          <button
            v-for="page in totalPages"
            :key="page"
            class="btn btn-sm"
            :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
      </div>
      <!-- Create Module Popup -->
<div v-if="showCreatePopup" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h6 class="modal-title">Create New Module</h6>
        <button type="button" class="btn-close" @click="showCreatePopup = false"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Module Name</label>
          <input v-model="newModule.name" class="form-control form-control-sm" placeholder="Enter module name" />
        </div>
        <div class="mb-2">
          <label class="form-label">Description</label>
          <textarea v-model="newModule.description" class="form-control form-control-sm" rows="3" placeholder="Enter module description"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm btn-secondary" @click="showCreatePopup = false">Cancel</button>
        <button class="btn btn-sm btn-success" @click="createModule">Create</button>
      </div>
    </div>
  </div>
</div>
      </div>

  `,
};
