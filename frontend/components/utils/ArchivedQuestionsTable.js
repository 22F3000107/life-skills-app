import { QuestionTableRow } from "./QuestionTableRow.js";

export const ArchivedQuestionsTable = {
  name: "ArchivedQuestionsTable",
  components: {
    QuestionTableRow,
  },
  props: {
    questions: Array,
    selectedQuestions: Array,
    isLoading: Boolean,
    isProcessing: Boolean,
    sortField: String,
    sortDirection: String,
  },
  emits: [
    "sort-by",
    "toggle-selection",
    "select-all",
    "clear-selection",
    "view-question",
    "restore-question",
    "delete-question",
  ],
  computed: {
    allSelected() {
      return (
        this.questions.length > 0 &&
        this.selectedQuestions.length === this.questions.length
      );
    },
  },
  methods: {
    getSortIcon(field) {
      if (this.sortField !== field) return "bi-arrows-expand";
      return this.sortDirection === "asc"
        ? "bi-caret-up-fill"
        : "bi-caret-down-fill";
    },
    handleSelectAll() {
      if (this.allSelected) {
        this.$emit("clear-selection");
      } else {
        this.$emit("select-all");
      }
    },
  },
  template: `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);">
      <div class="card-header bg-transparent border-0 p-4">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold text-dark">Archived Questions</h5>
          <div class="d-flex gap-2">
            <button 
              v-if="questions.length > 0"
              class="btn btn-outline-primary"
              @click="handleSelectAll"
            >
              <i class="bi bi-check2-all me-2"></i>
              {{ allSelected ? 'Clear All' : 'Select All' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center p-5">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3 text-muted">Loading archived questions...</p>
        </div>

        <!-- Questions Table -->
        <div v-else class="table-responsive" style="border-radius: 20px;">
          <table class="table table-hover align-middle mb-0">
            <thead style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
              <tr>
                <th class="px-4 py-3 border-0">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    :checked="allSelected"
                    @change="handleSelectAll"
                  />
                </th>
                <th class="px-4 py-3 border-0" @click="$emit('sort-by', 'qcode')" style="cursor: pointer;">
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">QCode</span>
                    <i :class="getSortIcon('qcode')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0" @click="$emit('sort-by', 'question_statement')" style="cursor: pointer;">
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">Question</span>
                    <i :class="getSortIcon('question_statement')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center" @click="$emit('sort-by', 'archive_reason')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Archive Reason</span>
                    <i :class="getSortIcon('archive_reason')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center" @click="$emit('sort-by', 'archived_date')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Archived Date</span>
                    <i :class="getSortIcon('archived_date')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center" @click="$emit('sort-by', 'archived_by')" style="cursor: pointer;">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="fw-semibold">Archived By</span>
                    <i :class="getSortIcon('archived_by')"></i>
                  </div>
                </th>
                <th class="px-4 py-3 border-0 text-center">
                  <span class="fw-semibold">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <QuestionTableRow
                v-for="(question, index) in questions"
                :key="question.id"
                :question="question"
                :index="index"
                :isSelected="selectedQuestions.includes(question.id)"
                :isProcessing="isProcessing"
                @toggle-selection="$emit('toggle-selection', $event)"
                @view-question="$emit('view-question', $event)"
                @restore-question="$emit('restore-question', $event)"
                @delete-question="$emit('delete-question', $event)"
              />

              <!-- Empty State -->
              <tr v-if="questions.length === 0">
                <td colspan="7" class="text-center py-5">
                  <div class="empty-state">
                    <div class="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                      <i class="bi bi-archive fs-1 text-muted"></i>
                    </div>
                    <h5 class="text-muted mb-2">No archived questions found</h5>
                    <p class="text-muted mb-0">Try adjusting your search criteria or filters</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};
