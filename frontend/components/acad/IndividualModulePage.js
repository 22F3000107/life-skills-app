import { fetchQuestionsByModule } from "../../services/questionService.js";
import ModuleHeader from "../utils/ModuleHeader.js";
import QuestionFilters from "../utils/QuestionFilters.js";
import QuestionTable from "../utils/QuestionTable.js";
import QuestionPagination from "../utils/QuestionPagination.js";

export default {
  name: "IndividualModulePage",
  components: {
    ModuleHeader,
    QuestionFilters,
    QuestionTable,
    QuestionPagination,
  },
  props: ["mcode", "filter"],
  data() {
    return {
      searchQuery: "",
      selectedTypes: [],
      selectedModules: [],
      selectedAges: [],
      selectedStatuses: [],
      selectedModule: "",
      questionTypes: ["MCQ", "MSQ", "True/False"],
      moduleOptions: [],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: ["Approved", "Rejected", "Pending"],
      currentPage: 1,
      rowsPerPage: 10,
      questions: [],
      sortKey: "qcode",
      sortOrder: "asc",
      isLoading: false,
      showFilters: false,
      activeDropdown: null,
    };
  },
  computed: {
    transformedQuestions() {
      return this.questions.map((q) => ({
        ...q,
        qcode: `Q${q.id}`,
        question: q.question_statement,
        age: q.age_group[0],
        type: q.type,
        status: q.is_approved,
      }));
    },

    filteredQuestions() {
      if (!Array.isArray(this.transformedQuestions)) {
        return [];
      }

      const filtered = this.transformedQuestions.filter(
        (q) =>
          q.qcode.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedTypes.length === 0 ||
            this.selectedTypes.includes(q.type)) &&
          (this.selectedAges.length === 0 ||
            this.selectedAges.includes(q.age)) &&
          (this.selectedStatuses.length === 0 ||
            this.selectedStatuses.includes(q.status)) &&
          (this.filter === "all" ||
            this.filter === "" ||
            q.status.toLowerCase() === this.filter.toLowerCase())
      );

      return filtered.sort((a, b) => {
        let fieldA = a[this.sortKey];
        let fieldB = b[this.sortKey];
        if (typeof fieldA === "string") fieldA = fieldA.toLowerCase();
        if (typeof fieldB === "string") fieldB = fieldB.toLowerCase();
        if (fieldA < fieldB) return this.sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return this.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    },

    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      return this.filteredQuestions.slice(start, start + this.rowsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.rowsPerPage);
    },

    showingRangeText() {
      const start = (this.currentPage - 1) * this.rowsPerPage + 1;
      const end = Math.min(
        start + this.rowsPerPage - 1,
        this.filteredQuestions.length
      );
      return `Showing ${start} to ${end} of ${this.filteredQuestions.length} entries`;
    },

    activeFiltersCount() {
      let count = 0;
      if (this.searchQuery) count++;
      if (this.selectedTypes.length > 0) count++;
      if (this.selectedAges.length > 0) count++;
      if (this.selectedStatuses.length > 0) count++;
      return count;
    },
  },

  methods: {
    goToQuestion(qcode) {
      const id = qcode.replace("Q", "");
      this.$router.push(`/acad/question/${id}`);
    },

    editQuestion(qcode) {
      const id = qcode.replace("Q", "");
      this.$router.push(`/acad/question/edit/${id}`);
    },

    archiveQuestion(qcode) {
      console.log("Archive clicked for:", qcode);
    },

    addQuestion() {
      this.$router.push(`/acad/question/add?module=${this.mcode}`);
    },

    setSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "asc";
      }
    },

    toggleDropdown(dropdownName) {
      this.activeDropdown =
        this.activeDropdown === dropdownName ? null : dropdownName;
    },

    closeDropdown() {
      this.activeDropdown = null;
    },

    clearFilters() {
      this.searchQuery = "";
      this.selectedTypes = [];
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

  async mounted() {
    try {
      this.isLoading = true;
      const response = await fetchQuestionsByModule(this.mcode);

      if (response && response.questions && Array.isArray(response.questions)) {
        this.questions = response.questions;
        this.selectedModule = response.module
          ? response.module.name
          : "Unknown Module";
      } else {
        console.warn("Unexpected response format:", response);
        this.questions = [];
        this.selectedModule = "Unknown Module";
      }
    } catch (err) {
      console.error("Failed to load questions:", err.message);
      this.questions = [];
      this.selectedModule = "Error Loading Module";
    } finally {
      this.isLoading = false;
    }
  },

  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <ModuleHeader 
          :selectedModule="selectedModule"
          :filteredQuestionsCount="filteredQuestions.length"
          :activeFiltersCount="activeFiltersCount"
          @addQuestion="addQuestion"
        />
                <div class="row mb-4">
          <div class="col">
        <QuestionFilters
          title="Question Filters"
          searchPlaceholder="Search QCode..."
          :showModuleFilter="false"
          :showStatusFilter="true"
          :searchQuery="searchQuery"
          :selectedTypes="selectedTypes"
          :selectedModules="selectedModules"
          :selectedAges="selectedAges"
          :selectedStatuses="selectedStatuses"
          :questionTypes="questionTypes"
          :moduleOptions="moduleOptions"
          :ageGroups="ageGroups"
          :statusOptions="statusOptions"
          :activeFiltersCount="activeFiltersCount"
          :showFilters="showFilters"
          :activeDropdown="activeDropdown"
          @update:searchQuery="searchQuery = $event"
          @update:selectedTypes="selectedTypes = $event"
          @update:selectedModules="selectedModules = $event"
          @update:selectedAges="selectedAges = $event"
          @update:selectedStatuses="selectedStatuses = $event"
          @update:showFilters="showFilters = $event"
          @toggleDropdown="toggleDropdown"
          @closeDropdown="closeDropdown"
          @clearFilters="clearFilters"
        />
              </div>
        </div>
        <QuestionTable
          mode="simple"
          :paginatedQuestions="paginatedQuestions"
          :sortKey="sortKey"
          :sortOrder="sortOrder"
          :isLoading="isLoading"
          @goToQuestion="goToQuestion"
          @editQuestion="editQuestion"
          @archiveQuestion="archiveQuestion"
          @setSort="setSort"
        />
        
        <QuestionPagination
          mode="simple"
          :currentPage="currentPage"
          :totalPages="totalPages"
          :showingRangeText="showingRangeText"
          :isLoading="isLoading"
          @changePage="changePage"
        />
      </div>
    </div>
  `,
};
