import {
  fetchAllQuestions,
  restoreQuestion,
  deleteQuestion,
} from "../../services/questionService.js";
import { fetchModules } from "../../services/moduleService.js";
import { ArchivedQuestionsHeader } from "../utils/ArchivedQuestionsHeader.js";
import { ArchivedQuestionsStats } from "../utils/ArchivedQuestionsStats.js";
import { ArchivedQuestionsTable } from "../utils/ArchivedQuestionsTable.js";
import { RestoreModal } from "../utils/RestoreModal.js";
import { DeleteModal } from "../utils/DeleteModal.js";
import { BulkActionsModal } from "../utils/BulkActionsModal.js";
import  QuestionFilters  from "../utils/QuestionFilters.js";
import QuestionPagination  from "../utils/QuestionPagination.js";

export default {
  name: "ArchivedQuestionsPage",
  components: {
    ArchivedQuestionsHeader,
    ArchivedQuestionsStats,
    ArchivedQuestionsTable,
    RestoreModal,
    DeleteModal,
    BulkActionsModal,
    QuestionFilters,
    QuestionPagination,
  },
  data() {
    return {
      searchQuery: "",
      selectedTypes: [],
      selectedModules: [],
      selectedAges: [],
      selectedStatuses: [],
      questionTypes: ["MCQ","True/False"],
      moduleOptions: [],
      ageGroups: ["6-8", "9-11", "12-14", "15-18"],
      statusOptions: ["Archived", "Draft", "Published"],
      showFilters: true,
      currentPage: 1,
      questionsPerPage: 15,
      questions: [],
      selectedQuestions: [],
      sortField: "archived_date",
      sortDirection: "desc",
      activeDropdown: null,
      isLoading: false,
      isProcessing: false,
      showRestoreModal: false,
      showDeleteModal: false,
      showBulkActionsModal: false,
      currentQuestion: null,
      restoreComment: "",
      stats: {
        total: 0,
        thisMonth: 0,
        thisYear: 0,
        byReason: {},
      },
    };
  },
  computed: {
    archivedQuestions() {
      return this.questions.filter((q) => q.is_archived === true);
    },
    filteredQuestions() {
      return this.sortQuestions(
        this.archivedQuestions.filter((q) => {
          const matchesSearch =
            !this.searchQuery ||
            q.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            q.question_statement
              ?.toLowerCase()
              .includes(this.searchQuery.toLowerCase());
          const matchesType =
            this.selectedTypes.length === 0 ||
            this.selectedTypes.includes(q.question_type);
          const matchesModule =
            this.selectedModules.length === 0 ||
            this.selectedModules.includes(q.module_name);
          const matchesAge =
            this.selectedAges.length === 0 ||
            (q.age_group &&
              q.age_group.some((age) => this.selectedAges.includes(age)));
          const matchesStatus =
            this.selectedStatuses.length === 0 ||
            this.selectedStatuses.includes(q.status);

          return (
            matchesSearch &&
            matchesType &&
            matchesModule &&
            matchesAge &&
            matchesStatus
          );
        })
      );
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
    selectedQuestionsCount() {
      return this.selectedQuestions.length;
    },
  },
  mounted() {
    this.loadQuestions();
    this.loadModules();
  },
  methods: {
    async loadQuestions() {
      try {
        this.isLoading = true;
        const allQuestions = await fetchAllQuestions();
        this.questions = allQuestions.map((q) => ({
          ...q,
          archived_date:
            q.archived_date ||
            (q.is_archived ? new Date().toISOString() : null),
          archive_reason: q.archive_reason || "Other",
          archived_by: q.archived_by || "System",
        }));
        this.calculateStats();
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
    calculateStats() {
      const archived = this.archivedQuestions;
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();
      this.stats = {
        total: archived.length,
        thisMonth: archived.filter(
          (q) => new Date(q.archived_date).getMonth() === thisMonth
        ).length,
        thisYear: archived.filter(
          (q) => new Date(q.archived_date).getFullYear() === thisYear
        ).length,
        byReason: archived.reduce((acc, q) => {
          acc[q.archive_reason] = (acc[q.archive_reason] || 0) + 1;
          return acc;
        }, {}),
      };
    },
    sortQuestions(questions) {
      return questions.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];
        if (this.sortField === "archived_date") {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }
        return this.sortDirection === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });
    },
    sortBy(field) {
      this.sortDirection =
        this.sortField === field
          ? this.sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";
      this.sortField = field;
    },
    async restoreQuestion(question = null) {
      const target = question || this.currentQuestion;
      if (!target) return;
      try {
        this.isProcessing = true;
        await restoreQuestion(target.id, {
          restore_comment: this.restoreComment,
          restored_by: "Current User",
          restored_date: new Date().toISOString(),
        });
        const index = this.questions.findIndex((q) => q.id === target.qcode);
        if (index > -1) {
          this.questions[index] = {
            ...this.questions[index],
            status: "Draft",
            archived_date: null,
            archive_reason: null,
            archived_by: null,
          };
        }
        this.calculateStats();
        this.showRestoreModal = false;
        this.restoreComment = "";
        this.currentQuestion = null;
      } catch (error) {
        console.error("Restore failed:", error);
      } finally {
        this.isProcessing = false;
      }
    },
    async deleteQuestion(question = null) {
      const target = question || this.currentQuestion;
      if (!target) return;
      if (!confirm(`Delete question ${target.id}? This can't be undone.`))
        return;
      try {
        this.isProcessing = true;
        await deleteQuestion(target.id);
        this.questions = this.questions.filter((q) => q.id !== target.qcode);
        this.selectedQuestions = this.selectedQuestions.filter(
          (qcode) => qcode !== target.id
        );
        this.calculateStats();
        this.showDeleteModal = false;
        this.currentQuestion = null;
      } catch (error) {
        console.error("Delete failed:", error);
      } finally {
        this.isProcessing = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    toggleDropdown(name) {
      this.activeDropdown = name;
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
    },
    async bulkRestore() {
      if (this.selectedQuestions.length === 0) return;

      try {
        this.isProcessing = true;
        const promises = this.selectedQuestions.map((qcode) =>
          restoreQuestion(id, {
            restore_comment: this.restoreComment,
            restored_by: "Current User",
            restored_date: new Date().toISOString(),
          })
        );

        await Promise.all(promises);

        // Update local data
        this.selectedQuestions.forEach((qcode) => {
          const index = this.questions.findIndex((q) => q.qcode === qcode);
          if (index > -1) {
            this.questions[index] = {
              ...this.questions[index],
              status: "Draft",
              archived_date: null,
              archive_reason: null,
              archived_by: null,
            };
          }
        });

        this.selectedQuestions = [];
        this.calculateStats();
        this.showBulkActionsModal = false;
        this.restoreComment = "";
      } catch (error) {
        console.error("Failed to bulk restore:", error);
        alert("Some questions failed to restore. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },

    async bulkDelete() {
      if (this.selectedQuestions.length === 0) return;

      if (
        !confirm(
          `Are you sure you want to permanently delete ${this.selectedQuestions.length} questions? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        this.isProcessing = true;
        const promises = this.selectedQuestions.map((qcode) =>
          deleteQuestion(qcode)
        );

        await Promise.all(promises);

        // Remove from local data
        this.questions = this.questions.filter(
          (q) => !this.selectedQuestions.includes(q.qcode)
        );
        this.selectedQuestions = [];

        this.calculateStats();
        this.showBulkActionsModal = false;
      } catch (error) {
        console.error("Failed to bulk delete:", error);
        alert("Some questions failed to delete. Please try again.");
      } finally {
        this.isProcessing = false;
      }
    },
  },
  template: `
    <div class="min-vh-100 bg-gradient">
      <div class="container-fluid py-4">
      <div class="row mb-4">
        <div class="col">
        <ArchivedQuestionsHeader
          :filteredQuestionsCount="filteredQuestions.length"
          :selectedQuestionsCount="selectedQuestionsCount"
          :activeFiltersCount="activeFiltersCount"
          @show-bulk-actions="showBulkActionsModal = true"
        />   
        </div>
        </div>
        <ArchivedQuestionsStats :stats="stats" :selectedQuestionsCount="selectedQuestionsCount" />
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
        <ArchivedQuestionsTable
          :questions="paginatedQuestions"
          :selectedQuestions="selectedQuestions"
          :isLoading="isLoading"
          :isProcessing="isProcessing"
          :sortField="sortField"
          :sortDirection="sortDirection"
          @sort-by="sortBy"
          @toggle-selection="q => selectedQuestions.includes(q) ? selectedQuestions.splice(selectedQuestions.indexOf(q), 1) : selectedQuestions.push(q)"
          @view-question="goToQuestion"
          @restore-question="(q) => { currentQuestion = q; showRestoreModal = true }"
  @delete-question="(q) => { currentQuestion = q; showDeleteModal = true }"
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
        <RestoreModal
          :show="showRestoreModal"
          :currentQuestion="currentQuestion"
          v-model:restoreComment="restoreComment"
          :isProcessing="isProcessing"
          @close="showRestoreModal = false"
          @restore="restoreQuestion"
        />
        <DeleteModal
          :show="showDeleteModal"
          :currentQuestion="currentQuestion"
          :isProcessing="isProcessing"
          @close="showDeleteModal = false"
          @delete="deleteQuestion"
        />
        <BulkActionsModal
          :show="showBulkActionsModal"
          :selectedQuestionsCount="selectedQuestionsCount"
          v-model:restoreComment="restoreComment"
          :isProcessing="isProcessing"
          @close="showBulkActionsModal = false"
          @bulk-restore="bulkRestore"
          @bulk-delete="bulkDelete"
        />
      </div>
    </div>
  `,
};
