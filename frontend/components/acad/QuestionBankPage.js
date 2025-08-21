import {
  fetchAllQuestions,
  archiveQuestion,
} from "../../services/questionService.js";
import { fetchModules } from "../../services/moduleService.js";
import QuestionFilters from "../utils/QuestionFilters.js";
import QuestionTable from "../utils/QuestionTable.js";
import QuestionPagination from "../utils/QuestionPagination.js";
import ModuleHeader from "../utils/ModuleHeader.js";

export default {
  name: "QuestionBankPage",
  components: {
    ModuleHeader,
    QuestionFilters,
    QuestionTable,
    QuestionPagination,
  },
  data() {
    return {
      searchQuery: "",
      selectedTypes: [],
      selectedModules: [],
      selectedAges: [],
      selectedStatuses: [],
      questionTypes: ["MCQ", "True/False"],
      moduleOptions: [],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: ["Approved", "Rejected", "Pending", "Archived"],
      currentPage: 1,
      questionsPerPage: 15,
      questions: [],
      sortField: "id",
      sortDirection: "asc",
      activeDropdown: null,
      isLoading: false,
      showFilters: false,
    };
  },
  computed: {
    filteredQuestions() {
      let filtered = this.questions.filter(
        (q) =>
          q.id
            .toString()
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) &&
          q.is_archived === false &&
          (this.selectedTypes.length === 0 ||
            this.selectedTypes.includes(q.type)) &&
          (this.selectedModules.length === 0 ||
            this.selectedModules.includes(q.module_id)) &&
          (this.selectedAges.length === 0 ||
            q.age_group.some((age) => this.selectedAges.includes(age))) &&
          (this.selectedStatuses.length === 0 ||
            this.selectedStatuses.includes(this.getStatusLabel(q.is_approved)))
      );

      return filtered.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];
        if (this.sortField === "age_group") {
          aValue = a.age_group.join(", ");
          bValue = b.age_group.join(", ");
        }
        if (this.sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    },

    paginatedQuestions() {
      const start = (this.currentPage - 1) * this.questionsPerPage;
      return this.filteredQuestions.slice(start, start + this.questionsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredQuestions.length / this.questionsPerPage);
    },

    activeFiltersCount() {
      return (
        this.selectedTypes.length +
        this.selectedModules.length +
        this.selectedAges.length +
        this.selectedStatuses.length +
        (this.searchQuery ? 1 : 0)
      );
    },
  },

  mounted() {
    this.loadQuestions();
    this.loadModules();
  },

  methods: {
    getStatusLabel(is_approved) {
      if (is_approved === true) return "Approved";
      else if (is_approved === false) return "Rejected";
      else return "Pending";
    },

    async loadQuestions() {
      try {
        this.isLoading = true;
        this.questions = await fetchAllQuestions();
      } catch (err) {
        console.error("Failed to load questions:", err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async loadModules() {
      try {
        this.moduleOptions = await fetchModules();
      } catch (error) {
        console.error("Failed to load modules:", error);
        this.moduleOptions = [];
      }
    },

    goToQuestion(id) {
      this.$router.push(`/acad/question/${id}`);
    },

    editQuestion(id) {
      this.$router.push(`/acad/question/edit/${id}`);
    },

    async archiveQuestion(id) {
      try {
        await archiveQuestion(id);
        this.questions = this.questions.map((q) =>
          q.id === id ? { ...q, status: "Archived" } : q
        );
      } catch (err) {
        console.error(`Failed to archive ${id}:`, err.message);
      }
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortDirection = "asc";
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
      this.selectedModules = [];
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

  template: `
    <div class="min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid py-4">
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col">
            <ModuleHeader 
              selectedModule="Question Bank"
              :filteredQuestionsCount="filteredQuestions.length"
              :activeFiltersCount="activeFiltersCount"
            />
          </div>
        </div>
        
        <!-- Filters Section -->
        <div class="row mb-4">
          <div class="col">
            <QuestionFilters
              title="Advanced Filters"
              searchPlaceholder="Search by ID..."
              :showModuleFilter="true"
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
        
        <!-- Questions Table -->
        <div class="row">
          <div class="col">
            <QuestionTable
              mode="advanced"
              :paginatedQuestions="paginatedQuestions"
              :isLoading="isLoading"
              :sortField="sortField"
              :sortDirection="sortDirection"
              @goToQuestion="goToQuestion"
              @editQuestion="editQuestion"
              @archiveQuestion="archiveQuestion"
              @sortBy="sortBy"
            />
            
            <QuestionPagination
              mode="advanced"
              :currentPage="currentPage"
              :totalPages="totalPages"
              :questionsPerPage="questionsPerPage"
              :filteredQuestionsCount="filteredQuestions.length"
              :isLoading="isLoading"
              @changePage="changePage"
            />
          </div>
        </div>
      </div>
    </div>
  `,
};
