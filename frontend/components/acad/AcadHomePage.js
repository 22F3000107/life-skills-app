export default {
  name: "AcadHomePage",
  data() {
    return {
      searchQuery: "",
      currentPage: 1,
      rowsPerPage: 10,
      modules: [
        {
          mcode: "M1244",
          name: "Time management",
          questions: 23,
          concepts: 22,
        },
        {
          mcode: "M1245",
          name: "Financial Literacy",
          questions: 18,
          concepts: 14,
        },
        { mcode: "M1246", name: "Communication", questions: 40, concepts: 35 },
        { mcode: "M1247", name: "Decision Making", questions: 12, concepts: 9 },
        {
          mcode: "M1248",
          name: "Problem Solving",
          questions: 30,
          concepts: 25,
        },
        {
          mcode: "M1249",
          name: "Stress Management",
          questions: 15,
          concepts: 12,
        },
        { mcode: "M1250", name: "Leadership", questions: 22, concepts: 20 },
        { mcode: "M1251", name: "Teamwork", questions: 10, concepts: 8 },
        { mcode: "M1252", name: "Self Awareness", questions: 28, concepts: 24 },
        { mcode: "M1253", name: "Empathy", questions: 9, concepts: 7 },
        {
          mcode: "M1254",
          name: "Critical Thinking",
          questions: 25,
          concepts: 21,
        },
        { mcode: "M1255", name: "Goal Setting", questions: 11, concepts: 10 },
      ],
    };
  },
  computed: {
    filteredModules() {
      return this.modules.filter((mod) =>
        mod.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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
      return `Showing data ${start} to ${end} of ${this.filteredModules.length} entries`;
    },
  },
  methods: {
  goToModule(mcode) {
    this.$router.push(`/acad/module/${mcode}`);
  }
}
,
  template: `
    <div class="container mt-4">

      <!-- Top Statistics -->
      <div class="row mb-4 text-center">
        <div class="col-md-4">
          <div class="p-3 bg-white shadow-sm border rounded">
            <h5>Total Questions</h5>
            <p class="fw-bold fs-4 text-primary">1240</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-white shadow-sm border rounded">
            <h5>Approved Questions</h5>
            <p class="fw-bold fs-4 text-success">82%</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-white shadow-sm border rounded">
            <h5>Rejected Questions</h5>
            <p class="fw-bold fs-4 text-danger">18%</p>
          </div>
        </div>
      </div>

      <!-- Module Overview -->
      <div class="bg-white shadow-sm border rounded p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Module Overview</h5>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-sm w-25"
            placeholder="Search Module..."
          />
        </div>

        <table class="table table-sm table-borderless border-bottom">
          <thead class="border-bottom">
            <tr>
              <th>Mcode</th>
              <th>Module Name</th>
              <th>Number of Questions</th>
              <th>Number of Concepts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in paginatedModules" :key="mod.mcode" class="border-bottom"  style="cursor: pointer;" 
  @click="goToModule(mod.mcode)">
              <td>{{ mod.mcode }}</td>
              <td>{{ mod.name }}</td>
              <td>{{ mod.questions }}</td>
              <td>{{ mod.concepts }}</td>
              <td><button class="btn btn-sm btn-outline-primary">View Module</button></td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted small">{{ showingRangeText }}</div>
          <div>
            <button
              v-for="page in totalPages"
              :key="page"
              class="btn btn-sm me-1"
              :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};
